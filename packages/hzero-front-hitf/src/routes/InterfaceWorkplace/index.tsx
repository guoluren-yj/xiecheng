import React, { useState, useEffect } from 'react';
import { Tabs } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Content, Header } from 'hzero-front/lib/components/Page';
import Alarm from './Alarm';
import QueryConfig from './QueryConfig';
import Encryption from './Encryption';
import ApplicationManage from './ApplicationManage';
import InterfaceDefinition from './InterfaceDefinition';

const { TabPane } = Tabs;

// 是否为租户
const isTenant = isTenantRoleLevel();

const InterfaceWorkplace: React.FC<any> = (props) => {
  const [tabKey, setTabKey] = useState('2');

  useEffect(() => {
    if (props.location.state && props.location.state.active) {
      setTabKey(props.location.state.active);
    }
  }, []);

  const handleChangeTabs = (key) => {
    setTabKey(key);
  };

  return (
    <>
      <Header title={intl.get('hitf.interfaceWorkplace.tab.title.header').d('接口配置工作台')} />
      <Content style={{ overflowY: 'auto', height: 'calc(100% - 20px) !important', padding: '16px 16px 0', margin: '0.08rem' }}>
        <Tabs activeKey={tabKey} onChange={handleChangeTabs}>
          <TabPane tab={intl.get('hitf.interfaceWorkplace.tab.title.queryConfig').d('接口查询配置')} key='2'>
            <QueryConfig tabKey={tabKey} />
          </TabPane>
          {isTenant && (
            <>
              <TabPane tab={intl.get('hitf.interfaceWorkplace.tab.title.alarm').d('接口告警')} key='3'>
                <Alarm />
              </TabPane>
              <TabPane tab={intl.get('hzero.common.status.encryptFlag').d('接口加密')} key='encryption'>
                <Encryption />
              </TabPane>
              <TabPane tab={intl.get('hitf.interfaceWorkplace.tab.api.manage').d('API管理')} key='apiManage'>
                <InterfaceDefinition history={props.history} />
              </TabPane>
              <TabPane tab={intl.get('hitf.application.view.title.header').d('应用管理')} key='appManage'>
                <ApplicationManage />
              </TabPane>
            </>
          )}
        </Tabs>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hitf.InterfaceWorkplace', 'hitf.interfaceWorkplace', 'hzero.common', 'hitf.application'],
})(InterfaceWorkplace));
