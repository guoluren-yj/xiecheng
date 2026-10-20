/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
/* *
 * 监控管理
 * @Author: lqx(qingxiang.luo@going-link.com)
 * @Date: 2025-05-19 15:32:18
 * @Last Modified by:   lqx(qingxiang.luo@going-link.com)
 * */
import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'dva';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { compose } from 'lodash';
import withProps from 'utils/withProps';
import { DataSet, Tabs, Button, Modal, Icon, Dropdown, Menu } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryIdpValue } from 'services/api';

import ExcelExportPro from '@/components/ExcelExportPro';

import { SRM_DATA_SDAT } from '@/utils/config';
import {
  fetchGetQuota,
  fetchAddBusiness,
  fetchRemoveMonitor,
} from '@/services/riskControl/monitorManageService';

import {
  CommonTableDS,
  BusinessListDS,
  AddedBusinessListDS,
  getResultDetailDs,
} from './stores/monitorDS';
import CommonTable from './CommonTable.js';
import BusinessAddModal from './BusinessAddModal';

import styles from './index.less';

const { TabPane } = Tabs;

function MonitorManage(props) {
  const {
    domesticCreditDS,
    overseasCreditDS,
    financialMonitorDS,
    businessIndicatorDS,
    disasterMonitoringDS,
    businessListDS,
    addedListDS,
    resultDetailDs,
  } = props;

  const queryParamMap = useRef({});

  const typeDSMap = {
    MONITOR_CREDIT_PKG: domesticCreditDS,
    MONITOR_OVERSEAS_CREDIT_PKG: overseasCreditDS,
    MONITOR_FINANCIAL_MONITOR_PKG: financialMonitorDS,
    MONITOR_DISASTER_PKG: disasterMonitoringDS,
    MONITOR_BUSINESS_PKG: businessIndicatorDS,
  };

  const exportUrlMap = {
    MONITOR_CREDIT_PKG: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company-export	`,
    MONITOR_OVERSEAS_CREDIT_PKG: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company-export	`,
    MONITOR_FINANCIAL_MONITOR_PKG: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company-export	`,
    MONITOR_DISASTER_PKG: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company-export	`,
    MONITOR_BUSINESS_PKG: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/monitor-manage/monitor-company-export	`,
  };

  const [activeKey, setActiveKey] = useState('MONITOR_CREDIT_PKG');
  const [monitorPkgMap, setMonitorPkgMap] = useState({});
  const [openType, setOpenType] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [quotaData, setQuotaData] = useState({});

  useEffect(() => {
    domesticCreditDS.addEventListener('batchSelect', selectEvent);
    domesticCreditDS.addEventListener('batchUnSelect', selectEvent);
    domesticCreditDS.addEventListener('load', loadEvent);
    overseasCreditDS.addEventListener('batchSelect', selectEvent);
    overseasCreditDS.addEventListener('batchUnSelect', selectEvent);
    overseasCreditDS.addEventListener('load', loadEvent);
    financialMonitorDS.addEventListener('batchSelect', selectEvent);
    financialMonitorDS.addEventListener('batchUnSelect', selectEvent);
    financialMonitorDS.addEventListener('load', loadEvent);
    disasterMonitoringDS.addEventListener('batchSelect', selectEvent);
    disasterMonitoringDS.addEventListener('batchUnSelect', selectEvent);
    disasterMonitoringDS.addEventListener('load', loadEvent);
    businessIndicatorDS.addEventListener('batchSelect', selectEvent);
    businessIndicatorDS.addEventListener('batchUnSelect', selectEvent);
    businessIndicatorDS.addEventListener('load', loadEvent);
    queryIdpValue('SDAT.WB2_MONITOR_PKG').then(res => {
      if (getResponse(res)) {
        const obj = {};
        if (res?.length) {
          res.forEach(item => {
            obj[item.value] = item.meaning;
            obj[`${item.value}_TAG`] = item.tag;
          });
        }
        setMonitorPkgMap(obj);
      }
    });

    return () => {
      domesticCreditDS.removeEventListener('batchSelect', selectEvent);
      domesticCreditDS.removeEventListener('batchUnSelect', selectEvent);
      domesticCreditDS.removeEventListener('load', loadEvent);
      overseasCreditDS.removeEventListener('batchSelect', selectEvent);
      overseasCreditDS.removeEventListener('batchUnSelect', selectEvent);
      overseasCreditDS.removeEventListener('load', loadEvent);
      financialMonitorDS.removeEventListener('batchSelect', selectEvent);
      financialMonitorDS.removeEventListener('batchUnSelect', selectEvent);
      financialMonitorDS.removeEventListener('load', loadEvent);
      disasterMonitoringDS.removeEventListener('batchSelect', selectEvent);
      disasterMonitoringDS.removeEventListener('batchUnSelect', selectEvent);
      disasterMonitoringDS.removeEventListener('load', loadEvent);
      businessIndicatorDS.removeEventListener('batchSelect', selectEvent);
      businessIndicatorDS.removeEventListener('batchUnSelect', selectEvent);
      businessIndicatorDS.removeEventListener('load', loadEvent);
    };
  }, []);

  useEffect(() => {
    getQuotaConfig();
  }, [activeKey]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const loadEvent = ({ dataSet }) => {
    dataSet.forEach(rcd => {
      if ([1, '1'].includes(rcd.get('effectiveFlag'))) {
        rcd.selectable = false;
      }
    });
  };

  const selectEvent = () => {
    setRefresh(true);
  };

  const getQuotaConfig = () => {
    fetchGetQuota({
      dataPacket: activeKey,
    }).then(res => {
      if (getResponse(res)) {
        setQuotaData(res);
      }
    });
  };

  const handleChangeTabs = key => {
    typeDSMap[activeKey]?.clearCachedSelected();
    setActiveKey(key);
  };

  const queryParams = () => {
    const commonParam = queryParamMap?.current[activeKey] ?? {};
    const data = { ...(props?.ds?.queryParameter ?? {}) };
    // 去除data里值为null的字段
    const obj = {};
    for (const key in data) {
      if (data[key]) obj[key] = data[key];
    }

    return { pkgType: activeKey, ...commonParam, ...obj };
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
      if (typeDSMap[activeKey] && typeDSMap[activeKey].query) {
        getQuotaConfig();
        typeDSMap[activeKey].query();
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.monitorBusiness.view.button.addMonitorBusiness').d('添加监控企业'),
      children: (
        <BusinessAddModal
          onAddBusiness={addBusiness}
          businessListDS={businessListDS}
          addedListDS={addedListDS}
          resultDetailDs={resultDetailDs}
          pkgType={activeKey}
          onClose={handleCloseModal}
          domesticForeignRelation={monitorPkgMap[`${activeKey}_TAG`]}
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

  /**
   * 打开多选按钮框
   * @param {*} flag
   */
  const openSelectFlag = flag => {
    setOpenType(flag);
  };

  const menu = () => {
    return (
      <Menu>
        <Menu.Item>
          <span onClick={() => openSelectFlag('add')}>
            {intl.get('sdat.riskScanConfig.view.button.batchAdd').d('批量添加')}
          </span>
        </Menu.Item>
        <Menu.Item>
          <span onClick={() => openSelectFlag('remove')}>
            {intl.get('sdat.riskScanConfig.view.button.batchRemove').d('批量移除')}
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const handleCancelSelect = () => {
    setOpenType('');
    typeDSMap[activeKey]?.clearCachedSelected();
  };

  const handleConfirmSelect = () => {
    const selectedList = typeDSMap[activeKey]?.selected?.map(item => {
      const obj = item?.toData() ?? {};
      return {
        ...obj,
        enterpriseCode: obj?.socialCode,
      };
    });

    if (openType === 'add') {
      fetchAddBusiness({
        enterpriseList: selectedList,
        domesticForeignRelation: monitorPkgMap[`${activeKey}_TAG`] === 'DOMESTIC' ? 1 : 0,
        dataPacket: activeKey,
      }).then(res => {
        if (getResponse(res)) {
          handleCancelSelect();
          typeDSMap[activeKey].query();
        }
      });
    } else if (openType === 'remove') {
      fetchRemoveMonitor(selectedList).then(res => {
        if (getResponse(res)) {
          handleCancelSelect();
          typeDSMap[activeKey].query();
        }
      });
    }
  };

  const businessCountComp = () => {
    return (
      <>
        <div>
          {intl.get('sdat.riskScanConfig.view.title.monitorEnterpriseCount').d('监控企业数量')}
        </div>
        <div>
          <span style={{ fontSize: '12px', color: '#000', fontWeight: '600' }}>
            {quotaData?.usedQuantity ?? 0}
          </span>
          &nbsp; /&nbsp;{quotaData?.canUseQuantity ?? 0}
        </div>
      </>
    );
  };

  const handleRefresh = () => {
    typeDSMap[activeKey].query();
    getQuotaConfig();
  };

  const handleSaveParams = (key, params = {}) => {
    queryParamMap.current[key] = { ...params };
    setRefresh(true);
  };

  return (
    <>
      <Header
        title={intl.get('sdat.riskScanConfig.view.title.monitorManage').d('监控管理')}
        backPath="/sdat/risk-workbench-new/list"
      >
        <Button color="primary" onClick={openAddCompanyModal}>
          {intl.get('sdat.riskScanConfig.view.button.addMonitorEnterprise').d('添加监控企业')}
        </Button>
        {openType ? (
          <>
            <Button
              funcType="flat"
              icon="close"
              style={{ fontSize: '12px' }}
              onClick={handleCancelSelect}
            >
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
            <Button
              icon="check"
              funcType="flat"
              style={{ fontSize: '12px' }}
              disabled={!typeDSMap[activeKey]?.selected?.length}
              onClick={handleConfirmSelect}
            >
              {openType === 'add'
                ? intl.get('sdat.riskScanConfig.view.button.confirmAdd').d('确定添加')
                : intl.get('sdat.riskScanConfig.view.button.confirmRemove').d('确定移除')}
            </Button>
          </>
        ) : (
          <Dropdown overlay={menu}>
            <Button
              funcType="flat"
              icon="edit_note"
              style={{ fontSize: '12px', fontWeight: '500' }}
            >
              {intl.get('sdat.riskScanConfig.view.button.batchOperation').d('批量操作')}
              &nbsp;
              <Icon type="expand_more" style={{ fontSize: '12px', fontWeight: '500' }} />
            </Button>
          </Dropdown>
        )}
        <ExcelExportPro
          buttonText={intl.get('sdat.common.view.button.exportExcel').d('导出')}
          requestUrl={exportUrlMap[activeKey]}
          otherButtonProps={{
            icon: 'unarchive',
            type: 'c7n-pro',
            funcType: 'flat',
            mask: false,
          }}
          defaultSelectAll
          queryParams={queryParams}
        />
      </Header>
      <Content style={{ margin: '8px', minHeight: 'calc(100% - 20px)', overflow: 'hidden' }}>
        <Tabs activeKey={activeKey} onChange={handleChangeTabs}>
          <TabPane tab={monitorPkgMap?.MONITOR_CREDIT_PKG ?? ''} key="MONITOR_CREDIT_PKG">
            <div className={styles['monitor-manage-basic-monitor-title']}>
              {businessCountComp()}
            </div>
            <div style={{ marginTop: '16px', overflow: 'hidden' }}>
              <CommonTable
                dataSet={domesticCreditDS}
                pkgType="MONITOR_CREDIT_PKG"
                customizedCode="SDAT.RISK_CONTROL_MONITOR_DOMESTIC_CREDIT_CUNTOMIZE"
                searchCode="SDAT.RISK_CONTROL_MONITOR_DOMESTIC_CREDIT_SEARCH_BAR"
                callBackForRefresh={handleRefresh}
                callBackSaveParams={handleSaveParams}
              />
            </div>
          </TabPane>

          {/* <TabPane tab={monitorPkgMap.MONITOR_OVERSEAS_CREDIT_PKG} key="MONITOR_OVERSEAS_CREDIT_PKG">
            <div className={styles['monitor-manage-basic-monitor-title']}>
              {businessCountComp()}
            </div>
            <div style={{ marginTop: '16px', overflow: 'hidden' }}>
              <CommonTable
                dataSet={overseasCreditDS}
                customizedCode="SDAT.RISK_CONTROL_MONITOR_OVERSEAS_CREDIT_CUNTOMIZE"
                searchCode="SDAT.RISK_CONTROL_MONITOR_OVERSEAS_CREDIT_SEARCH_BAR"
              />
            </div>
          </TabPane> */}

          {/* <TabPane
            tab={intl.get('sdat.riskScanConfig.view.title.financialMonitoring').d('财务监控')}
            key="3"
          >
            <div className={styles['monitor-manage-basic-monitor-title']}>
              {businessCountComp()}
            </div>
            <div style={{ marginTop: '16px', overflow: 'hidden' }}>
              <CommonTable
                dataSet={financialMonitorDS}
                customizedCode="SDAT.RISK_CONTROL_MONITOR_FINANCIAL_MONITOR_CUNTOMIZE"
                searchCode="SDAT.RISK_CONTROL_MONITOR_FINANCIAL_MONITOR_SEARCH_BAR"
              />
            </div>
          </TabPane> */}

          <TabPane tab={monitorPkgMap?.MONITOR_DISASTER_PKG ?? ''} key="MONITOR_DISASTER_PKG">
            <div className={styles['monitor-manage-basic-monitor-title']}>
              {businessCountComp()}
            </div>
            <div style={{ marginTop: '16px', overflow: 'hidden' }}>
              <CommonTable
                dataSet={disasterMonitoringDS}
                domesticForeignRelation={monitorPkgMap[`${activeKey}_TAG`]}
                pkgType="MONITOR_DISASTER_PKG"
                customizedCode="SDAT.RISK_CONTROL_MONITOR_DISASTER_MONITOR_CUNTOMIZE"
                searchCode="SDAT.RISK_CONTROL_MONITOR_DISASTER_MONITOR_SEARCH_BAR"
                callBackForRefresh={handleRefresh}
              />
            </div>
          </TabPane>

          <TabPane tab={monitorPkgMap?.MONITOR_BUSINESS_PKG ?? ''} key="MONITOR_BUSINESS_PKG">
            <div className={styles['monitor-manage-basic-monitor-title']}>
              {businessCountComp()}
            </div>
            <div style={{ marginTop: '16px', overflow: 'hidden' }}>
              <CommonTable
                dataSet={businessIndicatorDS}
                pkgType="MONITOR_BUSINESS_PKG"
                customizedCode="SDAT.RISK_CONTROL_MONITOR_BUSINESS_INDICATOR_CUNTOMIZE"
                searchCode="SDAT.RISK_CONTROL_MONITOR_BUSINESS_INDICATOR_SEARCH_BAR"
                callBackForRefresh={handleRefresh}
              />
            </div>
          </TabPane>
        </Tabs>
      </Content>
    </>
  );
}

export default compose(
  connect(state => state),
  formatterCollections({
    code: ['sdat.common', 'sdat.riskScanConfig', 'sdat.monitorBusiness'],
  }),
  withProps(
    () => {
      const domesticCreditDS = new DataSet(CommonTableDS());
      const overseasCreditDS = new DataSet(CommonTableDS());
      const financialMonitorDS = new DataSet(CommonTableDS());
      const businessIndicatorDS = new DataSet(CommonTableDS());
      const disasterMonitoringDS = new DataSet(CommonTableDS());
      const businessListDS = new DataSet(BusinessListDS());
      const addedListDS = new DataSet(AddedBusinessListDS()); // 已添加监控的企业
      const resultDetailDs = new DataSet(getResultDetailDs()); // 添加企业后的详情结果

      return {
        domesticCreditDS,
        overseasCreditDS,
        financialMonitorDS,
        businessIndicatorDS,
        disasterMonitoringDS,
        businessListDS,
        addedListDS,
        resultDetailDs,
      };
    },
    { cacheState: true, keepOriginDataSet: true } // 缓存数据状态+保持原来的DataSet对象
  )
)(MonitorManage);
