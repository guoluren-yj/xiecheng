/*
 * @Descripttion:
 * @Date: 2021-06-15 15:04:02
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
/* eslint-disable */
import React, { Component, useEffect, useState } from 'react';
import { Modal, Button, Spin } from 'choerodon-ui/pro';
import { notification, Icon } from 'choerodon-ui';
import PropTypes from 'prop-types';
import { Tooltip } from 'hzero-ui';
import { getConfig } from 'hzero-boot';
import { isEmpty, omit, debounce } from 'lodash';
import Cookies from 'universal-cookie';
import request from 'utils/request';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentUser,
  getAccessToken,
} from 'utils/utils';
import intl from 'utils/intl';
import { getEnvConfig } from 'utils/iocUtils';
import { YQCLOUD_TABMAP, YQCLOUD_COUNT } from 'utils/constants';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import webSocket from 'hzero-front/lib/utils/webSoket';
import MessageHandler from '@/components/Message/message-handler';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_PLATFORM, SRM_MARMOT } from '@/utils/config';
import { getBrowserInfo } from '@/utils/utils';

import wechatImg from '@/assets/icon_wechat.svg';
import iconDefault from '@/assets/icon_default.svg';
import iconSelect from '@/assets/icon_selected.svg';
import onlineServicesSvg from '@/assets/online_services.svg';
import onlineIssueSvg from '@/assets/online_issue.svg';
import purchaseHelperImg from '@/assets/right_now.svg';
import aiChatPng from '@/assets/ai-chat.png';
import { getBindSupplierUrl } from '@/services/mobileConfig';
import EmbedPage from '../../EmbedPage';
import styles from './index.less';

const urlLoading = Symbol('url-loading');
const notificationKey = 'yqclound-new-message';
const cookies = new Cookies();
const JIKE_GET_MENU_STATUS = 'JIKE_GET_MENU_STATUS';
const { BASE_PATH, AI_MP_HOST } = getEnvConfig();

