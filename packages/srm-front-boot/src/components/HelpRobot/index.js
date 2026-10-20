/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Bind, Throttle, Debounce } from 'lodash-decorators';
import { isEmpty, isNil } from 'lodash';
import { Modal, Icon, Tooltip } from 'hzero-ui';
import { Button, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import {
  getCurrentUserId,
  getCurrentUser,
  getCurrentTenant,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getResponse,
} from 'utils/utils';
import request from 'utils/request';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getEnvConfig } from 'utils/iocUtils';
import { openTab } from 'utils/menuTab';
import { checkPermission } from 'hzero-front/lib/services/api';

import webSocket from 'hzero-front/lib/utils/webSoket';
import { SRM_PLATFORM, HELPROBOT_WECHAT_ICON, SRM_ADAPTOR } from '@/utils/config';
import { axios } from '../../utils/c7nUiConfig';
import illustrator from '@/assets/illustrator.svg';
// import { ChatContext, setChatType, setChatOpen } from '../ChatContext';
import OnlineTools from './OnlineTools';
import MoveWidthUnit from './MoveWidthUnit';
import './index.less';

import MessageHandler, { postMessage } from '@/components/Message/message-handler';
import { Events } from '../Message/message-handler';

const { HELP_ROBOTR_URL } = getEnvConfig();
const helpRobotImgSize = 40;
const initModalWidth = 910;
@formatterCollections({ code: ['srm.helpRobot'] })
export default class HelpRobot extends React.Component {
  draggingFlag = false;
  lastClientX = 0;
  lastClientY = 0;
  itemDropTimeout = 10;
  itemDropFlag = false;

  // static contextType = ChatContext;
  static contextTypes = {
    chatInfo: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.iframe = null;
    this.parentNode = React.createRef();
    this.state = {
      modalVisible: false,
      helpRobotUrl: HELP_ROBOTR_URL,
      helpRobotType: null, // 机器人类型
      defaultShow: true, // 默认展示
      controlFlag: true, // 控制显示隐藏
      firstShow: true, // 首次打开
      noticeShow: false, // 控制提示展示
      custmoizePosition: null,
      isDestroyModal: true,
      display: false,
      device: '',
      partnerDTOS: [],
      wechatModalVisible: false, //是否显示微信客服二维码
      wechatUrl: '', //微信客服二维码链接
      wechatMsg: '', //微信客服没有额度时的提示信息
      wechatCode: '', //接口对应返回code
      dragFlag: false,
      loginStatus: localStorage.getItem('loginStatus') === 'true' ? true : false,
      spinValue: false,
      modelWidth: initModalWidth,
      dragModalWidth: false,
      isMoving: false,
      enabledFlag: false, // 是否启用在线客服
      enabledCloopmFlag: false, // 是否启用在线提单
      yqyPassUrl: null, // 燕千云免密登陆地址
      enabledPurHelper: false, // 是否显示采购助手
      enabledAIChat: false, // 是否显示新AI助理
      showChatOnline: false, // 即刻3.0在线沟通是否显示
      purchaseHelpServices: [], // 即刻3.0服务编码
      purHelperIcon: null, // 采购助手图标
      yqyGateway: '', // 燕千云环境域名
      aiOpenFlag: false, // AI助理是否显示
      enableSupplierRobot: false, // 是否显示供应商机器人
    };

    this.noticeData = {
      /**
       * 当前存在新消息的聊天类型
       * 考虑到目前悬浮按钮有多个聊天入口
       * 用set记录是哪个入口的新消息
       */
      whichMsg: new Set(),
      // 是否具有浏览器通知权限
      browserNotice: false,
      intervalId: undefined,
    };

    // 即刻3.0壳子所需参数
    this.chatHubParams = {};

    // 文档的原始标题，只读
    Object.defineProperty(this.noticeData, 'originTitle', {
      value: document.title,
      configurable: false,
      enumerable: true,
      writable: false,
    });

    try {
      if (Notification) {
        Notification.requestPermission().then((value) => {
          if (value === 'granted') this.noticeData.browserNotice = true;
        });
      }
    } catch (e) {
      // noop
    }
  }

