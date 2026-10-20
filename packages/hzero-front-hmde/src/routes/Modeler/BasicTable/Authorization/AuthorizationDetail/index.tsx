import React, { useState, useContext } from 'react';
import { Tabs } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import EmptyPage from '@/routes/Modeler/component/EmptyPage';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';
import { EAuthorization } from '@/globalData/modelManager';
import BasicTableAuthorized from './BasicTableAuthorized';
import ApiAuthorized from './ApiAuthorized';
import styles from './index.less';

const { TabPane } = Tabs;

export default observer(function index() {
  const {
    storeData: { tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const [tabVal, setTabVal] = useState<EAuthorization>(EAuthorization.BASIC_TABLE);

  return (
    <Tabs
      className={styles['authorization-list-detail']}
      activeKey={tabVal}
      defaultActiveKey={EAuthorization.BASIC_TABLE}
      onChange={(activeKey) => setTabVal(activeKey as EAuthorization)}
    >
      <TabPane
        tab="基础表授权"
        key={EAuthorization.BASIC_TABLE}
        // className={styles['basic-table-tab-pan']}
      >
        {[0].includes(tenantId as any) || tenantId ? (
          <BasicTableAuthorized tabVal={tabVal} />
        ) : (
          <EmptyPage
            help="检测到当前基础表授权暂未选择租户"
            message="请确认是否有权限且当前至少选择一个租户"
          />
        )}
      </TabPane>
      <TabPane tab="API授权" key={EAuthorization.API} className={styles['api-table-tab-pan']}>
        {[0].includes(tenantId as any) || tenantId ? (
          <ApiAuthorized />
        ) : (
          <EmptyPage
            help="检测到当前API表授权暂未选择租户"
            message="请确认是否有权限且当前至少选择一个租户"
          />
        )}
      </TabPane>
    </Tabs>
  );
});
