import React, { Suspense } from 'react';
import { Spin } from 'hzero-ui';
import { getCurrentUser } from 'utils/utils/user';
import { getRoutesContainsSelf } from 'utils/utils/routers';
import { checkModuleLoaded } from 'utils/utils/module';
import Route from './Route';
import Switch from './Switch';
import Exception from "components/Exception";

const siteTenantNum = process.env.SITE_TENANT_NUM || "SRM";
export default function getTabRoutes({
  pane,
  routerData,
  NotFound,
  menu,
  activeTabKey,
  pathname,
} = {}) {
  const { key: tabKey, path: tabPath } = pane;
  const tenantInfo = getCurrentUser().additionInfo || {};
  const matchRoutes = getRoutesContainsSelf(tabKey, routerData).map((item) => {
    let Component = item.component;
    if (item.onlySite && tenantInfo.organizationNum !== siteTenantNum) {
      Component = () => <Exception type="403" />
    }
    return (
      <Route
        key={item.key}
        path={item.path}
        exact={item.exact}
        render={props => (
          <React.Suspense fallback={<Spin spinning />}>
            <Component {...props} />
          </React.Suspense>
        )}
      />
    );
  });
  const existRouter = Object.values(routerData).find((item) => item.pathRegexp.test(pathname));
  if (menu.length !== 0 && !existRouter) {
    // 判断路由是否已加载完毕
    if (tabPath === pathname && !checkModuleLoaded(pathname)) {
      return (
        <div style={{ textAlign: 'center', paddingTop: 100 }}>
          <Spin size="large" />
        </div>
      );
    }
    matchRoutes.push(<Route key="empty-router" render={NotFound} />);
  }
  return (
    <Switch tabKey={tabKey} activeTabKey={activeTabKey} tabPathname={tabPath} key={tabKey}>
      {matchRoutes}
    </Switch>
  );
}