export default class OnlineTools extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.draggable = React.createRef();
    this.robotMessageSendTime = undefined;
    this.initShowFlag = true;
    this.issueModal = null;
    this.state = {
      showExpandTools: true,
      timeoutId: null,
      purHelperUrl: '',
      msgCount: 0, // 燕千云消息数量
    };
    // 放一些可观察数据，用于c7n弹窗内的跨层级渲染，勿作他用
    this.observerData = observable({
      dragFlag: props.dragFlag || false,
    });
  }

  static contextTypes = {
    chatInfo: PropTypes.object,
  };

  componentWillMount() {
    window.addEventListener('message', this.closeIssueModal);
  }

  componentDidMount() {
    this.firstTimeout();
    webSocket.addListener('hzero-offline-msg', this.handleRebotMsg);
  }

  componentWillUnmount() {
    const { timeoutId } = this.state;
    clearTimeout(timeoutId);
    webSocket.removeListener('hzero-offline-msg', this.handleRebotMsg);
    window.removeEventListener('message', this.closeIssueModal);
  }

  componentDidUpdate(prevProps) {
    // 启用燕千云客服时
    if (this.props.enabledFlag && this.props.enabledFlag !== prevProps.enabledFlag) {
      this.initMessage();
    }
    if (this.props.dragFlag !== this.observerData.dragFlag) {
      this.observerData.dragFlag = this.props.dragFlag;
    }
  }

  fetchMessageCount = async () => {
    const res = await request(`${SRM_PLATFORM}/v1/external/yqcloud/webhook/offline-message/status`);
    if (getResponse(res) && res && res.haveOfflineMessage) {
      return res.haveOfflineMessage;
    } else {
      return false;
    }
  };

  initMessage = async () => {
    const count = await this.fetchMessageCount();
    if (count) {
      this.setState({
        msgCount: count,
      });
      this.showNotifiction(count);
    }
  };

  handleRebotMsg = async (data) => {
    if (data && data.message) {
      const { message } = data;
      if (typeof message === 'string') {
        try {
          const { sendTime } = JSON.parse(message);
          if (!this.robotMessageSendTime || this.robotMessageSendTime < sendTime) {
            this.robotMessageSendTime = sendTime;
            const count = await this.fetchMessageCount();
            if (count) {
              this.setState({
                msgCount: count,
              });
              this.showNotifiction(count);
            }
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
    }
  };

  showNotifiction = (count) => {
    const [before = '', after = ''] = intl
      .get('srm.helpRobot.unread.message.count')
      .d('您有{count}条未读消息')
      .split('{count}');
    notification.close(notificationKey);
    notification.open({
      key: notificationKey,
      message: (
        <span style={{ fontSize: '14px', fontWeight: 600 }}>
          {intl.get('srm.helpRobot.view.title.onlineRobot').d('在线支持')}
          {intl.get('srm.helpRobot.message.notification').d('消息提醒')}
        </span>
      ),
      description: (
        <span className={styles['yqy-notification']} onClick={this.handleClose}>
          {before}&nbsp;{count}&nbsp;{after},
          {intl.get('srm.helpRobot.click.for.details').d('点击查看详情')}
        </span>
      ),
      btn: (
        <Button onClick={() => notification.close(notificationKey)}>
          {intl.get('hzero.common.button.shutDown').d('关闭')}
        </Button>
      ),
      duration: 0,
    });
  };

  handleClose = () => {
    window.focus();
    notification.close(notificationKey);
    this.openRobotChat();
  };

  firstTimeout = () => {
    const { controlFlag } = this.props;
    controlFlag();
    const timeoutId = setTimeout(() => {
      controlFlag();
    }, 3000);
    this.setState({
      timeoutId,
    });
  };

  expandTools = (value = undefined) => {
    const { showExpandTools } = this.state;
    const { controlFlag, partnerInfo, enabledCloopmFlag } = this.props;
    this.initShowFlag = false;
    this.setState({ showExpandTools: value === false ? false : !showExpandTools });
    if (!isEmpty(partnerInfo) || enabledCloopmFlag) {
      controlFlag();
    }
  };

  openWeChat = () => {
    const { partnerInfo, setWechatUrl, setSpinValue, handleOpenWechatModal } = this.props;
    setWechatUrl('', '', '');
    setSpinValue(true);
    handleOpenWechatModal(true);
    // 额度查询
    this.getQuota('spfm', partnerInfo[0].partnerCode, partnerInfo[0].serviceCode).then((res) => {
      const result = getResponse(res);
      setSpinValue(false);
      if (!isEmpty(result)) {
        if (result.success && result.code === '00000') {
          if (result.data) {
            setWechatUrl(result.data, '', result.code);
          } else {
            setWechatUrl('', result.msg ? result.msg : result.code, result.code);
          }
        }
        if (!result.success) {
          setWechatUrl('', result.msg ? result.msg : result.code, result.code);
        }
      }
    });
  };

  getQuota = (_, partnerCode, serviceCode) => {
    const params = {
      partnerCode,
      openServiceCode: serviceCode,
    };
    let query = filterNullValueObject(parseParameters(params));
    query = omit(query, ['page', 'size']);
    return request(
      `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-order-quota`,
      { query }
    );
  };

  clearMsgCount = () => {
    this.setState({ msgCount: 0 });
    request(`${SRM_PLATFORM}/v1/external/yqcloud/webhook/offline-message/close`).then((r) =>
      getResponse(r)
    );
  };

  getWindow = () => {
    if (window.parent === window) {
      return window;
    } else {
      return window.parent;
    }
  };

  // 打开燕千云在线支持
  openRobotChat = () => {
    this.expandTools(false);
    const user = getCurrentUser() || {};
    const { id, realName, loginName, tenantName, additionInfo, language, tenantNum } = user;
    const { organizationName } = additionInfo || {};
    const { colors = {} } = this.getWindow()?.$$themes || {}; // 主题色
    // 目前只支持 en_US、zh_CN, 其他语言默认显示 zh_CN
    // const yqLanguage = language !== 'en_US' ? 'zh_CN' : 'en_US';

    const tenantCode = tenantNum?.replace(/-/g, '_') ?? '';

    const anonymousUserInfo = {
      t_belong_tenant: organizationName, // 所属租户
      t_current_tenant: tenantName, // 当前租户
      t_website: window.location.href, // 登录网址
      t_web: getBrowserInfo().browser, // 当前浏览器
      company: tenantCode || '',
    };
    const userOptions = {
      anonymousUserName: realName,
      anonymousUserCode: loginName,
      anonymousUserInfo: JSON.stringify(anonymousUserInfo),
      updateFlag: true,
    };
    const urlParam = encodeURIComponent(JSON.stringify(userOptions));
    let yqyUrl = `${window.$$env.YQCLOUD_BOTPRESS_URL}?yqLanguage=${language}&userId=${id}&userOptions=${urlParam}`;
    let maxWidth = window.innerWidth - 250;
    if (document.querySelector('.hzero-common-layout-aside')) {
      maxWidth =
        window.innerWidth -
        document.querySelector('.hzero-common-layout-aside').getBoundingClientRect().width -
        10;
    }
    if (colors['primary-color']) {
      yqyUrl += `&themeColor=${colors['primary-color']?.slice(1)}`;
    }
    Modal.open({
      drawer: true,
      key: 'botModal',
      style: {
        width: '800px',
        maxWidth: `${maxWidth}px`,
      },
      className: 'yqcloud-bot-modal',
      ignoreDestroyAll: true,
      children: (
        <iframe
          src={yqyUrl}
          id="onlineService"
          name="onlineService"
          title="onlineService"
          width="100%"
          height="100%"
          frameBorder="none"
          style={{ border: 'none' }}
        />
      ),
      footer: (okBtn, cancelBtn) => <>{cancelBtn}</>,
      cancelText: intl.get('srm.helpRobot.view.button.up').d('收起'),
      cancelProps: {
        color: 'primary',
      },
      onCancel: () => {
        this.clearMsgCount();
      },
      resizable: true,
      mask: false,
      destroyOnClose: true,
    });
  };

  /**
   * 打开供应商机器人新入口
   */
  openSupplierRobotChat = () => {
    this.expandTools(false);
    const user = getCurrentUser() || {};
    const { id, realName, loginName, tenantName, additionInfo, language, tenantNum } = user;
    const { organizationName } = additionInfo || {};
    const { colors = {} } = this.getWindow()?.$$themes || {}; // 主题色

    const tenantCode = tenantNum?.replace(/-/g, '_') ?? '';

    const anonymousUserInfo = {
      t_belong_tenant: organizationName, // 所属租户
      t_current_tenant: tenantName, // 当前租户
      t_website: window.location.href, // 登录网址
      t_web: getBrowserInfo().browser, // 当前浏览器
      company: tenantCode || '',
    };
    const userOptions = {
      anonymousUserName: realName,
      anonymousUserCode: loginName,
      anonymousUserInfo: JSON.stringify(anonymousUserInfo),
      updateFlag: true,
    };
    const urlParam = encodeURIComponent(JSON.stringify(userOptions));
    let yqyUrl = `${window.$$env.YQCLOUD_BOTPRESS_SUPPLIER_URL}?yqLanguage=${language}&userId=${id}&userOptions=${urlParam}`;
    let maxWidth = window.innerWidth - 250;
    if (document.querySelector('.hzero-common-layout-aside')) {
      maxWidth =
        window.innerWidth -
        document.querySelector('.hzero-common-layout-aside').getBoundingClientRect().width -
        10;
    }
    if (colors['primary-color']) {
      yqyUrl += `&themeColor=${colors['primary-color']?.slice(1)}`;
    }
    Modal.open({
      drawer: true,
      key: 'botModal',
      style: {
        width: '800px',
        maxWidth: `${maxWidth}px`,
      },
      className: 'yqcloud-bot-modal',
      ignoreDestroyAll: true,
      children: (
        <iframe
          src={yqyUrl}
          id="onlineService"
          name="onlineService"
          title="onlineService"
          width="100%"
          height="100%"
          frameBorder="none"
          style={{ border: 'none' }}
        />
      ),
      footer: (okBtn, cancelBtn) => <>{cancelBtn}</>,
      cancelText: intl.get('srm.helpRobot.view.button.up').d('收起'),
      cancelProps: {
        color: 'primary',
      },
      onCancel: () => {
        this.clearMsgCount();
      },
      resizable: true,
      mask: false,
      destroyOnClose: true,
    });
  };

  // 在线提单入口
  renderIssueEnter = () => {
    return (
      <div
        className={styles['robot-icon']}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        <Tooltip placement="left" title={intl.get('srm.helpRobot.icon.onlineIssue').d('在线提单')}>
          <img
            src={onlineIssueSvg}
            alt="online-issue"
            width={30}
            height={30}
            onClick={this.openIssueModal}
          />
        </Tooltip>
      </div>
    );
  };

  loginYQY = () => {
    window.open(window.$$env.YQCLOUD_LOGIN_URL);
  };

  openIssueModal = () => {
    let maxWidth = window.innerWidth - 250;
    if (document.querySelector('.hzero-common-layout-aside')) {
      maxWidth =
        window.innerWidth -
        document.querySelector('.hzero-common-layout-aside').getBoundingClientRect().width -
        10;
    }
    const { yqyPassUrl } = this.props;
    this.issueModal = Modal.open({
      drawer: true,
      style: {
        width: '800px',
        maxWidth: `${maxWidth}px`,
      },
      className: styles['issue-modal'],
      children: (
        <iframe
          src={yqyPassUrl}
          id="onlineIssue"
          name="onlineIssue"
          title="onlineIssue"
          width="100%"
          height="100%"
          frameBorder="none"
          style={{ border: 'none' }}
        />
      ),
      footer: (okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          <Button onClick={this.loginYQY}>
            {intl.get('srm.helpRobot.view.button.loginYQY').d('登录燕千云')}
          </Button>
        </>
      ),
      cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      resizable: true,
      mask: false,
    });
  };

  // 关闭燕千云提单modal
  closeIssueModal = (e) => {
    if (e.data === 'yq_close_modal') {
      this.issueModal?.close();
    }
  };

  getMenuCardData = () => {
    let { pathname } = window.location;
    if (BASE_PATH) {
      pathname = pathname.replace(BASE_PATH, '/');
    }
    const { chatInfo } = this.context;
    const { loadedCardMap } = chatInfo || {};
    let cardData = undefined;
    if (loadedCardMap && loadedCardMap[pathname]) {
      cardData = loadedCardMap[pathname];
    }
    return cardData;
  };

  sendMenu = () => {
    const cardData = this.getMenuCardData();
    if (!cardData) {
      return;
    }
    // 先重置
    window.localStorage.setItem(JIKE_GET_MENU_STATUS, '');
    const handleGetMenu = () => {
      window.localStorage.setItem(JIKE_GET_MENU_STATUS, 'true');
      MessageHandler.cancel('GET_MENU', handleGetMenu);
    };
    MessageHandler.on('GET_MENU', handleGetMenu);
    let { pathname } = window.location;
    if (BASE_PATH) {
      pathname = pathname.replace(BASE_PATH, '/');
    }
    const { tabs } = window.dvaApp._store.getState().global;
    const currentMenu = tabs ? tabs.find((i) => i.path === pathname) : undefined;
    if (currentMenu) {
      currentMenu.title = intl.get(currentMenu.title) || currentMenu.title;
    }
    const content = { menu: currentMenu };
    content.data = cardData;
    if (content.data) {
      content.data = omit(content.data, ['requestBody']);
    }
    const timer = setInterval(() => {
      if (window.localStorage.getItem(JIKE_GET_MENU_STATUS) === 'true') {
        const { cardCode, cardType, serviceType, requestBody } = cardData;
        const params = {
          organizationId: getCurrentOrganizationId(),
          cardCode,
          cardType,
          serviceType,
        };
        getBindSupplierUrl(params, {
          action: 'AUTO',
          ...(typeof requestBody === 'function' ? requestBody() : requestBody),
        }).then((res) => {
          if (res) {
            content.cardMsg = {
              msgTitle: res.cardTitle,
              msgDesc: res.cardDesc,
              msgUrl: res.cardUrl,
              msgIcon: res.cardLogo,
              msgInfo: res,
              msgType: cardType || 'MSG',
            };
            MessageHandler.postMessage({ type: 'SEND_MENU', content }, '*');
          }
        });
        clearInterval(timer);
      }
    }, 100);
  };

  openPurchaseHelper = () => {
    this.sendMenu();
    const {
      updateIframeInstance,
      updateCtxChatOpen,
      cancelMsgNotice,
      showChatOnline,
      aiOpenFlag,
      purchaseHelpServices,
    } = this.props;
    updateCtxChatOpen(true);
    const SimplePage = observer((_props) => {
      const { modal } = _props;
      const [url, setUrl] = useState(urlLoading);
      const loading = url === urlLoading;
      useEffect(() => {
        // 开通多个助手或者需要在线沟通, 打开即刻3.0壳子
        if (
          aiOpenFlag ||
          showChatOnline ||
          purchaseHelpServices.some(
            (key) => !['JIKE_NLP_ALI_V1', 'JIKE_NLP_WULAI_V1'].includes(key)
          )
        ) {
          modal.update({
            style: {
              width: '1000px',
              minWidth: '900px',
            },
          });
          setUrl('');
        } else {
          // 只开通问答助手
          request(
            `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-order-quota-purchase`
          ).then((res) => {
            if (getResponse(res)) {
              setUrl(res[0]?.url);
            }
          });
        }
        cancelMsgNotice();
      }, []);

      return (
        <Spin spinning={loading}>
          {this.observerData.dragFlag && (
            <div style={{ height: '100%', width: '100%', position: 'absolute' }} />
          )}
          {loading ? (
            <div style={{ height: '100%', width: '100%' }} />
          ) : url ? (
            <iframe
              src={url}
              ref={updateIframeInstance}
              id="purchaseHelper"
              title="purchaseHelper"
              width="100%"
              height="100%"
              frameBorder="none"
              style={{ border: 'none' }}
            />
          ) : (
            <div id="purchaseHelper" style={{ height: '100%' }}>
              <EmbedPage
                contentStyle={{ height: '100%' }}
                href={`/pub/smbl/chat-hub?aiOpenFlag=${aiOpenFlag}`}
              ></EmbedPage>
            </div>
          )}
        </Spin>
      );
    });

    const modal = Modal.open({
      drawer: true,
      style: {
        width: '742px',
      },
      className: styles['issue-modal'],
      children: <SimplePage />,
      footer: null,
      resizable: true,
      mask: false,
    });
    const closeCallback = () => {
      modal.close();
      MessageHandler.cancel('CLOSE_IFRAME', closeCallback);
    };
    MessageHandler.on('CLOSE_IFRAME', closeCallback);
  };

  addParamToUrl = (urlStr, params) => {
    // 处理哈希路由的情况
    const [baseUrl, hashStr] = urlStr.split('#');
    const [path, query] = baseUrl.split('?');

    let newQuery = query || '';

    // 处理对象参数
    Object.entries(params).forEach(([key, value]) => {
      if (newQuery) {
        newQuery += '&';
      } else {
        newQuery = '';
      }
      newQuery += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    });

    const result = `${path}?${newQuery}`;
    return hashStr ? `${result}#${hashStr}` : result;
  };

  /**
   * AI 助理弹窗
   */
  openAIChatHelper = () => {
    const { colors = {} } = this.getWindow()?.$$themes || {}; // 主题色

    this.sendMenu();
    const { updateIframeInstance, updateCtxChatOpen, cancelMsgNotice, enabledAIChat } = this.props;
    const user = getCurrentUser() || {};
    const { language } = user;

    updateCtxChatOpen(true);
    const SimplePage = observer((_props) => {
      // const { modal } = _props;
      const [url, setUrl] = useState(urlLoading);
      const loading = url === urlLoading;

      useEffect(() => {
        if (enabledAIChat) {
          (async () => {
            let params = {};
            try {
              const permissionResult = await request(
                `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/ai-assistant-permissions/role-skill-permission`
              );
              if (getResponse(permissionResult)) {
                params = permissionResult;
              }
            } finally {
              request(`${SRM_MARMOT}/v1/marmot-site-api/SPFM_AI_INTEGRATE`, {
                method: 'POST',
                body: params,
              }).then((res) => {
                if (getResponse(res)) {
                  const newUrl = res?.url
                    ? this.addParamToUrl(res?.url, {
                        themeColor: colors['primary-color']?.slice(1),
                        language,
                        ssoLoginUrl: window.location.origin,
                      })
                    : '';

                  setUrl(newUrl);
                }
              });
            }
          })();
        }
        cancelMsgNotice();
      }, []);

      return (
        <div style={{ position: 'relative' }}>
          <Spin spinning={loading}>
            {/* <span
              style={{
                position: 'absolute',
                top: '26px',
                left: '-8px',
                color: '#bdc2cb',
                zIndex: '100',
              }}
            >
              <Icon type="cancel" style={{ cursor: 'pointer' }} onClick={closeCallback} />
            </span> */}
            {loading ? (
              <div style={{ height: '100%', width: '100%' }} />
            ) : url ? (
              <iframe
                src={url}
                ref={updateIframeInstance}
                id="aiChatHelper"
                title="aiChatHelper"
                width="100%"
                height="100%"
                frameBorder="none"
                style={{ border: 'none' }}
              />
            ) : (
              <div id="aiChatHelper" style={{ height: '100%' }}>
                <EmbedPage contentStyle={{ height: '100%' }} href={`/pub/ai/chat-hub`}></EmbedPage>
              </div>
            )}
          </Spin>
        </div>
      );
    });

    const modal = Modal.open({
      drawer: true,
      style: {
        width: '80%',
      },
      className: styles['ai-chat-issue-modal'],
      children: <SimplePage />,
      footer: null,
      resizable: true,
      mask: false,
    });
    const openLinkInNewTab = ({ data = {} }) => {
      const { type, content = '' } = data || {};

      if (type === 'OPEN_LINK_IN_NEW_TAB' && content && content.includes('http')) {
        window.open(content, '_blank');
      }
    };
    const closeCallback = () => {
      modal.close();
      MessageHandler.cancel('CLOSE_IFRAME', closeCallback);
      MessageHandler.cancel('OPEN_LINK_IN_NEW_TAB', openLinkInNewTab);
    };
    MessageHandler.on('CLOSE_IFRAME', closeCallback);
    MessageHandler.on('OPEN_LINK_IN_NEW_TAB', openLinkInNewTab);
  };

  render() {
    const { showExpandTools, purHelperUrl, msgCount } = this.state;
    const {
      robotInfo,
      partnerInfo,
      handleIconMouseDown,
      isMoving,
      enabledFlag,
      enabledCloopmFlag,
      enabledPurHelper,
      enabledAIChat,
      purHelperIcon,
      whichMsg,
      enableSupplierRobot,
    } = this.props;
    let partnerCodeArr = [];
    let serviceCodes = [];
    if (partnerInfo && partnerInfo.length > 0) {
      partnerCodeArr = (partnerInfo[0].partnerCode || '').split(',');
      serviceCodes = (partnerInfo[0].serviceCode || '').split(',');
    }
    const hasPartner = ['DING_TALK', 'EN_WECHAT', 'WECHAT'].some((item) =>
      partnerCodeArr.includes(item)
    );
    const hasPurHelperMsg = whichMsg.has('default');
    const noticeClassName = hasPurHelperMsg ? styles.news : '';
    return (
      <div
        className={styles.content}
        ref={(el) => {
          this.draggable = el;
        }}
        onMouseDown={(e) => handleIconMouseDown(e, this.draggable)}
      >
        <div
          className={styles['content-wrapper']}
          style={{ display: showExpandTools ? '' : 'none' }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {!isEmpty(partnerInfo) &&
            hasPartner &&
            serviceCodes.includes('WECHAT_MERCHANT_ROBOT_V1') && (
              <div className={styles['wechat-icon']}>
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.IMCollaborationTool').d('IM协同工具')}
                >
                  <img
                    draggable="false"
                    src={wechatImg}
                    alt="wechat-img"
                    width={24}
                    height={24}
                    onClick={this.openWeChat}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    style={{ backgroundColor: '#fff', borderRadius: '50%' }}
                  />
                </Tooltip>
              </div>
            )}
          {enabledFlag && (
            <div
              className={styles['robot-icon']}
              style={{ display: robotInfo.robotDisplay, position: 'relative' }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              {msgCount ? (
                <span className={styles['sub-count']}>{msgCount > 99 ? '99+' : msgCount}</span>
              ) : (
                ''
              )}
              <Tooltip placement="left" title={robotInfo.title}>
                <img
                  draggable="false"
                  src={onlineServicesSvg}
                  alt="help-robot-img"
                  width={30}
                  height={30}
                  onClick={this.openRobotChat}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  className="help-robot-img"
                  style={{ boxShadow: 'none' }}
                />
              </Tooltip>
            </div>
          )}
          {enabledCloopmFlag && this.renderIssueEnter()}
          {enabledPurHelper && (
            <div className={styles['purchase-helper-wrapper']}>
              <div
                className={['purchase-helper', noticeClassName, noticeClassName ? styles.small : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {hasPurHelperMsg ? <span className={styles['red-dot']} /> : null}
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.purchaseHelper').d('即刻')}
                >
                  <img
                    draggable="false"
                    src={purHelperIcon || purchaseHelperImg}
                    alt="help-purchase-img"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    onClick={this.openPurchaseHelper}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}

          {enabledAIChat && (
            <div className={styles['purchase-helper-wrapper']}>
              <div
                className={['purchase-helper', noticeClassName, noticeClassName ? styles.small : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.AIChat').d('AI助理')}
                >
                  <img
                    draggable="false"
                    src={aiChatPng}
                    alt="help-purchase-img"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    onClick={this.openAIChatHelper}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}

          {enableSupplierRobot && (
            <div className={styles['purchase-helper-wrapper']}>
              <div
                className={['purchase-helper', noticeClassName, noticeClassName ? styles.small : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                <Tooltip
                  placement="left"
                  title={intl.get('srm.helpRobot.view.title.supplierRobot').d('智能客服')}
                >
                  <img
                    draggable="false"
                    src={onlineServicesSvg}
                    alt="help-supplier-img"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                    onClick={this.openSupplierRobotChat}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        <div className={[styles.entryIcon, noticeClassName].join(' ')}>
          <div className={styles.tools}>
            <img
              draggable="false"
              src={showExpandTools ? iconSelect : iconDefault}
              alt={showExpandTools ? 'select-icon-img' : 'default-icon-img'}
            />
            {msgCount > 0 || (enabledPurHelper && hasPurHelperMsg) ? (
              <span className={styles['red-dot']} />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
