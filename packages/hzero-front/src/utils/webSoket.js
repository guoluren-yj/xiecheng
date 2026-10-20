/**
 * websocket 监听
 * 注意 webSocketManager 在 Layout 中 完成 初始化(initWebSocket) 和 销毁(destroyWebSocket)
 *
 * @example
 *  import webSocketManager from 'utils/webSoket';
 *  class ComponentA extends React.Component {
 *
 *    @Bind()
 *    handleHmsgWebListenWebSocket(data) {
 *      const { key, type, ...rest } = data;
 *      switch(type) {
 *        case 'S':
 *          // 这个websocket消息只发送给了这一个客户端
 *        case 'U':
 *          // 这个websocket消息发送给了这个用户的所有客户端
 *        case 'A':
 *          // 这个websocket消息发送给了所有监听
 *      }}
 *      this.setState({
 *        websocketData: res,
 *      });
 *    }
 *
 *    @Bind()
 *    handleRemoveAllListenClick() {
 *      webSocketManager.removeAllListeners('hmsg-web');
 *    }
 *
 *    componentDidMount() {
 *      webSocketManager.addListener('hmsg-web', this.handleHmsgWebListenWebSocket);
 *    }
 *
 *    componentWillUnmount() {
 *      webSocketManager.removeListener('hmsg-web', this.handleHmsgWebListenWebSocket);
 *    }
 *
 *  }

 */
import { isFunction, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import EventEmitter from 'event-emitter';

import SockJs from 'sockjs-client';
import { getEnvConfig } from 'utils/iocUtils';

import { getAccessToken, getSRMAccessCode, getCurrentTenant } from 'utils/utils';

const { WEBSOCKET_URL, AUTO_API_HOST } = getEnvConfig();
/**
 * 标志这 socket 的状态
 * unInit:  没有初始化
 * error:   出现错误(建立连接)
 * init:    初始化成功
 * close:   关闭
 * @type {{init: number, error: number, close: number, unInit: number}}
 */
const SocketStatus = {
  unInit: 0,
  error: 2,
  close: 4,
  init: 32,
  count: 5,
};

class WebSocketManagener {
  eventManagener = new EventEmitter();

  socketStatus = SocketStatus.unInit;

  count = 0;

  // 心跳包的定时器
  heartbeatPackageTimer;

  componentWillUnmount() {
    if (this.heartbeatPackageTimer !== undefined) {
      clearInterval(this.heartbeatPackageTimer);
      this.heartbeatPackageTimer = undefined;
    }
  }

  /**
   * 发送心跳包
   */
  @Bind()
  intervalHeartbeatPackage() {
    if (!this.socket) {
      this.initWebSocket();
    } else if (this.socket.readyState !== 1) {
      if (this.count > SocketStatus.count) {
        this.destroyWebSocket();
      } else {
        this.initWebSocket();
      }
    } else {
      this.socket.send('hzero-hi');
    }
  }

  @Bind()
  handleSocketOpen() {
    this.socketStatus = SocketStatus.init;
    if (this.socket) {
      this.socket.send(getAccessToken());
    }
    this.heartbeatPackageTimer = setInterval(this.intervalHeartbeatPackage, 45000);
    this.count = 0;
  }

  /**
   * 当webSocket返回信息时执行
   * @param {Object} message 返回对象
   */
  @Bind()
  handleSocketMessage(message) {
    const res = JSON.parse(message.data || {});
    if (res) {
      this.eventManagener.emit(`${res.key}`, res);
    }
  }

  /**
   * 关闭webSocket连接
   */
  @Bind()
  destroyWebSocket() {
    try {
      this.socket.close();
      this.socket = null;
    } catch (e) {}
    this.socketStatus = SocketStatus.close;
    if (this.heartbeatPackageTimer !== undefined) {
      clearInterval(this.heartbeatPackageTimer);
      this.heartbeatPackageTimer = undefined;
    }
  }

  /**
   * 监听到 websocket 关闭连接
   */
  @Bind()
  handleSocketClose() {
    this.socketStatus = SocketStatus.close;
    // if (this.heartbeatPackageTimer !== undefined) {
    //   clearInterval(this.heartbeatPackageTimer);
    //   this.heartbeatPackageTimer = undefined;
    // }
    if (!this.heartbeatPackageTimer) {
      this.heartbeatPackageTimer = setInterval(this.intervalHeartbeatPackage, 45000);
    }
    this.count += 1;
  }

  /**
   * 增加监听事件
   */
  @Bind()
  addListener(type, handler) {
    if (isString(type) && isFunction(handler)) {
      this.eventManagener.on(type, handler);
    }
  }

  /**
   * 移除监听事件
   */
  @Bind()
  removeListener(type, handler) {
    if (isString(type) && isFunction(handler)) {
      this.eventManagener.off(type, handler);
    }
  }

  /**
   * 移除所有监听事件
   */
  @Bind()
  removeAllListeners(type) {
    if (isString(type)) {
      this.eventManagener.off(type);
    }
  }

  /**
   * 建立 webSocket 连接
   */
  async initWebSocket() {
    const accessToken = getAccessToken();
    const _sac = await getSRMAccessCode();
    if (WEBSOCKET_URL === 'BUILD_WEBSOCKET_URL' || !WEBSOCKET_URL) {
      this.socketStatus = SocketStatus.unInit;
      // console.error('websocket 未配置');
      this.socket = {
        close: () => {},
      };
    } else {
      try {
        if (this.socket) {
          this.destroyWebSocket();
        }
        let url = WEBSOCKET_URL;
        const { tenantNum } = getCurrentTenant() || {};
        // 深信租户服特殊逻辑
        if (tenantNum === 'SRM-SANGFOR') {
          const { protocol, host } = window.location;
          url = `${protocol}//${host}/hpfm/sock-js`;
        }
        this.socket = _sac
          ? new SockJs(`${url}?_sac=${_sac}`, null, { timeout:5000 })
          : new SockJs(`${url}?access_token=${accessToken}`, null, { timeout:5000 });
        if (this.socket) {
          this.socket.onopen = this.handleSocketOpen;
          this.socket.onmessage = this.handleSocketMessage;
          this.socket.onclose = this.handleSocketClose;
        }
      } catch (err) {
        // 不在页面显示websocket连接失败
        // console.error(
        //   intl.get('hzero.common.notification.error.webSocket').d('webSocket连接失败!')
        // );
        this.socketStatus = SocketStatus.error;
        this.socket = {
          close: () => {},
        };
      }
    }
  }

  @Bind()
  sendMessage(service, key, data) {
    if (this.socketStatus === SocketStatus.init) {
      this.socket.send(
        JSON.stringify({
          service,
          key,
          message: JSON.stringify(data),
        })
      );
    }
  }

  @Bind()
  sendOnlyMessage(message) {
    if (this.socketStatus === SocketStatus.init) {
      this.socket.send(
        message
      );
    }
  }

}

const webSocketManagener = new WebSocketManagener();

export default webSocketManagener;