  // 监听智能客服api接口消息
  componentWillMount() {
    window.addEventListener('message', this.onFrameMsg.bind(this), false);
  }

  // 卸载智能客服api接口消息
  componentWillUnmount() {
    window.removeEventListener('message', this.onFrameMsg.bind(this), false);
    MessageHandler.destory();
    webSocket.removeListener('JIKE-NOTICE', this.handleWsMsg);
  }

  componentDidMount() {
    this.getDevice();
    this.showRobot();
    webSocket.addListener('JIKE-NOTICE', this.handleWsMsg);
    // 获取服务类型
    if (HELPROBOT_WECHAT_ICON === 'true') {
      this.queryService();
    }
    // 是否显示智能客服及显示类型
    this.checkHelpRobotType().then((res) => {
      if (!isNil(res)) {
        this.setState({
          helpRobotType: res.enabledFlag === 1 ? 'yqy' : 'default',
          enabledFlag: res.enabledFlag === 1,
          enabledCloopmFlag: res.enabledCloopmFlag === 1,
          yqyGateway: res.yqcGateway,
        });
        if (res.enabledCloopmFlag === 1) {
          // 获取燕千云免密登陆链接
          this.getYqcloudPassLink();
        }
      }
    });
    this.queryIsOpenAi();
    this.queryIsEnableSupplierRobot();
    if (isTenantRoleLevel()) {
      this.getSetting().then((res) => {
        const result = getResponse(res);
        if (!isEmpty(result)) {
          this.setState({
            display: result.settingValue === '1' ? false : true,
          });
        }
        // res 为空时候，默认展示
        if (isEmpty(res)) {
          this.setState({
            display: true,
          });
        }
      });
    }

    MessageHandler.iframe = this.iframe;
    MessageHandler.on('mouseDown', this.handleChatDragStart)
      .on('mouseUp', this.handleChatDragEnd)
      .on('CLOSE_IFRAME', () => this.handleOpenWechatModal(false))
      .on('SET_LOGIN_STATUS', this.handleLoginStatus)
      .on('OPEN_NEW_TAB', this.handleNewTab)
      .on('THEME_CONFIG', this.onThemeConfig)
      .on('GET_HOST', this.onGetHost)
      .on('GET_CHAT_HUB_INFO', this.onGetChatHubInfo)
      .start();
  }

  @Bind()
  queryIsEnableSupplierRobot() {
    request(`${SRM_PLATFORM}/v1/cust-service-configs/show-supplier-robot`, {
      method: 'GET',
    }).then((res) => {
      if (res) {
        this.setState({
          enableSupplierRobot: res,
        });
      }
    });
  }

  @Bind()
  queryIsOpenAi() {
    const { tenantId } = getCurrentTenant() || {};
    request(`${SRM_PLATFORM}/v1/${tenantId}/application-market-client/has-open-ai`, {
      method: 'GET',
    }).then((res) => {
      if (res) {
        this.setState({
          enabledAIChat: res,
        });
      }
    });
  }

  @Bind()
  showRobot() {
    setTimeout(() => {
      this.setState({ defaultShow: false });
    }, 3000);
  }

  @Bind()
  checkHelpRobotType() {
    return request(`${SRM_PLATFORM}/v1/cust-service-configs/${getCurrentUserId()}/new`);
  }

  @Bind()
  getYqcloudPassLink() {
    const { tenantId, tenantNum } = getCurrentTenant() || {};
    request(
      `${SRM_ADAPTOR}/v1/${tenantId}/marmot-organization-api/yqy_url_service?tenantNum=${tenantNum}`,
      {
        method: 'POST',
        body: {
          yqyUrl: window.$$env.YQCLOUD_PASS_URL,
        },
      }
    ).then((res) => {
      if (getResponse(res)) {
        this.setState({
          yqyPassUrl: (res || {}).url,
        });
      }
    });
  }

