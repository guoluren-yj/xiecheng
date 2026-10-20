/* eslint-disable react/jsx-filename-extension */
/**
 * @description 接口流量控制
 * @export InterfaceFlowControl
 * @class InterfaceFlowControl
 * @extends {Component}
 */

import React, { Fragment } from 'react';
import { Tabs } from 'choerodon-ui';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import PlatformRestriction from './PlatformRestriction';
import TenantRestrictions from './TenantRestrictions';
import RestrictedWhiteList from './RestrictedWhiteList';

const { TabPane } = Tabs;


const InterfaceFlowControl = () => {

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.interfaceFlowControl.view.title.interfaceFlowControl`)
          .d('接口流量控制')}
      />
      <Content>
        <Tabs tabPosition="left" tabBarStyle={{height: 'calc(100vh - 188px)'}}>
          <TabPane
            key="platform"
            tab={intl
              .get('scux.interfaceFlowControl.view.menu.platform.restrictions')
              .d('平台限制规则')}
          >
            <PlatformRestriction />
          </TabPane>
          <TabPane
            key="tenant"
            tab={intl
              .get('scux.interfaceFlowControl.view.menu.tenant.restrictions')
              .d('租户限制规则')}
          >
            <TenantRestrictions />
          </TabPane>
          <TabPane
            key="whitelist"
            tab={intl
              .get('scux.interfaceFlowControl.view.menu.restricted.whitelist')
              .d('限制白名单')}
          >
            <RestrictedWhiteList />
          </TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.interfaceFlowControl', 'hzero.common'],
})(InterfaceFlowControl);
