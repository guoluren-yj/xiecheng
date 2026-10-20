/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { judgeUSCCdoeNull } from '@/utils/utils';

import {
  fetchSavePlanConfig,
  fetchRemoveCompanyList,
  fetchDetailConfig,
} from '@/services/riskScanConfig/monitorConfigService';

import styles from './index.less';

export default function CompanyAddModal(props) {
  const {
    businessListDS,
    businessAddDS,
    monitorConfigDetail = {},
    itemCode = '',
    riskPlanId = '',
    dispatch,
  } = props;

  const [refresh, setRefresh] = useState(false);

  const pkgTypeMap = {
    CreditRisk: 'MONITOR_CREDIT_PKG',
    BusinessRisk: 'MONITOR_BUSINESS_PKG',
    DisasterRisk: 'MONITOR_DISASTER_PKG',
  };

  useEffect(() => {
    businessListDS.addEventListener('batchSelect', selectEvent);
    businessListDS.addEventListener('batchUnSelect', selectEvent);

    if (itemCode) {
      businessListDS.setQueryParameter('pkgType', pkgTypeMap[itemCode]);
      businessListDS.setQueryParameter('riskPlanId', riskPlanId);
      businessListDS.query();
    }

    return () => {
      businessListDS.removeEventListener('batchSelect', selectEvent);
      businessListDS.removeEventListener('batchUnSelect', selectEvent);
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  const selectEvent = () => {
    setRefresh(true);
  };

  const classMap = {
    0: styles['status-disabled'],
    1: styles['status-enabled'],
  };

  const columns = () => {
    return [
      { name: 'companyName' },
      { name: 'socialCode' },
      {
        name: 'effectiveFlag',
        renderer: ({ value }) => {
          const classes = classMap[value];
          return (
            <span className={classes}>
              {value == 0
                ? intl.get('hzero.common.status.invalid').d('失效')
                : intl.get('hzero.common.status.effective').d('有效')}
            </span>
          );
        },
      },
    ];
  };

  const addCompany = () => {
    return [{ name: 'enterpriseName' }, { name: 'socialCode' }];
  };

  const updateConfigDetail = async (obj = {}) => {
    dispatch({
      type: 'monitorWorkbench/updateState',
      payload: {
        monitorConfigDetail: { ...obj },
      },
    });
  };

  /**
   * 打开选择公司的侧边弹窗
   */
  const openChooseModal = () => {
    let modal = null;

    if (itemCode) {
      // const ids = businessListDS.map(rcd => rcd.get('socialCode'));
      businessAddDS.setQueryParameter('pkgType', pkgTypeMap[itemCode]);
      businessAddDS.setQueryParameter('riskPlanId', riskPlanId);
      // if (ids.length) {
      //   businessAddDS.setQueryParameter('excludeSocialCodeList', ids);
      // }
      businessAddDS.query();
    }

    const handleCloseModal = async () => {
      if (modal) {
        businessAddDS.data = [];
        businessAddDS.reset();
        const detail = await fetchDetailConfig({
          riskPlanId,
          planContentType: 'object',
          planType: 'MONITOR',
        });
        updateConfigDetail({ ...detail });
        modal.close();
      }
    };

    const handleCreateItem = async () => {
      if (businessAddDS.selected.length) {
        if(judgeUSCCdoeNull(businessAddDS.selected)) {
          return;
        }
        const list = businessAddDS.selected.map((rcd) => rcd.toData());

        list.forEach((item) => {
          item.scanObjectType = item.companyId === -1 ? 'PLATFORM_OUTER' : 'MANUAL_SUPPLIER';
          item.scanObjectId = item.companyId;
          item.companyName = item.enterpriseName;
        });
        const detail = await fetchDetailConfig({
          riskPlanId,
          planContentType: 'object',
          planType: 'MONITOR',
        });
        updateConfigDetail({ ...detail });
        const res = await fetchSavePlanConfig({
          ...detail,
          wb2RiskPlanObjectList: list,
          planContentType: 'object',
          planType: 'MONITOR',
        });
        if (getResponse(res)) {
          judgeUSCCdoeNull(res?.planObjectNameList?.length);
          businessListDS.query();
          handleCloseModal();
          return true;
        } else {
          return false;
        }
      } else {
        notification.warning({
          message: intl.get('hzero.common.message.confirm.title').d('提示'),
          description: intl
            .get('sdat.riskScanConfig.view.message.mustSelectOneOrMore')
            .d('请至少选择一个公司'),
        });
        return false;
      }
    };

    modal = Modal.open({
      title: intl.get('sdat.riskScanConfig.view.title.chooseCompany').d('选择公司'),
      children: <Table dataSet={businessAddDS} columns={addCompany()} />,
      closable: false,
      drawer: true,
      mask: true,
      resizable: true,
      style: { width: '720px' },
      header: null,
      footer: (
        <div>
          <Button color="primary" onClick={handleCreateItem}>
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
          <Button onClick={handleCloseModal}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
        </div>
      ),
    });
  };

  const batchDeleteTypeList = async () => {
    if (businessListDS.selected.length) {
      const list = businessListDS.selected.map((rcd) => rcd.toData());
      const res = await fetchRemoveCompanyList({
        ...monitorConfigDetail,
        wb2RiskPlanObjectList: list,
        planContentType: 'object',
        planType: 'MONITOR',
      });

      if (getResponse(res)) {
        businessListDS.query();
        const detail = await fetchDetailConfig({
          riskPlanId,
          planContentType: 'object',
          planType: 'MONITOR',
        });
        updateConfigDetail({ ...detail });
      }
    }
  };

  const buttons = () => {
    return [
      <Button icon="add" funcType="flat" onClick={openChooseModal}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        funcType="flat"
        disabled={!businessListDS.selected.length}
        onClick={batchDeleteTypeList}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>,
    ];
  };

  return (
    <>
      <Table dataSet={businessListDS} columns={columns()} buttons={buttons()} />
    </>
  );
}