  // 获取对应服务类型
  queryService = () => {
    this.getPurchaseHelperService('spfm').then((res) => {
      if (
        getResponse(res) &&
        res &&
        (res?.services?.length > 0 || res.showChatOnline || res.aiOpenFlag)
      ) {
        this.setState({
          enabledPurHelper: true,
          showChatOnline: res.showChatOnline,
          aiOpenFlag: res.aiOpenFlag,
          purchaseHelpServices: res.services || [],
          purHelperIcon: res.iconUrl,
        });
        this.updateChatHubParams({ hasBuyPurchase: res });
        this.queryOfflineMessage();
        if (['JIKE_NLP_ALI_V1', 'JIKE_NLP_WULAI_V1'].some((key) => res?.services?.includes(key))) {
          const chatTypeValue = 'WECHAT';
          // 将服务类型存储至sessionStorage,以便export该值
          sessionStorage.setItem('serviceType', chatTypeValue);
          // 服务类型传值
          window.postMessage({ type: 'send_chatType', chatTypeValue: chatTypeValue }, '*');
          if (this.context && this.context.chatInfo) {
            this.context.chatInfo.setChatType(chatTypeValue);
          }
        }
      }
    });
  };

  // 查询是否存在离线消息并提示
  queryOfflineMessage() {
    if (!isTenantRoleLevel()) return;
    axios.get('/spfm/v1/mobile/fetch-jike-notice').then((res) => {
      if (res == true) {
        this.noticeData.whichMsg.add('default');
        this.forceUpdate();
      }
    });
  }

  handleWsMsg = (data) => {
    /**
      用户：
      在线：浏览器页签提示
      不在线：红点＋浏览器页签提示＋浏览器弹窗

      客服：在线：浏览器页签提示
      不在线：浏览器页签提示+浏览器弹窗
      data.message: {
        "role": customer/user, 客服/用户
        "online": true/false, 在线/不在线
        "content": "新消息提醒", 浏览器弹窗提醒内容
      }
     */
    let { message } = data;
    if (typeof message === 'string') {
      try {
        message = JSON.parse(message);
      } catch {}
    }
    this.activeMsgNotice(message);
  };

  activeMsgNotice = (message) => {
    const { role, onLine, content } = message;
    let count = 0;
    clearInterval(this.noticeData.intervalId);
    if (content) {
      this.noticeData.intervalId = setInterval(() => {
        if (count > 6) {
          document.title = this.noticeData.originTitle;
          clearInterval(this.noticeData.intervalId);
          this.noticeData.intervalId = undefined;
        }
        if (!(count % 2)) document.title = content;
        else document.title = this.noticeData.originTitle;
        count++;
      }, 1000);
    }

    if (!onLine) {
      if (this.noticeData.browserNotice) {
        new Notification(content);
      }
      if (role === 'normal_user') {
        // 暂时没有区分聊天消息类别，用default代替
        this.noticeData.whichMsg.add('default');
        this.forceUpdate();
      }
    }
  };

  cancelMsgNotice = () => {
    // 暂时没有区分聊天消息类别，用default代替
    this.noticeData.whichMsg.delete('default');
    this.forceUpdate();
  };

