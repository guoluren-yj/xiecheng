import React from 'react';
import { routerRedux, Switch, Route, withRouter } from 'dva/router';
import { Container } from '@hzero-front-ui/cfg/lib';
import ModalContainer, { registerContainer } from 'components/Modal/ModalContainer';
import { ModalContainer as C7nModalContainer } from 'choerodon-ui/pro';
import Authorized from 'components/Authorized/WrapAuthorized';
import PermissionProvider from 'components/Permission/PermissionProvider';
import PrecisionProvider from '_components/Precision/PrecisionProvider';
import ChatProvider from '_components/HelpRobot/chatProvider';

import LocalProviderAsync from 'utils/intl/LocaleProviderAsync';
import { dynamicWrapper } from 'utils/router';
import { initIoc } from 'utils/iocUtils';
import LeadLink from 'srm-front-boot/lib/components/LeadLink';
import { loadMicroModuleFromPathname } from 'hzero-boot/lib/entry/root/getMicroModuleRouters';
import 'srm-front-boot/lib/utils/less-polyfill';
import CustomizeProvider from 'srm-front-boot/lib/utils/CustomizeProvider';
import CustomizeRegister from './components/CustomizeRegister';

window.routerRedux = routerRedux;
window.loadMicroModule = loadMicroModuleFromPathname;
// 初始化ioc容器
initIoc();
const WithRouterC7nModalContainer = withRouter(C7nModalContainer);
const { ConnectedRouter } = routerRedux;
const { DefaultAuthorizedRoute, PubAuthorizedRoute } = Authorized;

function RouterConfig({ history, app }) {
  const Layout = dynamicWrapper(
    app,
    ['user', 'login'],
    () => import('hzero-front/lib/layouts/Layout')
    // import('./layouts/DefaultLayout')
  );
  const PubLayout = dynamicWrapper(app, ['user', 'login'], () =>
    import('hzero-front/lib/layouts/PubLayout')
  );
  // 免登陆无权限路由
  const PublicLayout = dynamicWrapper(app, [], () =>
    import('hzero-front/lib/layouts/PublicLayout')
  );

  const allowDrag = event => {
    event.preventDefault();
  };

  return (
    <Container defaultTheme="theme2">
      {/* <UedTheme /> */}
      <LocalProviderAsync>
        <PermissionProvider>
          <ChatProvider>
            <PrecisionProvider>
              <CustomizeProvider>
                <ConnectedRouter history={history}>
                  <React.Fragment>
                    <ModalContainer ref={registerContainer} />
                    <WithRouterC7nModalContainer />
                    <CustomizeRegister />
                    <Switch>
                      <Route path="/public" render={props => <PublicLayout {...props} />} />
                      <PubAuthorizedRoute path="/pub" render={props => <PubLayout {...props} />} />
                      {/* <AuthorizedRoute path="/" render={props => <BasicLayout {...props} />} /> */}
                      <DefaultAuthorizedRoute
                        path="/"
                        render={props => (
                          <div onDragOver={allowDrag}>
                            <Layout
                              extraHeaderRight={[<LeadLink />]}
                              headerProps={{ toolbarProps: { extraHeaderRight: <LeadLink /> } }}
                              {...props}
                            />
                          </div>
                        )}
                      />
                    </Switch>
                  </React.Fragment>
                </ConnectedRouter>
              </CustomizeProvider>
            </PrecisionProvider>
          </ChatProvider>
        </PermissionProvider>
      </LocalProviderAsync>
    </Container>
  );
}

export default RouterConfig;
