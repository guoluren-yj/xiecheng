/* eslint-disable no-param-reassign */
/**
 * 企业监控页面
 */
import React, { useRef } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import StaticSearchBar from '@/components/StaticSearchBar';
import { switchMapClass } from '@/utils/constant';
import { fetchRemoveItem, getRiskScanUrl } from '@/services/monitorBusinessService';
import { Button as PermissionButton } from 'components/Permission';

import { MonitorListDS } from './stores/monitorBusinessDS';
import { getQueryConfig } from './queryConfig';
// import RiskScanModal from './RiskScanModal';
import './index.less';

const riskScanPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.risk-scan'; // 表格行风险扫描操作按钮
const removeOrgPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.remove-org'; // 表格行一处企业移除操作按钮

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const commonParam = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const MonitorBusiness = (props) => {
  const { listDS } = props.valueDs;
  let allSearchBarRef = useRef(null);

  /**
   * 风险扫描
   * @param {*} record
   */
  const handleScanRisk = (record) => {
    getRiskScanUrl({
      keyWord: record?.get('enterpriseName'),
      gatewayUrl: location?.origin ?? '',
      ...commonParam,
    }).then((res) => {
      if (res && res.success) {
        if (res && res.data) {
          window.open(res.data);
        }
      } else {
        notification.error({
          message: res?.message ?? res?.msg ?? '',
        });
      }
    });
  };

  /**
   * 移除企业
   * @param {*} record
   */
  const handleRemoveRisk = (record) => {
    const obj = { ...record.toData() };
    fetchRemoveItem({
      monitorList: [{ ...obj }],
    }).then((res) => {
      if (getResponse(res)) {
        listDS.query();
      }
    });
  };

  const columns = () => {
    return [
      {
        name: 'enterpriseName',
      },
      {
        name: 'riskLevel',
        width: 120,
        renderer: ({ text, record }) => {
          const val = record.get('riskLevel');
          return val ? (
            <span className={`monitor-business-tag-basic ${switchMapClass[val]}`}>{text}</span>
          ) : null;
        },
      },
      {
        name: 'socialCode',
      },
      {
        name: 'lastScanTime',
      },
      {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <PermissionButton
                permissionList={[{ code: riskScanPmn }]}
                type="text"
                onClick={() => handleScanRisk(record)}
              >
                {intl.get('sdat.monitorBusiness.view.button.riskScan').d('风险扫描')}
              </PermissionButton>
              <Popconfirm
                title={intl
                  .get('sdat.monitorBusiness.view.message.confirmRemoveBusiness')
                  .d('是否确认移除监控企业')}
                onConfirm={() => handleRemoveRisk(record)}
                onCancel={() => {}}
              >
                <PermissionButton permissionList={[{ code: removeOrgPmn }]} type="text">
                  {intl.get('sdat.monitorBusiness.view.button.removeBusiness').d('移除企业')}
                </PermissionButton>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
  };

  const fieldProps = {};

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [{ ...params }];
    listDS.query();
  };

  const handleClear = () => {
    if (allSearchBarRef && allSearchBarRef.setField) {
      allSearchBarRef.setField('businessName', '');
      allSearchBarRef.setField('isErp', '');
      allSearchBarRef.setField('riskLevel', '');
      allSearchBarRef.setField('offerDate', '');
    }
  };

  return (
    <div className="monitor-business-basic">
      <Header
        title={intl.get('sdat.monitorBusiness.view.title.monitorBusiness').d('监控企业')}
        backPath="/sdat/supplier-risk-monitor-org"
      />
      <Content>
        <StaticSearchBar
          cacheState
          clearButton
          onRef={(ref) => {
            allSearchBarRef = ref;
          }}
          searchCode="SDAT.SUPPLIER_MONITOR_BUSINESS_LIST"
          filters={getFilters()}
          dataSet={[listDS]}
          onQuery={handleFilterQueryAll}
          onClear={handleClear}
          onReset={handleClear}
          showLoading={false}
          fieldProps={fieldProps}
        />
        <div className="table-box">
          <Table
            border={false}
            dataSet={listDS}
            queryBar="none"
            columns={columns()}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
          />
        </div>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.monitorBusiness', 'sdat.common'],
})(
  withProps(
    () => {
      const listDS = new DataSet(MonitorListDS());
      const valueDs = {
        listDS,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorBusiness)
);
