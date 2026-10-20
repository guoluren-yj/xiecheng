import React, { Component } from 'react';
import { observer } from 'mobx-react';
import querystring from 'querystring';

// import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import EmptyDataIllustrate from '@/routes/ssrc/BiddingHall/components/EmptyDataIllustrate';
import { initCommonChat } from './handleCommon';

@observer
class ChatRoomSourcePage extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    if (props?.onRef) {
      props.onRef(this);
    }

    this.chatRoomRef = null;

    this.state = {
      visible: false,
      roomParams: null,
      // purchaseHeader: {},
      // supplierHeader: {},
    };
  }

  componentDidMount() {
    this.initChatRoom();
  }

  /**
   * 如果是弹窗，链接，数据不从上游组件，从路径
   */
  getDataFromPath = () => {
    const { href, location: { search } = {}, pageType = '', history } = this.props;

    let searchData = querystring.parse(search?.substr(1));

    // 外部以弹窗形式嵌套
    if (!history && href) {
      const modalLinkSearch = querystring.parse(href.substr(href.indexOf('?') + 1, href.length));
      const { pageType: currentModalLinkPageType } = modalLinkSearch || {};

      if (currentModalLinkPageType === 'MODAL') {
        searchData = modalLinkSearch;
      }
    }

    if (pageType === 'COMMON') {
      searchData = this.props;
    }

    searchData = searchData || {};

    return searchData;
  };

  /**
   * 聊天室初始化后，需要告诉页面
   */
  postChatRoomMessage = (data = {}) => {
    // 判断是否在iframe中
    if (window.top !== window) {
      // 是
      window.parent.postMessage(
        {
          type: 'source-chat',
          values: data,
        },
        '*'
      );
    } else {
      window.postMessage(
        {
          type: 'source-chat',
          values: data,
        },
        '*'
      );
    }
  };

  /**
   * 通过按钮打开聊天室，由于外部已经做了一系列初始化，为了优化， 数据从外部获取
   */
  initChatRoom = async () => {
    const { cancelPageInitFlag = 0, outRoomParams } = this.props;
    const outerData = this.getDataFromPath();
    const { roleCategory = 'PURCHASE', quotationHeaderId, rfxHeaderId } = outerData;

    if (cancelPageInitFlag) {
      this.setState({
        visible: true,
        roomParams: outRoomParams,
      });
      return;
    }

    const data = await initCommonChat({
      quotationHeaderId,
      rfxHeaderId,
      organizationId: this.organizationId,
      pageProps: outerData,
      roleCategory,
    });

    const {
      // header,
      roomParams,
      visible,
    } = data || {};

    if (!visible) {
      return;
    }

    this.setState({
      visible,
      roomParams,
      // supplierHeader: header,
    });

    this.postChatRoomMessage(data);
  };

  setChatRoomRef = (ref) => {
    this.chatRoomRef = ref;
  };

  render() {
    const outerData = this.getDataFromPath();
    const { businessCode = 'source-rfx', pageType } = outerData;
    const { visible, roomParams } = this.state;

    const chatRoomStyle = { width: '100%', height: '100%' };
    // 个性化弹窗高度被改了，需要内容撑
    if (pageType === 'MODAL') {
      chatRoomStyle.height = 'calc(100vh - 80px)';
    }

    if (!visible) {
      return (
        <div style={chatRoomStyle}>
          <EmptyDataIllustrate />
        </div>
      );
    }

    if (!roomParams) {
      return '';
    }

    return (
      <div style={{ width: '100%', height: '100%' }} className="ssrc-chat-room-wrapper">
        <ChatRoom
          contentStyle={chatRoomStyle}
          contentClass="ssrc-chat-room-content"
          pageStyle="cover"
          businessCode={businessCode}
          roomParams={roomParams}
          onRef={this.setChatRoomRef}
        />
      </div>
    );
  }
}

export default ChatRoomSourcePage;
