import React from 'react';

import { Layout, Spin } from 'hzero-ui';
import { Modal } from 'choerodon-ui';
import { Button as C7NButton } from 'choerodon-ui/pro';
import { isEmpty, map, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Redirect, Route, Switch } from 'dva/router';
import dynamic from 'dva/dynamic';
import LoadingBar from 'components/NProgress/LoadingBar';
import qs from 'query-string';
import DefaultListenFavicon from './components/DefaultListenFavicon';
import getTabRoutes from 'components/Router';

import webSocketManagener from 'utils/webSoket';
import { KICK_OUT_MSG_KEY } from 'utils/constants';
import {
  getAccessToken,
  getCurrentLanguage,
  getCurrentOrganizationId,
  getCurrentRole,
  getRefreshToken,
  getSystemName,
} from 'utils/utils';
import { tabListen } from 'utils/menuTab';
import NotFound from '../routes/Exception/404';
import { changeTheme } from './NewLayout/utils';

import './PubLayout.less';

const { Content } = Layout;

const EMPTY_ROUTE = () => null;

const showStyle = {};

/**
 * 菜单数据结构改变 只有菜单有path,目录没有path
 * 所有的菜单必须有 服务前缀 `/服务前缀/...功能集合/功能/...子功能`
 * 根据菜单取得重定向地址.
 */
const getRedirect = (item, redirectData = []) => {
  if (item && item.children) {
    // 目录
    for (let i = 0; i < item.children.length; i++) {
      getRedirect(item.children[i], redirectData);
    }
    return redirectData;
  } else if (item && item.path) {
    // 菜单
    let menuPaths = item.path.split('/');
    if (!menuPaths[0]) {
      menuPaths = menuPaths.slice(1, menuPaths.length);
    }
    let menuPath = '';
    for (let i = 0; i < menuPaths.length - 1; i++) {
      menuPath += `/${menuPaths[i]}`;
      const from = menuPath;
      const to = `${menuPath}/${menuPaths[i + 1]}`;
      const exist = redirectData.some((route) => route.from === from);
      if (!exist) {
        redirectData.push({ from, to });
      }
    }
  }
};

class PublicLayout extends React.Component {
  constructor(props) {
    super(props);
    const { isPubLayout } = this.props;
    const { isPub } = qs.parse(window.location.search) || {};
    this.state = {
      isAuthorized: false,
      isException: false,
      isPub: isPubLayout || isPub === 'true',
      modalVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch, currentUser } = this.props;
    if (currentUser) {
      dispatch({
        type: 'global/pubLazyInit',
        payload: {
          organizationId: getCurrentOrganizationId(),
          language: currentUser.language,
          roleId: getCurrentRole().id,
          isPubLayout: this.state.isPub,
        },
      }).then(() => {
        // 不需要初始化菜单成功
        tabListen();
        dispatch({
          type: 'global/initActiveTabMenuId',
        });
      });
    }

    // 设置中文时的表单样式处理
    const language = getCurrentLanguage();
    if (language && language !== 'zh_CN') {
      document.body.className = 'global-layout';
    }

    // 清除首屏loading
    const loader = document.querySelector('#loader-wrapper');
    if (loader) {
      loader.parentNode.removeChild(loader);
      // 设置默认页面加载动画
      dynamic.setDefaultLoadingComponent(() => <LoadingBar />);
    }

    window.accessToken = window.accessToken || getAccessToken('access_token');
    window.refreshToken = window.refreshToken || getRefreshToken('refresh_token');
    this.refreshTimer = setInterval(() => {
      const accessToken = getAccessToken('access_token');
      // const refreshToken = getRefreshToken('refresh_token');
      const windowToken = window.accessToken;
      // const windowRefreshToken = window.refreshToken;
      if (accessToken && windowToken && windowToken !== accessToken) {
        window.location.reload();
      }
    }, 3000);

    this.receiveWebSocketMsg();
  }

  componentWillUnmount() {
    clearInterval(this.refreshTimer);
    // 关闭 webSocket 连接
    webSocketManagener.removeListener('client', this.handleClientMsg);
    // 监听多端登陆
    webSocketManagener.removeListener(KICK_OUT_MSG_KEY, this.handleKickOutMsg);
  }

  @Bind()
  receiveWebSocketMsg() {
    webSocketManagener.initWebSocket();
    webSocketManagener.addListener('client', this.handleClientMsg);
    // 监听多端登陆
    webSocketManagener.addListener(KICK_OUT_MSG_KEY, this.handleKickOutMsg);
  }

