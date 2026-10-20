/* eslint-disable no-unused-expressions */
/**
 * 与iframe窗口交互
 */
class MessageHandler {
  static allowOrigin = '*';

  static callbacks = {};

  static global = null;

  static iframe;

  static startFlag = false;

  /**
   * @description: 添加事件绑定
   * @param messageType 消息类型
   * @param callback 回调
   * @returns {MessageHandler}
   */
  static on(messageType, callback) {
    if (!messageType || !callback) return this;
    if (!this.callbacks[messageType]) {
      this.callbacks[messageType] = [];
    }
    this.callbacks[messageType].push(callback);
    return this;
  }

  /**
   * @description: 注册全局回调
   * @param {*} callback
   * @return {*}
   */
  static registerGlobal(callback) {
    this.global = callback;
    return this;
  }

  /**
   * @description: 取消事件绑定
   * @param {*} messageType
   * @param {*} callback
   * @return {*}
   */
  static cancel(messageType, callback) {
    if (callback && this.callbacks[messageType] && this.callbacks[messageType].length) {
      this.callbacks[messageType] = this.callbacks[messageType].filter((cb) => cb !== callback);
    } else {
      delete this.callbacks[messageType];
    }
    return this;
  }

  /**
   * @description: 监听管理
   * @param {*} event
   * @return {*}
   */
  static executeHandler = (event) => {
    const { data } = event;
    if (this.callbacks[data.type]) {
      this.callbacks[data.type].forEach((cb) => cb(data));
    }
    if (data.type) {
      this.global?.(data);
    }
  };

  /**
   * 开始监听消息
   */
  static start() {
    if (this.startFlag) return;
    this.startFlag = true;
    window.addEventListener('message', this.executeHandler, false);
  }

  /**
   * 销毁注册信息并移除监听
   */
  static destory() {
    this.startFlag = false;
    this.callbacks = {};
    this.iframe = undefined;
    window.removeEventListener('message', this.executeHandler, false);
  }

  /**
   * 向父窗口发送消息
   * @param {object} content 消息体
   */
  static postParentMessage(type, content = {}, dataKey = 'content') {
    window.parent.postMessage({ type, [dataKey]: content }, this.allowOrigin);
  }

  /**
   * 向iframe窗口发送信息
   * @param {object} message 消息体
   */
  static postIframeMessage(message = {}) {
    if (this.iframe) {
      this.iframe.contentWindow.postMessage(message, this.allowOrigin);
    }
  }
}

// 接收事件类型
export class Events {
  // 加载在线沟通房间
  static sendLoadChatRoom = 'LOAD_CHAT_ROOM';

  // 加载聊天壳子内容
  static sendLoadChatHub = 'SEND_LOAD_CHAT_HUB';

  // 收到助手消息
  static assistantMessage = 'ASSISTANT_MESSAGE';

  // 拖拽组件消息
  static getMenu = 'GET_MENU';

  // 获取拖拽信息
  static sendMenu = 'SEND_MENU';

  static sendCardMessage = 'SEND_CARD_MESSAGE';

  // 采购助手加载完成
  static sendPurchaseRobotLoaded = 'SEND_PURCHASE_ROBOT_LOADED';
}

// 发送事件类型
export class Messages {
  // 在线沟通组件页面加载完成
  static sendOnlineChatRoomMessage = 'SEND_ONLINE_CHAT_ROOM_MESSAGE';

  // 更新房间最后一条消息
  static sendUpdateChatRoomLastMessage = 'SEND_UPDATE_CHAT_ROOM_LAST_MESSAGE';

  // 获取壳子内容
  static getChatHubInfo = 'GET_CHAT_HUB_INFO';

  // 关闭壳子
  static closeChatHubIframe = 'CLOSE_IFRAME';

  // 拖拽组件消息
  static getMenu = 'GET_MENU';

  // 获取拖拽信息
  static sendMenu = 'SEND_MENU';

  // 打开新tab
  static openNewTab = 'OPEN_NEW_TAB';

  // 进入助手房间
  static sendPurchaseRobotRoomInMessage = 'SEND_PURCHASE_ROBOT_ROOM_IN_MESSAGE';
}

export default MessageHandler;
