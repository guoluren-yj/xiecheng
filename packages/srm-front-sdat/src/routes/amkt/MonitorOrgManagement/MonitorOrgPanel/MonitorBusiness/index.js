/* eslint-disable no-param-reassign */
/**
 * 企业监控页面
 */
import React, { useRef } from 'react';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DataSet, Table, Modal } from 'choerodon-ui/pro';
// import FilterBar from 'srm-front-boot/lib/components/FilterBarTable/FilterBar';
import StaticSearchBar from '@/components/StaticSearchBar';
import withProps from 'utils/withProps';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';
import notification from 'utils/notification';

import { getRiskScanUrl } from '@/services/monitorOrgManagementService';

import { MonitorListDS, MemberManageDS } from './stores/monitorBusinessDS';
import { stuffListDS } from '../../store/monitorOrgManagementDs';
import MonitorMemberModal from './MonitorMemberModal';
import { getQueryConfig } from './queryConfig';
import styles from './index.less';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const param = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const MonitorBusiness = props => {
  const { setDs = () => {}, history } = props;
  const { listDS, memberManageDS } = props.valueDs;

  let allSearchBarRef = useRef(null);

  /**
   * 风险扫描
   * @param {*} record
   */
  const handleScanRisk = record => {
    const keyWord = record?.get('enterpriseName') ?? '';
    getRiskScanUrl({
      keyWord,
      gatewayUrl: location?.origin ?? '',
      ...param,
    }).then(res => {
      if (res && res.success) {
        if (res && res.data) {
          window.open(res.data);
        }
      } else {
        notification.error({
          message: res?.msg ?? '',
        });
      }
    });
  };

  /**
   * 查看风险事件
   */
  const handleViewEvent = record => {
    if (record && record.get('socialCode')) {
      history.push(
        `/sdat/monitor-org-management/detail/${record.get('socialCode')}/${record.get(
          'enterpriseName'
        )}`
      );
    }
  };

  /**
   * 添加监控人
   */
  const handleOpenManageModal = record => {
    let modal = null;

    const socialCode = record && record.get ? record.get('socialCode') : '';
    const enterpriseName = record && record.get ? record.get('enterpriseName') : '';

    if (socialCode) {
      memberManageDS.setQueryParameter('socialCode', socialCode);
      memberManageDS.query();
    }

    const handleClose = () => {
      memberManageDS.data = [];
      memberManageDS.reset();
      if (modal) {
        modal.close();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorOrgManagement.view.button.manageMonitor').d('管理监控员'),
      children: (
        <MonitorMemberModal
          dataSet={memberManageDS}
          socialCode={socialCode}
          enterpriseName={enterpriseName}
        />
      ),
      closable: true,
      drawer: true,
      mask: false,
      style: { width: '732px' },
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      onOk: handleClose,
    });
  };

  const columns = () => {
    return [
      {
        name: 'enterpriseName',
      },
      {
        name: 'socialCode',
      },
      {
        name: 'eventCount',
      },
      {
        name: 'lastScanTime',
      },
      { name: 'expireDate' },
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
        width: 280,
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              <a onClick={() => handleScanRisk(record)}>
                {intl.get('sdat.monitorOrgManagement.view.button.riskScan').d('风险扫描')}
              </a>
              <a onClick={() => handleViewEvent(record)}>
                {intl.get('sdat.monitorOrgManagement.view.button.viewRiskEvent').d('风险事件')}
              </a>
              <a onClick={() => handleOpenManageModal(record)}>
                {intl.get('sdat.monitorOrgManagement.view.button.manageMonitor').d('管理监控员')}
              </a>
            </span>
          );
        },
      },
    ];
  };

  const handleFilterQueryAll = ({ params }) => {
    listDS.queryDataSet.data = [
      {
        ...param,
        ...params,
      },
    ];
    listDS.query().then(() => {
      setDs(listDS?.queryDataSet?.toData()[0] ?? {});
    });
  };

  const handleClear = () => {
    if (allSearchBarRef && allSearchBarRef.setField) {
      allSearchBarRef.setField('activeFlag', '');
      allSearchBarRef.setField('enterpriseName', '');
    }
  };

  const getFilters = () => {
    return { ...getQueryConfig() };
  };

  const fieldProps = {
    activeFlag: {
      defaultValue: 1,
    },
  };

  return (
    <div className={styles['monitor-business-basic']}>
      <StaticSearchBar
        cacheState
        cacheKey="SDAT.CACHE.SUPPLIER_MONITOR_BUSINESS_LIST"
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
        defaultExpand
      />
      <div className={styles['table-out-container']}>
        <Table
          dataSet={listDS}
          queryBar="none"
          columns={columns()}
          border={false}
          autoHeight={{ type: 'maxHeight', diff: 40 }}
        />
      </div>
    </div>
  );
};

export default formatterCollections({
  code: ['sdat.monitorOrgManagement', 'sdat.common', 'sdat.monitorBusiness'],
})(
  withProps(
    () => {
      const listDS = new DataSet(MonitorListDS());
      const stuffListDs = new DataSet(stuffListDS()); // 点击查看时要看到的Ds，由于可能需要下拉分页，因此使用dataSet
      const memberManageDS = new DataSet({ ...MemberManageDS() });

      const valueDs = { listDS, stuffListDs, memberManageDS };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(MonitorBusiness)
);
