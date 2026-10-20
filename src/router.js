/* eslint-disable camelcase */
// IntersectionObserver polyfill
import 'intersection-observer';
import React, { useCallback, useEffect } from 'react';
import _forEach from 'lodash/forEach';
import { connect } from 'dva';
import { Route, routerRedux, Switch, withRouter } from 'dva/router';
import dynamic from 'dva/dynamic';
import { getCurrentTenant, getCurrentUser } from 'utils/utils';
import ModalContainer, { registerContainer } from 'components/Modal/ModalContainer';
import Cookies from 'universal-cookie';
import querystring from 'querystring';
import { ModalContainer as C7nModalContainer } from 'choerodon-ui/pro';
import Authorized from 'components/Authorized/WrapAuthorized';
import LoadingBar from 'components/NProgress/LoadingBar';
import PermissionProvider from 'components/Permission/PermissionProvider';
import LocalProviderAsync from 'utils/intl/LocaleProviderAsync';
import { dynamicWrapper } from 'utils/router';
import { initIoc } from 'utils/iocUtils';
import { getIsPubLayout } from 'hzero-front/lib/utils/menuTab';
import LeadLink from 'srm-front-boot/lib/components/LeadLink';
import PrecisionProvider from 'srm-front-boot/lib/components/Precision/PrecisionProvider';
import HelpRobotChatProvider from 'srm-front-boot/lib/components/HelpRobot/chatProvider';
import CustomizeProvider from 'srm-front-boot/lib/utils/CustomizeProvider';
import 'srm-front-boot/lib/utils/less-polyfill';
import Guide from '_components/Guide';
import version from './utils/getPkgVersion';
import { cacWaterMark, watermark } from './utils/watermark';
import CustomizeRegister from './components/CustomizeRegister';
import ThemeProvider from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import 'driver.js/dist/driver.min.css';
import { config, processUIError } from './utils/apm';
import { clearEventsListener, eventsListener } from './utils/loginExpiredListener';

// 将一些常用包挂载到 window 上
window.pkgVersion = version;
// import LoadingBar from 'components/LoadingBar';

// 初始化ioc容器
initIoc();

function initWaterMark() {
  const f = () => {
    const container = document.querySelector(
      '.ant-tabs[class*=\'index_menu-tabs\']>.ant-tabs-content',
    );
    if (!container) {
      setTimeout(f, 300);
      return;
    }
    const oldWater = container.querySelectorAll('.mask_mark');
    const config = cacWaterMark(container);
    const newMaskNums = config.watermark_cols * config.watermark_rows;
    if (newMaskNums === oldWater.length) {
      setTimeout(f, 300);
      return;
    }
    const { realName, loginName, waterMarkFlag } = getCurrentUser();
    if (oldWater.length > 0) {
      oldWater.forEach(node => {
        container.removeChild(node);
      });
    }
    if (waterMarkFlag) {
      watermark(`${loginName}-${realName}-${new Date().toLocaleDateString()}`, config, container);
    }
    setTimeout(f, 300);
  };
  setTimeout(f, 300);
}

initWaterMark();
const WithRouterC7nModalContainer = withRouter(C7nModalContainer);
const { ConnectedRouter } = routerRedux;
const { DefaultAuthorizedRoute, PubAuthorizedRoute } = Authorized;
// TODO 将默认进度条放在BasicLayout中设置
dynamic.setDefaultLoadingComponent(() => {
  return <LoadingBar />;
});

// 打开商城界面
// function openMall() {
//   // 获取access_token
//   // eslint-disable-next-line
//   const access_token = getAccessToken();
//   // eslint-disable-next-line
//   window.open(`${SRM_MALL_HOST}#access_token=${access_token}`, '_black');
// }

// 屈臣氏取消首页提醒绑定手机号弹框公告
const TenantHideModal = connect(({ user = {} }) => ({
  user,
}))(props => {
  useEffect(() => {
    const { dispatch, user = {} } = props;
    if (getCurrentTenant().tenantNum === 'SRM-WATSONS') {
      dispatch({
        type: 'user/updateState',
        payload: {
          currentUser: {
            ...user.currentUser,
            popoutReminderFlag: 0,
          },
        },
      });
    }
  }, []);
  return null;
});

