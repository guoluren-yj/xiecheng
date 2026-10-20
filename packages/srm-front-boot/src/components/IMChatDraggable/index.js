import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { withRouter } from 'dva/router';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import './index.less';
import { getBindSupplierUrl } from '@/services/mobileConfig';
import MessageHandler from '@/components/Message/message-handler';

@withRouter
export default class IMChatDraggable extends Component {
  copyNode = null;

  maskNode = null;

  dragFlag = false;

  static contextTypes = {
    chatInfo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.draggable = React.createRef();
    // 取当前页面路径作为 cardCode 前缀
    this.registerCardCode = props.location.pathname;
    this.state = {
      hasBuyService: null,
    };
  }

  render() {
    const { icon, iconColor, tooltip, draggable = true } = this.props;
    const { hasBuyService } = this.state;
    const { chatInfo = {} } = this.context;
    const { chatType = null } = chatInfo;
    return (
      <>
        <div
          ref={(el) => {
            this.draggable = el;
          }}
          className="web-chat-draggable"
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove}
          style={{
            cursor: !draggable ? 'not-allowed' : hasBuyService || chatType ? 'pointer' : 'default',
          }}
        >
          {hasBuyService || chatType ? (
            <>
              <Tooltip
                title={
                  !draggable
                    ? `${intl.get('hzero.common.message.unableToDrop').d('不可拖拽')}`
                    : tooltip ||
                      `${intl.get('hzero.common.message.releaseToDrop').d('拖放到区域内发送')}`
                }
              >
                <div style={{ width: 'fit-content' }}>
                  <Icon
                    type={icon || 'baseline-drag_indicator'}
                    style={{
                      color: iconColor || 'rgba(0,0,0,0.25)',
                      margin: '-4px 4px 0 -4px',
                    }}
                  />
                  {Array.isArray(this.props.children)
                    ? this.props.children.map((child) => {
                        return child;
                      })
                    : this.props.children && this.props.children}
                </div>
              </Tooltip>
            </>
          ) : (
            <>
              <div style={{ width: 'fit-content' }}>
                {Array.isArray(this.props.children)
                  ? this.props.children.map((child) => {
                      return child;
                    })
                  : this.props.children && this.props.children}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  componentDidMount = () => {
    MessageHandler.on('send_chatType', this.handleHasBuyService).start();
    this.registerCard();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.requestBody !== this.props.requestBody) {
      this.registerCard({ requestBody: nextProps.requestBody });
    }
  }

  componentWillUnmount() {
    MessageHandler.cancel('send_chatType', this.handleHasBuyService);
    this.unregisterCard();
  }

  registerCard = (newCardProps = {}) => {
    const { cardCode, cardType, showDetail = false, requestBody } = this.props;
    const { chatInfo = {} } = this.context;
    const { chatType = null } = chatInfo;
    if (cardCode && showDetail && chatInfo && chatInfo.addLoadedCard) {
      chatInfo.addLoadedCard(this.registerCardCode, {
        cardCode,
        cardType,
        serviceType: chatType,
        requestBody,
        ...newCardProps,
      });
    }
  };

  unregisterCard = () => {
    const { cardCode, showDetail = false } = this.props;
    const { chatInfo = {} } = this.context;
    if (showDetail && chatInfo && chatInfo.removeLoadedCard) {
      chatInfo.removeLoadedCard(this.registerCardCode);
    }
  };

  handleHasBuyService = (event) => {
    this.setState({
      hasBuyService: event.data.chatTypeValue,
    });
  };

  handleChatType = (clientX, clientY) => {
    const { chatInfo = {} } = this.context;
    const { chatType = null } = chatInfo;
    const { cardCode, cardType, requestBody } = this.props;
    const params = {
      organizationId: getCurrentOrganizationId(),
      cardCode,
      cardType,
      serviceType: chatType,
    };
    getBindSupplierUrl(params, {
      action: 'DRAG',
      ...(typeof requestBody === 'function' ? requestBody() : requestBody),
    }).then((res) => {
      if (res) {
        const msg = {
          msgTitle: res.cardTitle,
          msgDesc: res.cardDesc,
          msgUrl: res.cardUrl,
          msgIcon: res.cardLogo,
          msgInfo: res,
          msgType: cardType || 'MSG',
        };
        window.postMessage(
          {
            type: 'mouseUp',
            clientX,
            clientY,
            resStatus: { status: res.failed, message: res.message },
            content: this.props.dragData,
            cardMsg: msg,
          },
          '*'
        );
      }
    });
  };

  @Bind
  onMouseDown() {
    // 判断能否拖拽以及聊天窗口是否打开
    const { dragText, draggable = true } = this.props;
    if (!draggable) {
      return false;
    }
    const { chatInfo = {} } = this.context;
    const { chatType = null } = chatInfo;
    if (!chatType) {
      return;
    }

    this.copyNode = this.draggable.cloneNode(true);
    this.maskNode = document.createElement('div');
    this.maskNode.style.height = '100%';
    this.maskNode.style.width = '100%';
    this.maskNode.style.position = 'fixed';
    this.maskNode.style.top = '0';
    this.maskNode.style.left = '0';
    this.maskNode.style.zIndex = 99999;
    if (dragText) {
      this.copyNode.innerHTML = dragText;
    }
    this.copyNode.style.position = 'fixed';
    this.copyNode.style.zIndex = '10000';
    this.dragFlag = true;
    document.body.appendChild(this.copyNode);
    document.body.appendChild(this.maskNode);
    document.body.addEventListener('mousemove', this.onMouseMove);
    document.body.addEventListener('mouseup', this.onMouseUp);
    document.body.addEventListener('mouseleave', this.onMouseUp);
    window.postMessage({ type: 'mouseDown' }, '*');
  }

  @Bind
  onMouseMove(event) {
    if (this.dragFlag) {
      this.copyNode.style.left = `${event.clientX}px`;
      this.copyNode.style.top = `${event.clientY}px`;
    }
  }

  @Bind
  onMouseUp(event) {
    const { chatInfo = {} } = this.context;
    const { chatOpen = false } = chatInfo;
    if (!chatOpen) {
      window.postMessage({ type: 'mouseUp' }, '*');
      if (document.body.contains(this.copyNode)) {
        document.body.removeChild(this.copyNode);
        document.body.removeChild(this.maskNode);
      }
      // add
      this.dragFlag = false;
      this.copyNode = null;
      document.body.removeEventListener('mousemove', this.onMouseMove);
      document.body.removeEventListener('mouseup', this.onMouseUp);
      document.body.removeEventListener('mouseleave', this.onMouseUp);
      return;
    }
    if (this.context && chatInfo && chatOpen) {
      // 请求卡片信息
      this.handleChatType(event.clientX, event.clientY);
    }

    if (document.body.contains(this.copyNode)) {
      document.body.removeChild(this.copyNode);
      document.body.removeChild(this.maskNode);
    }

    // add
    this.dragFlag = false;
    this.copyNode = null;
    document.body.removeEventListener('mousemove', this.onMouseMove);
    document.body.removeEventListener('mouseup', this.onMouseUp);
    document.body.removeEventListener('mouseleave', this.onMouseUp);
  }
}

const serviceType =
  sessionStorage.getItem('serviceType') === 'null' ? null : sessionStorage.getItem('serviceType');

export { serviceType };
