import React from 'react';
import PropTypes from 'prop-types';

export default class ChatProvider extends React.Component {
  // 向子组件传递context
  static childContextTypes = {
    chatInfo: PropTypes.object,
  };

  getChildContext() {
    return {
      chatInfo: this,
    };
  }

  // 服务类型
  chatType = null;

  // 窗口打开状态
  chatOpen = false;

  // 注册过的卡片
  loadedCardMap = {};

  setChatType = (value) => {
    this.chatType = value;
  };

  setChatOpen = (value) => {
    this.chatOpen = value;
  };

  addLoadedCard = (cardCode, cardData) => {
    this.loadedCardMap[cardCode] = cardData;
  };

  removeLoadedCard = (cardCode) => {
    this.loadedCardMap[cardCode] = null;
  };

  render() {
    return this.props.children;
  }
}