function findRouteFromPathname(pathname, routerData) {
  let findRoute;

  _forEach(routerData, (route) => {
    if (route && route.pathRegexp && route.pathRegexp.test(pathname)) {
      findRoute = route;
      return false;
    }
  });

  return findRoute;
}

const LayoutWrapper = connect(({ global = {}, user }) => ({
  menus: global.menu,
  routerData: global.routerData || {},
  user,
}))(props => {
  const { layoutType, Layout, menus, routerData, user, ...otherProps } = props;
  useEffect(() => {
    if (layoutType !== 'public') {
      if (user && user.currentUser) {
        eventsListener(user.currentUser.additionInfo);
      }

      return () => {
        clearEventsListener();
      };
    }
  }, [layoutType]);

  if (layoutType === 'public') {
    if (user && user.currentUser) {
      const cookie = new Cookies();
      const tenantId = cookie.get('tenantId', { path: '/' });
      if (tenantId !== undefined) {
        user.currentUser.tenantId = Number(tenantId);
        user.currentUser.organizationId = Number(tenantId);
      }
    }
    return <Layout {...otherProps} />;
  }

  // 数据漫游埋点接入配置
  config(() => {
    const {
      location: { pathname },
    } = props;
    return {
      menus,
      getPath(pathname$) {
        const route = findRouteFromPathname(pathname$, routerData);
        return route && route.path;
      },
      pathname,
    };
  });

  if (layoutType === 'pub') {
    return (
      <ThemeProvider>
        <Layout {...otherProps} />
      </ThemeProvider>
    );
  }
  return (
    <ThemeProvider>
      <div>
        <TenantHideModal />
        {/* 用来标识当前环境，只用于dev和test */}
        {process.env.ENV_FLAG_BACKGROUND && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '0.06rem',
              background: process.env.ENV_FLAG_BACKGROUND,
            }}
          />
        )}
        <Layout
          extraHeaderRight={[<LeadLink />]}
          headerProps={{ toolbarProps: { extraHeaderRight: <LeadLink /> } }}
          {...otherProps}
        />
      </div>
    </ThemeProvider>
  );
});

function handleError(error) {
  processUIError(error);
}

function RouterConfig({ history, app }) {
  const Layout = dynamicWrapper(app, ['user', 'login'], () =>
    import('hzero-front/lib/layouts/Layout'),
  );
  const PubLayout = dynamicWrapper(app, ['user', 'login'], () =>
    import('hzero-front/lib/layouts/PubLayout'),
  );
  // 免登陆无权限路由
  const PublicLayout = dynamicWrapper(app, [], () =>
    import('hzero-front/lib/layouts/PublicLayout'),
  );

  const checkIsPubLayoutRoute = useCallback(
    ({ history: { location: { pathname = '', search = '' } = {} } = {} }) => {
      const { isPub } = querystring.parse(search.substring(1)) || {};
      return !/\/hwfp\/(approval\/)?task\/detail(\/)/.test(pathname) && (getIsPubLayout() || isPub === 'true');
    },
    [],
  );


  return (
    <ErrorBoundary onError={handleError}>
      {/* <UedTheme /> */}
      <LocalProviderAsync>
        <PermissionProvider>
          <PrecisionProvider>
            <CustomizeProvider>
              <HelpRobotChatProvider>
                <ConnectedRouter history={history}>
                  <React.Fragment>
                    <Guide />
                    <ModalContainer ref={registerContainer} />
                    <WithRouterC7nModalContainer />
                    <CustomizeRegister />
                    <Switch>
                      <Route
                        path="/public"
                        render={props => (
                          <LayoutWrapper {...props} Layout={PublicLayout} layoutType="public" />
                        )}
                      />
                      <PubAuthorizedRoute
                        path="/pub"
                        render={props => (
                          <LayoutWrapper {...props} Layout={PubLayout} layoutType="pub" />
                        )}
                      />
                      <DefaultAuthorizedRoute
                        path="/"
                        render={props => (
                          <LayoutWrapper
                            {...props}
                            Layout={checkIsPubLayoutRoute(props) ? PubLayout : Layout}
                            layoutType="default"
                          />
                        )}
                      />
                    </Switch>
                  </React.Fragment>
                </ConnectedRouter>
              </HelpRobotChatProvider>
            </CustomizeProvider>
          </PrecisionProvider>
        </PermissionProvider>
      </LocalProviderAsync>
    </ErrorBoundary>
  );
}

export default RouterConfig;
