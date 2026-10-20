import React, { Component } from 'react';
import { Modal, Button } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';

import { fetchChatRoomUnreadMessage } from '@/services/biddingHallService';

import ChatRoomSourcePage from './ChatRoomSourcePage';
import { initCommonChat } from './handleCommon';

import Styles from './index.less';

const CHAT_ROOM_REFRESH_INTERVAL = 15_000; // 聊天室未读消息轮询间隔

@observer
class ChatRoomSourceLink extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    this.timer = null;

    this.chatData = {};

    this.state = {
      chatRoomMessage: {},
      visible: false,
      roomParams: null,
    };
  }

  componentDidMount() {
    this.initChatRoom();
  }

  componentWillUnmount() {
    this.clearChatRoomUnreadWatcher();
    this.chatData = {};
  }

  getBusinessCode = () => {
    const { biddingFlag } = this.props;

    let code = 'source-rfx';

    if (
      biddingFlag === 1 ||
      biddingFlag === '1' ||
      biddingFlag === 'true' ||
      biddingFlag === true
    ) {
      code = 'source-bidding';
    }

    return code;
  };

  /**
   * 聊天室初始化后，需要告诉页面
   */
  postChatRoomMessage = (data = {}) => {
    // 判断是否在iframe中
    if (window.top !== window) {
      // 是
      window.parent.postMessage({
        type: 'source-chat',
        values: data,
      });
    } else {
      window.postMessage(
        {
          type: 'source-chat',
          values: data,
        },
        '*'
      );
    }

    window.postMessage(
      {
        type: 'source-chat',
        values: data,
      },
      '*'
    );
  };

  initChatRoom = async () => {
    const { roleCategory = 'PURCHASE', rfxHeaderId, quotationHeaderId } = this.props;

    const businessCodeCurrent = this.getBusinessCode();

    const newProps = {
      ...this.props,
      businessCode: businessCodeCurrent,
    };

    const data = await initCommonChat({
      rfxHeaderId,
      quotationHeaderId,
      organizationId: this.organizationId,
      pageProps: newProps,
      roleCategory,
      businessCode: businessCodeCurrent,
    });

    const { header, roomParams, visible } = data || {};

    if (!visible) {
      return;
    }

    this.chatData = data;
    this.rollingFetchChatRoomMsgNum(header);

    this.setState({
      visible,
      roomParams,
      // purchaseHeader: header,
    });

    this.postChatRoomMessage(data);
  };

  clearChatRoomUnreadWatcher = () => {
    clearInterval(this.timer);
  };

  fetchCharRoomUnRead = async (headerInfo) => {
    const { readOnly = false, roleCategory = 'PURCHASE' } = this.props;
    const { tenantId, companyId, rfxNum, supplierTenantId, supplierCompanyId } = headerInfo || {};
    const { chatRoomMessage } = this.state;
    const { id } = getCurrentUser() || {};

    const businessCodeCurrent = this.getBusinessCode();

    if (readOnly) {
      this.clearChatRoomUnreadWatcher();
      return;
    }

    let emptyRequiredFlag = false;
    let param = null;

    if (roleCategory === 'PURCHASE') {
      emptyRequiredFlag = !tenantId || !companyId || !id;
      param = {
        data: [
          {
            userId: id,
            tenantId,
            companyId,
            rooms: [
              {
                businessNo: rfxNum,
                businessCode: businessCodeCurrent,
                purchaseTenantId: tenantId,
              },
            ],
          },
        ],
      };
    }

    if (roleCategory === 'SUPPLIER') {
      emptyRequiredFlag = !supplierTenantId || !supplierCompanyId || !id || !tenantId;

      param = {
        data: [
          {
            userId: id,
            tenantId: supplierTenantId,
            companyId: supplierCompanyId,
            rooms: [
              {
                businessNo: rfxNum,
                businessCode: businessCodeCurrent,
                purchaseTenantId: tenantId,
              },
            ],
          },
        ],
      };
    }

    if (emptyRequiredFlag) {
      return;
    }

    let result = null;
    try {
      result = await fetchChatRoomUnreadMessage(param);
      result = getResponse(result);
      if (!result || isEmpty(result)) {
        return;
      }

      const { rooms = [] } = result[0] || {};
      const { unreadNums } = (rooms || [])[0] || {};

      if (isEmpty(unreadNums)) {
        return;
      }

      let nums = 0;
      unreadNums.forEach((msg) => {
        const { msgNum = 0, announcementNum = 0 } = msg || {};

        const allMessage = msgNum || 0 + announcementNum || 0;
        nums += allMessage;
      });

      const newMessageObj = {
        ...chatRoomMessage,
        unreadMsgNum: nums,
      };
      this.setState({
        chatRoomMessage: newMessageObj,
      });
    } catch (e) {
      throw e;
    }
  };

  rollingFetchChatRoomMsgNum = (headerInfo) => {
    this.fetchCharRoomUnRead(headerInfo);
    this.clearChatRoomUnreadWatcher();

    this.timer = setInterval(() => {
      this.fetchCharRoomUnRead(headerInfo);
    }, CHAT_ROOM_REFRESH_INTERVAL);
  };

  openChatRoom = async () => {
    const { roleCategory = 'PURCHASE' } = this.props;
    const { roomParams } = this.state;

    const businessCodeCurrent = this.getBusinessCode();

    const newProps = {
      ...this.props,
      businessCode: businessCodeCurrent,
      pageType: 'COMMON',
    };

    this.clearChatRoomUnreadWatcher();

    const modal = await Modal.open({
      key: Modal.key(),
      title: '',
      header: '',
      children: (
        <ChatRoomSourcePage
          {...newProps}
          roleCategory={roleCategory}
          cancelPageInitFlag={1}
          outRoomParams={roomParams}
        />
      ),
      className: Styles['ssrc-chat-room-modal-wrap'],
      style: { width: '742px' },
      drawer: true,
      closable: true,
      destroyed: true,
      resizable: true,
      footer: (okBtn) => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      onClose: this.closeChat,
    });

    return modal;
  };

  closeChat = () => {
    const { header = {} } = this.chatData || {};
    this.rollingFetchChatRoomMsgNum(header);
  };

  render() {
    const {
      hiddenFlag = 0,
      // uiType = 'C7N',
      otherButtonProps = {},
      readOnly = false,
      name = 'chat',
      buttonText = '',
      icon = '',
      loading = false,
    } = this.props;
    const { chatRoomMessage, visible } = this.state;
    const { unreadMsgNum = 0 } = chatRoomMessage || {};

    let text = readOnly
      ? intl.get('ssrc.common.view.message.chatRecord').d('聊天记录')
      : intl.get('ssrc.common.view.message.onlineChat').d('在线沟通');
    if (buttonText) {
      text = buttonText;
    }

    if (hiddenFlag || !visible) {
      return '';
    }

    return (
      <Button
        icon={icon || 'headset-o'}
        waitType="debounce"
        wait={500}
        funcType="flat"
        onClick={this.openChatRoom}
        name={name}
        loading={loading}
        {...otherButtonProps}
      >
        {text}
        <Badge count={unreadMsgNum} size="small" style={{ marginLeft: '4px' }} offset={[-5, 5]} />
      </Button>
    );
  }
}

export default ChatRoomSourceLink;
