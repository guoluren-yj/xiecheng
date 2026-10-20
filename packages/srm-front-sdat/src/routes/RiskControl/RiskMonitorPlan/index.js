/**
 * 风控工作台 2.0 - 风险监控方案定义
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import { DataSet, Table } from 'choerodon-ui/pro';
// import { queryIdpValue } from 'services/api';

import StaticSearchBar from '@/components/StaticSearchBar';
import { fetchUpdateConfig } from '@/services/riskScanConfig/monitorConfigService';

import { DefineListDS } from './stores/schemaConfigDS';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const RiskScanSchemaConfig = ({ defineListDS, history }) => {
  /**
   * 查看操作
   */
  const handleEditItem = (record, pageType) => {
    const riskPlanId = record?.get('riskPlanId') ?? '';
    if (riskPlanId) {
      history.push(`/sdat/risk-workbench-new/monitor-plan/view-detail/${riskPlanId}/${pageType}`);
    }
  };

  const handleViewItem = record => {
    const riskPlanId = record?.get('riskPlanId') ?? '';
    if (riskPlanId) {
      history.push(`/sdat/risk-workbench-new/monitor-plan/view/${riskPlanId}`);
    }
  };

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const handleEnabledItem = async record => {
    const obj = record?.toData() ?? {};

    const { enabledFlag } = obj || {};

    const flagValue = enabledFlag === 0 ? 1 : 0;
    const res = await fetchUpdateConfig({
      ...obj,
      enabledFlag: flagValue,
      statusSaveFlag: 1,
      planContentType: 'basic',
      planType: 'MONITOR',
    });
    if (getResponse(res)) {
      defineListDS.query();
    }
  };

  const columns = () => {
    return [
      {
        name: 'enabledFlag',
        width: 80,
        lock: 'left',
        align: 'left',
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value === 0
                ? intl.get('hzero.common.status.disabled').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')}
            </span>
          );
        },
      },
      {
        name: 'operation',
        width: 200,
        renderer: ({ record }) => {
          const value = record.get('enabledFlag');
          return (
            <span className="action-link">
              {[0, '0'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-workbench-new.api.scanSchemaConfig-edit' }]}
                  type="text"
                  onClick={() => handleEditItem(record, 'edit')}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </PermissionButton>
              ) : null}

              {[0, '0'].includes(value) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-workbench-new.api.scanSchemaConfig-enabled' }]}
                  type="text"
                  onClick={() => handleEnabledItem(record)}
                >
                  {intl.get('hzero.common.model.status.enable').d('启用')}
                </PermissionButton>
              ) : (
                <PermissionButton
                  permissionList={[{ code: 'risk-workbench-new.api.scanSchemaConfig-enabled' }]}
                  type="text"
                  onClick={() => handleEnabledItem(record)}
                >
                  {intl.get('hzero.common.model.status.disable').d('禁用')}
                </PermissionButton>
              )}
            </span>
          );
        },
      },
      {
        name: 'planNumber',
        width: 150,
        renderer: ({ text, record }) => {
          return (
            <PermissionButton
              permissionList={[{ code: 'risk-workbench-new.api.scanSchemaConfig-view' }]}
              type="text"
              onClick={() => handleViewItem(record)}
            >
              {text}
            </PermissionButton>
          );
        },
      },
      { name: 'planName', width: 200 },
      // { name: 'chargePerson', width: 200 },
      // { name: 'stakeholder', width: 200 },
      { name: 'scanScopeType' },
      { name: 'planCompanyType' },
      { name: 'lastUpdatedUserName' },
      { name: 'lastUpdateDate', width: 200 },
    ].filter(Boolean);
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    const timeRange = params?.dateRange_range?.split(',') ?? [];
    const startDate = timeRange && timeRange.length && timeRange[0] ? `${timeRange[0]}` : '';
    const endDate = timeRange && timeRange.length > 1 && timeRange[1] ? `${timeRange[1]}` : '';

    defineListDS.queryDataSet.loadData([
      {
        ...params,
        planType: 'MONITOR',
        startDate,
        endDate,
        dateRange_range: '',
        customizeOrderField: '',
      },
    ]);
    defineListDS.setQueryParameter(
      'sort',
      params?.customizeOrderField?.replaceAll('dateRange', 'lastUpdateDate').replaceAll(':', ',') ??
        'lastUpdateDate,desc'
    );
    defineListDS.query();
  };

  const handleCreateItem = () => {
    history.push('/sdat/risk-workbench-new/monitor-plan/detail/create');
  };

  return (
    <div className={styles['risk-scan-schema-config-basic']}>
      <Header
        title={intl.get('sdat.riskScanConfig.view.title.riskMonitorPlan').d('风险监控方案配置')}
        backPath="/sdat/risk-workbench-new/list"
      >
        <PermissionButton
          permissionList={[{ code: 'risk-workbench-new.api.scanSchemaConfig-create' }]}
          icon="add"
          type="c7n-pro"
          color="primary"
          onClick={handleCreateItem}
        >
          {intl.get('sdat.riskScanConfig.view.button.create').d('新建')}
        </PermissionButton>
      </Header>
      <div className={styles['risk-scan-schema-config-content']}>
        <div className={styles['risk-def-search-basic-panel']}>
          <StaticSearchBar
            cacheState
            clearButton
            searchCode="SDAT.RISK_MONITOR_SCHEMA_CONFIG_SEARCH_BAR"
            filters={getFilters()}
            dataSet={[defineListDS]}
            onQuery={handleFilterQueryAll}
            showLoading={false}
            fieldProps={{}}
          />
        </div>
        <div>
          <div style={{ height: 'calc(100vh - 298px)' }}>
            <Table
              dataSet={defineListDS}
              columns={columns()}
              queryBar="none"
              autoHeight={{ type: 'maxHeight', diff: 40 }}
              customizable
              customizedCode="SDAT.RISK_MONITOR_SCHEMA_CONFIG_LIST"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(state => state)(
  formatterCollections({
    code: ['sdat.riskScanConfig', 'sdat.common'],
  })(
    withProps(
      () => {
        const defineListDS = new DataSet(DefineListDS());

        return {
          defineListDS,
        };
      },
      { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
    )(RiskScanSchemaConfig)
  )
);
