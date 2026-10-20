/* eslint-disable eqeqeq */
/**
 * 监控企业管理：MonitorOrgManagement
 * @date: 2022-09-13
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

import React, { useState, useEffect } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import qs from 'querystring';
import { routerRedux } from 'dva/router';
import { Button as PermissionButton } from 'components/Permission';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import { getLocalUrlParam } from '@/utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';
import { ReactExportButton } from './ReactExportButton';
import MonitorOrgPanel from './MonitorOrgPanel';
import MonitorStuffPanel from './MonitorStuffPanel';
import { stuffListDS } from './store/monitorOrgManagementDs';

import style from './index.less';

const { TabPane } = Tabs;

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const exportMonitorOrg = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/admin-monitor-export`;
const exportMonitorStuff = `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/user-export`;
// 子元素表格的查询参数
const orgDsParam = {};
const stuffDsParam = {};

// 權限集
const orgRiskLevelPermission =
  'srm.bg.manager.enterprise-control.monitor-manage.button.risk-control-log'; // 風控日志按鈕

function MonitorOrgManagement(props = {}) {
  const { sourceRouter = '' } = qs.parse(props.location.search.substr(1)); // 截取url上面传递参数
  const { stuffListDs } = props.valueDs;
  const { history } = props;

  const [currentKey, setCurrentKey] = useState('1');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectStuff, setSelectStuff] = useState(false); // 记录选择员工的组件是否选中了
  const [defaultItem, setDefaultItem] = useState(null);
  const [selected, setSelected] = useState({});

  const { activeFlag = '', selectUserId = '' } = getLocalUrlParam();

  useEffect(() => {
    if (activeFlag) {
      setCurrentKey(activeFlag);
    }
    if (selectUserId) {
      setDefaultItem({ userId: selectUserId });
    }
  }, [activeFlag, selectUserId]);

  const handleTabChange = e => {
    setCurrentKey(e);
  };

  const handleRiskLogClick = () => {
    props.dispatch(
      routerRedux.push(
        `/sdat/monitor-org-management/credit-log?activeKey=${currentKey}&selectUserId=${selected?.userId ??
          ''}`
      )
    );
  };

  const getOrgChildDs = obj => {
    Object.assign(orgDsParam, { ...obj });
    setRefreshKey(refreshKey + 1);
  };
  const getStuffChildDs = obj => {
    Object.assign(stuffDsParam, { ...obj });
    setRefreshKey(refreshKey + 1);
  };

  const handlePushPage = () => {
    history.push(`/sdat/monitor-org-management/risk-level-define?tenantId=${tenantId}`);
  };

  /**
   * 查看挖掘详情
   */
  // const handleViewMiningDetail = () => {
  //   history.push(`/sdat/monitor-org-management/mining-detail`);
  // };

  return (
    <>
      <Header
        title={intl
          .get('sdat.monitorOrgManagement.view.header.monitorOrgManagement')
          .d('企业监控管理')}
        backPath={sourceRouter}
      >
        <PermissionButton
          permissionList={[
            { code: 'risk-workplace-monitor-org-management.button.risk-control-log' },
            { code: orgRiskLevelPermission },
          ]}
          icon="assignment"
          type="c7n-pro"
          funcType="flat"
          onClick={handleRiskLogClick}
        >
          {intl.get('sdat.monitorOrgManagement.view.button.riskControlLog').d('风控日志')}
        </PermissionButton>
        {(currentKey == '1' || (currentKey == '2' && selectStuff)) && (
          <ReactExportButton
            btnText={intl.get('sdat.monitorOrgManagement.view.button.export').d('导出')}
            exportRequestUrl={currentKey == '1' ? exportMonitorOrg : exportMonitorStuff}
            params={{
              ...passParams,
              ...(currentKey == '1' ? orgDsParam : stuffDsParam),
            }}
          />
        )}

        <Button funcType="flat" onClick={handlePushPage} style={{ marginRight: '8px' }}>
          {intl.get('sdat.riskScanReport.view.title.riskLevelDef').d('风险等级定义')}
        </Button>
      </Header>
      <Content className={style['content-box']}>
        <Tabs activeKey={currentKey} onChange={handleTabChange}>
          <TabPane
            tab={intl.get('sdat.monitorOrgManagement.view.tabs.monitorOrg').d('监控企业')}
            key="1"
          >
            <MonitorOrgPanel setDs={getOrgChildDs} history={history} />
          </TabPane>
          <TabPane
            tab={intl.get('sdat.monitorOrgManagement.view.tabs.monitorStuff').d('监控人员')}
            key="2"
          >
            <MonitorStuffPanel
              stuffListDs={stuffListDs}
              defaultItem={defaultItem}
              setDs={getStuffChildDs}
              setSelectStuff={setSelectStuff}
              onSelectedItem={item => setSelected(item)}
            />
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['sdat.monitorOrgManagement', 'sdat.riskScanReport'],
})(
  withProps(
    () => {
      const stuffListDs = new DataSet({ ...stuffListDS() });

      const valueDs = { stuffListDs };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorOrgManagement)
);
