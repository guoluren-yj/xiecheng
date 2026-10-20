import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'dva/router';
import { connect } from 'dva';
import { getRoutes, getCurrentUser } from 'utils/utils';
import Exception from "components/Exception";

const siteTenantNum = process.env.SITE_TENANT_NUM || "SRM";
@connect(({ global }) => ({
  routerData: global.routerData,
}))
export default class RouteIndex extends Component {
  render() {
    const { match, routerData } = this.props;
    const tenantInfo = getCurrentUser().additionInfo || {};
    const routes = getRoutes(match.path, routerData).map(r => {
      if (r.onlySite && tenantInfo.organizationNum !== siteTenantNum) {
        return {
          ...r,
          component: () => <Exception type="403" />
        };
      }
      return r;
    });
    return (
      <Switch>
        {routes.map(item => (
          <Route key={item.key} path={item.path} component={item.component} exact={item.exact} />
        ))}
        {routes.length > 0 ? (
          <Redirect key={match.path} exact from={match.path} to={routes[0].path} />
        ) : null}
      </Switch>
    );
  }
}
