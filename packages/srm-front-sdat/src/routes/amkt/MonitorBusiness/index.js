/* eslint-disable no-param-reassign */
/**
 * 企业监控页面
 */
import React, { useRef } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import { getResponse, getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import ExcelExportPro from '@/components/ExcelExportPro';
import StaticSearchBar from '@/components/StaticSearchBar';
import { SRM_DATA_SDAT } from '@/utils/config';
import { switchMapClass } from '@/utils/constant';
import { fetchRemoveItem } from '@/services/monitorBusinessService';
import { Button as PermissionButton } from 'components/Permission';

import {
  MonitorListDS,
  BusinessListDS,
  AddedBusinessListDS,
  getResultDetailDs,
} from './stores/monitorBusinessDS';
import { getQueryConfig } from './queryConfig';
import BusinessAddModal from './BusinessAddModal';
import RiskScanModal from './RiskScanModal';
import './index.less';
import styles from './style.less';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

// 权限集
const addMonitorOrgPmn = 'srm.bg.manager.enterprise-control.monitor-overview.button.add-org'; // 头部添加企业按钮
const riskScanPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.risk-scan'; // 表格行风险扫描操作按钮
const removeOrgPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.remove-org'; // 表格行一处企业移除操作按钮

const MonitorBusiness = props => {
  const { listDS, businessListDS, addedListDS, resultDetailDs } = props.valueDs;
  let allSearchBarRef = useRef(null);

  /**
   * 风险扫描
   * @param {*} record
   */
  const handleScanRisk = record => {
    let modal = null;

    const handleCloseModal = () => {
      modal.close();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.riskScan').d('风险扫描'),
      children: <RiskScanModal record={record} />,
      closable: true,
      drawer: true,
      mask: false,
      style: { width: '1300px' },
      footer: (
        <div>
          <Button color="primary" onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  /**
   * 移除企业
   * @param {*} record
   */
  const handleRemoveRisk = record => {
    const obj = { ...record.toData() };
    fetchRemoveItem({
      monitorList: [{ ...obj }],
    }).then(res => {
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
        name: 'expireDate',
      },
      {
        name: 'effectiveFlag',
        renderer: ({ value, record }) => {
          const classStr = value === 0 ? styles['tag-over-time'] : styles['tag-in-time'];
          return <span className={classStr}>{record?.get('effectiveFlagMeaning') ?? ''}</span>;
        },
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

  const queryParams = () => {
    const params = listDS?.queryDataSet?.toData() ?? [{}];
    return { ...params[0] };
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

  /**
   * 打开添加企业弹窗
   */
  const openAddCompanyModal = () => {
    let modal = null;

    const handleCloseModal = () => {
      modal.close();
    };

    const addBusiness = () => {
      listDS.query();
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addMonitorBusiness').d('添加监控企业'),
      children: (
        <BusinessAddModal
          onAddBusiness={addBusiness}
          businessListDS={businessListDS}
          addedListDS={addedListDS}
          resultDetailDs={resultDetailDs}
          onClose={handleCloseModal}
        />
      ),
      closable: true,
      drawer: true,
      mask: false,
      fullScreen: true,
      style: { width: '1000px' },
      footer: null,
    });
  };

  return (
    <div className="monitor-business-basic">
      <Header
        title={intl.get('sdat.monitorBusiness.view.title.monitorBusiness').d('监控企业')}
        backPath="/sdat/supplier-risk-monitor-org"
      >
        <PermissionButton
          onClick={openAddCompanyModal}
          permissionList={[{ code: addMonitorOrgPmn }]}
          type="c7n-pro"
          icon="add"
          color="primary"
        >
          {intl.get('sdat.monitorBusiness.view.button.addBusiness').d('添加企业')}
        </PermissionButton>
        <ExcelExportPro
          buttonText={intl.get('sdat.common.view.button.exportExcel').d('导出')}
          requestUrl={`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/monitor-export`}
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            mask: false,
          }}
          defaultSelectAll
          queryParams={{ ...queryParams, ...passParams }}
        />
      </Header>
      <Content>
        <StaticSearchBar
          cacheState
          clearButton
          onRef={ref => {
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
      const businessListDS = new DataSet(BusinessListDS());
      const addedListDS = new DataSet(AddedBusinessListDS()); // 已添加监控的企业
      const resultDetailDs = new DataSet(getResultDetailDs()); // 添加企业后的详情结果
      const valueDs = {
        listDS,
        businessListDS,
        addedListDS,
        resultDetailDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorBusiness)
);