  @Bind()
  handleClientMsg(messageData) {
    const { dispatch, count } = this.props;
    const { message } = messageData;
    const messageJson = isEmpty(message) ? undefined : JSON.parse(message);
    if (!isEmpty(messageJson)) {
      const { tenantId, number } = messageJson;
      let newCount = count;
      if (tenantId === 0) {
        newCount = Number(count) + Number(number);
      } else if (tenantId === getCurrentOrganizationId()) {
        newCount = Number(count) + Number(number);
      }
      dispatch({
        type: 'global/saveNotices',
        payload: { count: newCount },
      });
    }
  }

  @Bind()
  handleKickOutMsg(data) {
    {
      if (data && data.message) {
        const { message } = data;
        if (typeof message === 'string') {
          try {
            const accessToken = getAccessToken();
            const { KICK_OUT } = JSON.parse(message);
            if (
              KICK_OUT &&
              isArray(KICK_OUT) &&
              KICK_OUT.length > 0 &&
              KICK_OUT.includes(accessToken)
            ) {
              this.setState({ modalVisible: true });
            }
            // eslint-disable-next-line no-empty
          } catch {}
        }
      }
    }
  }

  getBashRedirect = () => {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData = {} } = this.props;
      // get the first authorized route path in routerData
      // const authorizedPath = Object.keys(routerData).find(
      //   item => check(routerData[item].authority, item) && item !== '/'
      // );
      const authorizedPath = Object.keys(routerData).find((item) => item !== '/');
      return authorizedPath;
    }
    return redirect;
  };

  @Bind()
  handleSingleLoginOk() {
    this.props.dispatch({
      type: 'login/logout',
    });
    this.setState({ modalVisible: true });
  }

  render() {
    const {
      currentUser,
      // collapsed,
      routerData,
      menu = [],
      activeTabKey,
      tabs,
      language,
      location,
      isPubLayout,
      menuLoad,
      workbenchPermission: { workbenchFlag },
      layoutLoading,
    } = this.props;
    const { modalVisible } = this.state;
    const redirectData = workbenchFlag
      ? [
          { from: '/', to: '/swbh/role-workbench' },
          { from: '/workplace', to: '/swbh/role-workbench' },
        ]
      : [{ from: '/', to: '/workplace' }]; // 根目录需要跳转到工作台
    menu.forEach((item) => {
      getRedirect(item, redirectData);
    });
    const bashRedirect = this.getBashRedirect();
    const systemName = getSystemName(language);
    const layout = (
      <Layout style={{ height: '100%', overflow: 'hidden' }}>
        <Switch>
          {map(redirectData, (item) => (
            <Redirect key={item.from} exact from={item.from} to={item.to} />
          ))}
          {bashRedirect ? <Redirect exact from="/" to={bashRedirect} /> : null}
          {menu.length === 0 ? null : <Route render={EMPTY_ROUTE} />}
        </Switch>
        {map(
          tabs,
          (pane) =>
            activeTabKey === pane.key &&
            (!isPubLayout || (location && location.pathname === pane.path)) && (
              <Content key={pane.key} className="page-container" style={showStyle}>
                {isPubLayout && (!menuLoad || layoutLoading) ? (
                  <div style={{ textAlign: 'center', paddingTop: 100 }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  getTabRoutes({
                    pane,
                    routerData,
                    NotFound,
                    menu,
                    menuLoad,
                    pathname: pane.path,
                    activeTabKey,
                  })
                )}
              </Content>
            )
        )}
        {modalVisible && (
          <Modal
            visible
            zIndex={1300000}
            closable={false}
            maskClosable={false}
            title={intl.get('hzero.common.view.title.abnormalLoginReminder').d('多处登录提醒')}
            footer={
              <C7NButton funcType="raised" color="primary" onClick={this.handleSingleLoginOk}>
                {intl.get('hzero.common.view.button.backToLogin').d('返回登录页')}
              </C7NButton>
            }
          >
            <div style={{ padding: '0.16rem 0 0.32rem' }}>
              {intl
                .get('hzero.common.view.message.abnormalLoginReminder')
                .d('抱歉，您的账号已在其他地点登录，您已被迫下线。您可尝试返回登录页重新登录')}
            </div>
          </Modal>
        )}
        <DefaultListenFavicon />
      </Layout>
    );

    return <DocumentTitle title={systemName || currentUser.title || ''}>{layout}</DocumentTitle>;
  }
}

export default connect(({ user = {}, global = {} }) => {
  const { currentUser = {} } = user;
  const { themeConfigVO = {} } = currentUser;
  changeTheme(themeConfigVO);
  return {
    menu: global.menu,
    routerData: global.routerData,
    currentUser: user.currentUser,
    activeTabKey: global.activeTabKey,
    tabs: global.tabs,
    language: global.language,
    isPubLayout: global.isPubLayout,
    menuLoad: global.menuLoad,
    layoutLoading: global.layoutLoading,
    workbenchPermission: global.workbenchPermission,
  };
})(PublicLayout);
