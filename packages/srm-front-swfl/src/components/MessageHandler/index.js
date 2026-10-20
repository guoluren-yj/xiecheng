/**
 * 与iframe窗口交互
 */
class MessageHandler {
  static allowOrigin = '*';

  static callbacks = {};

  static iframe;

  /**
   * 添加事件绑定
   * @param messageType 消息类型
   * @param callback 回调
   * @returns {MessageHandler}
   */
  static on(messageType, callback) {
    this.callbacks[messageType] = callback;
    return this;
  }

  static handleMessage = (event) => {
    const { data } = event;
    if (this.callbacks[data.type]) {
      this.callbacks[data.type](event);
    }
  };

  /**
   * 开始监听消息
   */
  static start() {
    window.addEventListener('message', this.handleMessage, false);
  }

  /**
   * 移除监听消息
   */
  static end() {
    window.removeEventListener('message', this.handleMessage, false);
  }
}

export default MessageHandler;