  @Bind()
  getSetting() {
    return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/settings/000114`);
  }

  getService = (value) => {
    return request(
      `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-buy`
    );
  };

  getPurchaseHelperService = (value) => {
    return request(
      `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-buy-purchase`
    );
  };

  @Bind()
  handleOpenModal() {
    const { helpRobotType } = this.state;
    if (helpRobotType !== 'yqy') {
      this.handleModalVisible(true);
    }
  }

  // 打开/关闭微信客服
  handleOpenWechatModal = (value) => {
    this.setState({ wechatModalVisible: value });
    this.updateCtxChatOpen(value);
  };

  updateCtxChatOpen = (value) => {
    if (this.context && this.context.chatInfo) {
      this.context.chatInfo.setChatOpen(value);
    }
  };

  // 判断是否登录，没登陆下显示二维码，已登录显示聊天窗口
  handleLoginStatus = (event) => {
    localStorage.setItem('loginStatus', event.data.content);
    this.setState({ loginStatus: event.data.content });
  };

  @Bind()
  handleNewTab = (event) => {
    if (event && event.data && event.data.tabInfo) {
      try {
        const tabJson = event.data.tabInfo;
        openTab(tabJson);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // 设置微信客服二维码链接及接口false下返回的msg
  setWechatUrl = (value = '', msg = '', code = '') => {
    this.setState({ wechatUrl: value, wechatMsg: msg, wechatCode: code });
  };
  setSpinValue = (value) => {
    this.setState({ spinValue: value });
  };

  setControlFlag = () => {
    const { controlFlag } = this.state;
    this.setState({
      controlFlag: !controlFlag,
    });
  };

  @Bind()
  handleModalVisible(flag = false, destroyFlag = true) {
    const { helpRobotUrl } = this.state;
    if (helpRobotUrl) {
      this.setState({
        modalVisible: flag,
        isDestroyModal: destroyFlag,
      });
    } else {
      notification.error({
        message: intl.get('srm.helpRobot.view.message.error').d('智能客服失去连接...'),
      });
    }
  }

  @Bind()
  renderZCRobot() {
    const element = document.getElementById('zhichiScript');
    const { loginName } = getCurrentUser();
    const { device } = this.state;
    // 防止重复运行
    if (!element) {
      (function (w, d, e, x) {
        w[e] = function () {
          w.cbk = w.cbk || [];
          w.cbk.push(arguments);
        };
        x = d.createElement('script');
        x.async = true;
        x.id = 'zhichiScript';
        x.className = 'help-robot-img';
        x.src =
          'https://goinglink.sobot.com/chat/frame/v2/entrance.js?sysnum=4048160904314c57affa35f46daf9d4d';
        d.body.appendChild(x);
      })(window, document, 'zc');
      zc('config', {
        custom: true, // 设置自定义生效 第二步
        partnerid: loginName,
        show_evaluate: 0,
        params: JSON.stringify({
          device,
          webUrl: window.location.host,
        }),
      });
    }
  }

  onFrameMsg(e) {
    // 只关闭不重新加载
    if (e.data.type === 'MIN_CHAT') {
      // 隐藏iframe...
    }
    // 关闭并刷新frame
    else if (e.data.type === 'END_CHAT') {
      // 清空iframe的src地址以重新加载
      this.setState(
        {
          url: '',
        },
        () => {
          this.closeRobot();
        }
      );
    }
  }

  onThemeConfig = () => {
    MessageHandler.postMessage({
      type: Events.themeConfig,
      themeConfig: JSON.stringify(getCurrentUser().themeConfigVO || {}),
    });
  };

  onGetHost = () => {
    MessageHandler.postMessage({
      type: Events.setHost,
      parentHost: window.location.origin,
    });
  };

  onGetChatHubInfo = () => {
    MessageHandler.postMessage({
      type: Events.sendLoadChatHub,
      content: this.chatHubParams,
    });
  };

  updateChatHubParams = (params) => {
    this.chatHubParams = { ...this.chatHubParams, ...params };
  };

  updateIframeInstance = (el) => {
    // 目前只考虑即刻和采购助手的iframe实例更新，二者不同时存在，后面如有新增，务必审查相应逻辑，
    MessageHandler.iframe = this.iframe = el;
  };

  @Bind()
  renderActionButton() {
    return (
      <div className="help-robot-action-button">
        <Icon
          type="minus"
          onClick={() => {
            this.handleModalVisible(false, false);
          }}
        />
        <Icon
          type="close"
          onClick={() => {
            this.handleModalVisible(false);
          }}
        />
      </div>
    );
  }

  @Bind()
  @Debounce(100)
  handleDragEnd(event) {
    let custmoizePosition = event.clientY;
    const root = document.getElementById('root');
    // 根据是否展开状态，得出拖动区域相对于clientY的附加值
    const bottomDistance =
      this.onlineToolsRef && this.onlineToolsRef.state.showExpandTools ? 214 : 60;
    if (root && root.getBoundingClientRect) {
      const { top, bottom } = root.getBoundingClientRect();
      if (custmoizePosition < 214) {
        custmoizePosition = 214;
      } else if (custmoizePosition > bottom - bottomDistance) {
        //离底部预留点距离
        custmoizePosition = bottom - bottomDistance;
      }
      // custmoizePosition = custmoizePosition - 12;
      this.setState({ custmoizePosition });
    }
  }

  @Bind()
  getDevice() {
    const u = navigator.userAgent;
    const deviceBrowser = (function () {
      return {
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
        ios: !!u.match(/\(i[^;]+;( U;)? CPU.Mac OS X/), // ios终端
        android: u.indexOf('Android') > -1, // android终端或者uc浏览器
        iPhone: u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
        iPad: u.indexOf('iPad') > -1, // 是否iPad
        iPod: u.indexOf('iPod') > -1,
      };
    })();
    const { iPhone, iPad, iPod, mobile, android } = deviceBrowser;
    if (iPhone || iPad || iPod || mobile || android) {
      let device = '';
      if (iPhone) {
        device += 'iPhone ';
      } else if (iPad) {
        device += 'iPad ';
      } else if (android) {
        device += 'android ';
      }
      this.setState({
        device: device + '移动端',
      });
    } else {
      this.setState({
        device: 'PC端',
      });
    }
  }

  //监听卡片drag事件
  handleChatDragStart = () => {
    this.setState({ dragFlag: true });
  };

  handleChatDragEnd = (event) => {
    console.log('drag end');
    this.setState({ dragFlag: false });
    if (!this.itemDropFlag) {
      const { clientX, clientY, resStatus, cardMsg } = event.data;
      if (resStatus?.status) {
        notification.error({
          message: resStatus.message,
        });
        return;
      }
      const pageDom =
        this.iframe ||
        document.getElementById('purchaseHelper') ||
        document.getElementById('aiChatHelper');
      if (!pageDom) {
        return;
      }
      MessageHandler.iframe = this.iframe;
      const { clientWidth, clientHeight } = pageDom;
      // 在iframe里才发送消息
      if (
        clientX >= window.innerWidth - clientWidth &&
        clientX <= window.innerWidth &&
        clientY >= 0 &&
        clientY <= clientHeight
      ) {
        this.itemDropFlag = true;
        setTimeout(() => {
          this.itemDropFlag = false;
        }, this.itemDropTimeout);
        // 发送卡片信息和位置信息
        const { top, left } = pageDom?.getBoundingClientRect();
        postMessage('SEND_CARD_MESSAGE', {
          cardMsg,
          clientX: clientX - left,
          clientY: clientY - top,
        });
      }
    }
  };

  handleIconMouseDown = (event, draggableNode) => {
    this.setState({ isMoving: true });
    // 鼠标位置
    this.downPositionY = event.clientY;
    this.draggableNode = draggableNode.parentNode;
    this.draggableNode.classList.add('help-robot-moving');
    this.dragFlag = true;
    document.body.addEventListener('mousemove', this.handleIconMouseMove);
    document.body.addEventListener('mouseup', this.handleIconMouseUp);
  };

  handleIconMouseMove = (event) => {
    const { height } = this.draggableNode.getBoundingClientRect();
    if (this.dragFlag) {
      const { bottom } = root.getBoundingClientRect();
      // 根据是否展开状态，得出拖动区域真实高度
      if (event.clientY > bottom - 72) {
        // 滑到底部
        this.draggableNode.style.top = `${bottom - 72}px`;
      } else if (event.clientY < 144) {
        // 其中192表示当前4个图标加边距的总高度，另外还有额外的20边距
        // 滑到顶部;
        this.draggableNode.style.top = `144px`;
      } else {
        this.draggableNode.style.top = `${event.clientY - 24}px`;
      }
    }
    this.handleDragEnd(event);
  };

  handleIconMouseUp = (event) => {
    if (Math.abs(event.clientY - this.downPositionY) < 5) {
      this.onlineToolsRef.expandTools();
    }
    // 鼠标位置
    this.downPositionY = 0;
    if (!this.dragFlag) {
      return;
    }
    this.draggableNode.classList.remove('help-robot-moving');
    this.dragFlag = false;
    document.body.removeEventListener('mousemove', this.handleIconMouseMove);
    document.body.removeEventListener('mouseup', this.handleIconMouseUp);
    this.setState({ isMoving: false });
    return;
  };

  handleChangeModalWidth = (width) => {
    const { dragModalWidth } = this.state;
    if (!dragModalWidth) {
      this.setState({ dragModalWidth: true });
    }
    this.setState({ modelWidth: width });
  };

  finishChangeModalWidth = () => {
    this.setState({ dragModalWidth: false });
  };

  render() {
    const {
      modalVisible,
      helpRobotUrl,
      helpRobotType,
      defaultShow,
      noticeShow,
      firstShow,
      custmoizePosition,
      isDestroyModal,
      display,
      controlFlag,
      partnerDTOS = [],
      wechatModalVisible,
      wechatUrl,
      wechatMsg,
      wechatCode,
      dragFlag,
      loginStatus,
      spinValue,
      modelWidth,
      dragModalWidth,
      isMoving,
      enabledFlag,
      enabledCloopmFlag,
      yqyPassUrl,
      yqyGateway,
      enabledPurHelper,
      showChatOnline,
      aiOpenFlag,
      purchaseHelpServices,
      purHelperIcon,
      enabledAIChat,
      enableSupplierRobot,
    } = this.state;
    const maskHidden = !dragFlag;
    const root = document.getElementById('root');
    const robotTitle =
      helpRobotType === 'yqy'
        ? intl.get('srm.helpRobot.view.title.onlineRobot').d('在线客服')
        : intl.get('srm.helpRobot.view.title.smartRobot').d('智能客服');
    const robotVisible = noticeShow || (firstShow && defaultShow);
    const robotDisplay =
      isTenantRoleLevel() && display && helpRobotType === 'yqy' ? 'block' : 'none';
    const robotInfo = {
      openModal: this.handleOpenModal,
      title: robotTitle,
      visible: robotVisible,
      robotDisplay,
    };
    return ReactDOM.createPortal(
      <React.Fragment>
        <div
          className={classnames('help-robot', { 'help-robot-show': !controlFlag })}
          style={{
            // top: custmoizePosition || 'calc(100% - 100px)',
            display:
              (isTenantRoleLevel() && display && helpRobotType === 'yqy') ||
              partnerDTOS.length > 0 ||
              enabledCloopmFlag ||
              enabledPurHelper ||
              enabledAIChat ||
              enableSupplierRobot
                ? 'block'
                : 'none',
          }}
          ref={(el) => {
            this.parentNode = el;
          }}
        >
          <OnlineTools
            robotInfo={robotInfo}
            updateChatHubParams={this.updateChatHubParams}
            updateIframeInstance={this.updateIframeInstance}
            controlFlag={this.setControlFlag}
            partnerInfo={partnerDTOS}
            handleOpenWechatModal={this.handleOpenWechatModal}
            updateCtxChatOpen={this.updateCtxChatOpen}
            setWechatUrl={this.setWechatUrl}
            setSpinValue={this.setSpinValue}
            handleIconMouseDown={this.handleIconMouseDown}
            isMoving={isMoving}
            enabledFlag={enabledFlag}
            enabledCloopmFlag={enabledCloopmFlag}
            dragFlag={dragFlag}
            onRef={(ref) => {
              this.onlineToolsRef = ref;
            }}
            enabledPurHelper={enabledPurHelper}
            enabledAIChat={enabledAIChat}
            enableSupplierRobot={enableSupplierRobot}
            showChatOnline={showChatOnline}
            aiOpenFlag={aiOpenFlag}
            purchaseHelpServices={purchaseHelpServices}
            purHelperIcon={purHelperIcon}
            yqyPassUrl={yqyPassUrl}
            whichMsg={this.noticeData.whichMsg}
            cancelMsgNotice={this.cancelMsgNotice}
            yqyGateway={yqyGateway}
          />
          {/* {helpRobotType === 'zc' && this.renderZCRobot()} */}
        </div>
        <Modal
          visible={modalVisible}
          footer={null}
          width={600}
          mask={false}
          bodyStyle={{ overflowY: 'hidden', height: '100%' }}
          onCancel={() => {
            this.handleModalVisible(false);
          }}
          wrapClassName={classnames('ant-modal-sidebar-right', 'help-robot-modal')}
          transitionName="move-right"
          destroyOnClose={isDestroyModal}
          closable={false}
        >
          {this.renderActionButton()}
          <Tooltip placement="bottom" title={intl.get('hzero.common.button.up').d('收起')}>
            <Icon
              type="menu-unfold"
              className="close-modal-icon"
              onClick={() => {
                this.handleModalVisible(false, false);
              }}
            />
          </Tooltip>
          <iframe
            ref={(el) => {
              this.updateIframeInstance(el);
            }}
            src={helpRobotUrl}
            id="iframe"
            name="iframe"
            frameBorder="none"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          />
        </Modal>
        {/* 二维码 */}
        <Modal
          visible={wechatModalVisible && (!loginStatus || wechatCode !== '00000')}
          autoCenter={true}
          closable={true}
          maskClosable={false}
          title={intl.get('hzero.common.scan.code').d('扫码登录')}
          footer={
            <>
              <Button
                onClick={() => {
                  this.handleOpenWechatModal(false);
                }}
              >
                {intl.get('hzero.common.btn.cancel').d('取消')}
              </Button>
            </>
          }
          width={560}
          height={420}
          bodyStyle={{
            height: 'calc(420px - 134px)',
            padding: 0,
          }}
          onCancel={() => {
            this.handleOpenWechatModal(false);
          }}
          className={classnames('qrcode-modal')}
        >
          <Spin
            spinning={spinValue}
            size="default"
            tip={intl.get('hzero.common.loading.info').d('正在加载，时间预计4-5s，请稍后...')}
            style={{
              width: '100%',
              height: 'calc(420px - 134px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            {wechatUrl && (
              <iframe
                ref={(el) => {
                  this.updateIframeInstance(el);
                }}
                src={wechatUrl}
                id="qrCodeIframe"
                name="qrCodeIframe"
                frameBorder="none"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                allow="clipboard-read; clipboard-write"
              />
            )}
            {wechatMsg && (
              <div
                style={{
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '400',
                      lineHeight: '24px',
                      marginBottom: '16px',
                    }}
                  >
                    {wechatMsg}
                  </div>
                  {wechatCode === '50001' && <img alt="" src={illustrator} />}
                </div>
              </div>
            )}
          </Spin>
        </Modal>
        {/* 聊天窗口 */}
        <Modal
          visible={wechatModalVisible && loginStatus && wechatCode === '00000'}
          footer={null}
          width={modelWidth}
          mask={false}
          closable={false}
          bodyStyle={{ overflowY: 'hidden', height: '100%' }}
          onCancel={() => {
            this.handleOpenWechatModal(false);
          }}
          wrapClassName={classnames('ant-modal-sidebar-right', 'help-wechat-modal')}
          transitionName="move-right"
        >
          <MoveWidthUnit
            onChange={this.handleChangeModalWidth}
            handleWidth={this.finishChangeModalWidth}
          />
          {wechatUrl && (
            <iframe
              src={wechatUrl}
              ref={(el) => {
                this.updateIframeInstance(el);
              }}
              id="iframe"
              name="iframe"
              frameBorder="none"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allow="clipboard-read; clipboard-write"
            />
          )}
          {wechatMsg && (
            <div>
              <Icon
                type="close"
                style={{
                  margin: '20px 20px 0 0',
                  float: 'right',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  window.postMessage({ type: 'CLOSE_IFRAME' }, '*');
                }}
              />
              <div style={{ padding: '40px', fontSize: '16px' }}>{wechatMsg}</div>
            </div>
          )}
          {wechatUrl && (
            <>
              <div
                ref="iframeGroupMask"
                hidden={maskHidden}
                className={classnames('web-chat-mask', 'group-mask')}
              />
              <div
                ref="iframeMask"
                hidden={maskHidden}
                className={classnames('web-chat-mask', 'card-mask')}
              >
                <div className={classnames('web-chat-mask-inner-text')}>
                  <div className={classnames('border-line', 'border-line-top')} />
                  <div className={classnames('border-line', 'border-line-right')} />
                  <div className={classnames('border-line', 'border-line-bottom')} />
                  <div className={classnames('border-line', 'border-line-left')} />
                  {intl.get('hzero.common.message.releaseToDrop').d('拖放到区域内发送')}
                </div>
              </div>
            </>
          )}
          {/* 解决iframe拖拽卡顿 */}
          {dragModalWidth && (
            <div style={{ height: '100%', width: '100%', position: 'absolute', top: '0' }}></div>
          )}
        </Modal>
      </React.Fragment>,
      root
    );
  }
}
