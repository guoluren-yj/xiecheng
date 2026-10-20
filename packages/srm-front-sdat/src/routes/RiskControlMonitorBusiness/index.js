/* eslint-disable no-param-reassign */
/**
 * 企业监控页面
 */
import React, { useRef, useEffect, useState } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
// import { Popconfirm } from 'choerodon-ui';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

import PermissionExport from '@/components/PermissionExport';
import StaticSearchBar from '@/components/StaticSearchBar';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getUrlParam } from '@/utils/utils';
// import { switchMapClass } from '@/utils/constant';
import { getRiskScanUrl } from '@/services/riskBusinessService';
import { Button as PermissionButton } from 'components/Permission';

import {
  MonitorListDS,
  BusinessListDS,
  AddedBusinessListDS,
  getResultDetailDs,
} from './stores/monitorBusinessDS';
import { getQueryConfig } from './queryConfig';
import BusinessAddModal from './BusinessAddModal';
// import RiskScanModal from './RiskScanModal';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

// 权限集
// const addMonitorOrgPmn = 'srm.bg.manager.enterprise-control.monitor-overview.button.add-org'; // 头部添加企业按钮
// const riskScanPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.risk-scan'; // 表格行风险扫描操作按钮
// const removeOrgPmn = 'srm.bg.manager.enterprise-control.monitor-overview.api.remove-org'; // 表格行一处企业移除操作按钮

const MonitorBusiness = (props) => {
  const { listDS, businessListDS, addedListDS, resultDetailDs } = props.valueDs;
  let allSearchBarRef = useRef(null);

  const [hiddenFlag, setHidden] = useState('');

  useEffect(() => {
    const { riskFlag = '' } = getUrlParam() || {};
    setHidden(riskFlag);
  }, []);

  /**
   * 风险扫描
   * @param {*} record
   */
  const handleScanRisk = (record) => {
    getRiskScanUrl({
      keyWord: record?.get('enterpriseName'),
      gatewayUrl: location?.origin ?? '',
      ...passParams,
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
  // const handleRemoveRisk = record => {
  //   Modal.confirm({
  //     title: intl.get('hzero.common.message.confirm.title').d('提示'),
  //     children: (
  //       <div>
  //         {intl
  //           .get('sdat.monitorBusiness.view.message.confirmRemoveBusiness')
  //           .d('是否确认移除监控企业')}
  //       </div>
  //     ),
  //   }).then(async button => {
  //     if (button === 'ok') {
  //       const obj = { ...record.toData() };
  //       fetchRemoveItem({
  //         monitorList: [{ ...obj }],
  //       }).then(res => {
  //         if (getResponse(res)) {
  //           listDS.query();
  //         }
  //       });
  //     }
  //   });
  // };

  const columns = () => {
    return [
      {
        name: 'enterpriseName',
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      {
        name: 'socialCode',
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      {
        name: 'cooperationFlag',
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      {
        name: 'registerTime',
        width: 150,
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      {
        name: 'countInfo',
        width: 220,
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      !hiddenFlag && {
        name: 'addMonitorTime',
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      !hiddenFlag && {
        name: 'lastScanTime',
        renderer: ({ text }) => {
          return !text ? '-' : text;
        },
      },
      { name: 'expireDate' },
      {
        name: 'effectiveFlag',
        renderer: ({ value, record }) => {
          const classStr = value === 0 ? styles['tag-over-time'] : styles['tag-in-time'];
          return <span className={classStr}>{record?.get('effectiveFlagMeaning') ?? ''}</span>;
        },
      },
      !hiddenFlag && {
        header: intl.get('hzero.common.button.operator').d('操作'),
        name: 'operation',
        renderer: ({ record }) => {
          // const monitorFlag = record?.get('monitorFlag') ?? '';
          return (
            <span className="action-link">
              <PermissionButton
                permissionList={[{ code: 'risk-control-workbench.api.monitor-riskScan' }]}
                type="text"
                onClick={() => handleScanRisk(record)}
              >
                {intl.get('sdat.monitorBusiness.view.button.riskScan').d('风险扫描')}
              </PermissionButton>
              {/* {[1, '1'].includes(monitorFlag) ? (
                <PermissionButton
                  permissionList={[{ code: 'risk-control-workbench.api.monitor-remove' }]}
                  type="text"
                  onClick={() => handleRemoveRisk(record)}
                >
                  {intl.get('sdat.monitorBusiness.view.button.removeBusiness').d('移除企业')}
                </PermissionButton>
              ) : null} */}
            </span>
          );
        },
      },
    ].filter(Boolean);
  };

  const queryParams = () => {
    const params = listDS?.queryDataSet?.toData() ?? [{}];
    return { ...params[0] };
  };

  const fieldProps = {
    activeFlag: {
      defaultValue: 1,
    },
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [{ ...params, queryRisk: !!hiddenFlag }];
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
      mask: true,
      fullScreen: true,
      style: { width: '1000px' },
      footer: null,
    });
  };

  return (
    <div className={styles['monitor-business-basic']}>
      <Header
        title={
          hiddenFlag
            ? intl.get('sdat.riskControl.view.button.riskCompany').d('⻛险企业')
            : intl.get('sdat.riskControl.view.button.monitorBusiness').d('监控企业')
        }
        backPath="/sdat/risk-control-workbench/list"
      >
        {!hiddenFlag ? (
          <PermissionButton
            onClick={openAddCompanyModal}
            permissionList={[{ code: 'risk-control-workbench.api.monitor-addCompany' }]}
            type="c7n-pro"
            icon="add"
            color="primary"
          >
            {intl.get('sdat.monitorBusiness.view.button.addBusiness').d('添加企业')}
          </PermissionButton>
        ) : null}
        {!hiddenFlag ? (
          <PermissionExport
            buttonText={intl.get('sdat.common.view.button.exportExcel').d('导出')}
            requestUrl={`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/monitor-company-export`}
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
              mask: true,
              permissionList: [{ code: 'risk-control-workbench.api.monitor-export' }],
            }}
            defaultSelectAll
            queryParams={{ ...queryParams, ...passParams, tenantId: getCurrentOrganizationId() }}
          />
        ) : null}
      </Header>
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
        <div className={styles['table-box']}>
          <Table
            border={false}
            dataSet={listDS}
            queryBar="none"
            columns={columns()}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            customizedCode="SDAT.RISK_CONTROL_MONITOR_BUSINESS_LIST"
          />
        </div>
      </Content>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.monitorBusiness', 'sdat.riskControl', 'sdat.common'],
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
