/*
 * Investiga - 调查表明细对比
 * @Date: 2023-04-18 17:11:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useCallback } from 'react';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import CompareInvestiga from '@/routes/components/Investigation/Compare';
import { fetchInvestigateCompareInfo } from '@/services/purchaserInvestWorkbenchService';

const organizationId = getCurrentOrganizationId();

// form配置表
const isForm = {
  sslmInvestgBasic: true, // 基本信息
  sslmInvestgBusiness: true, // 业务信息
  sslmInvestgRd: true, // 研发能力
  sslmInvestgProduce: true, // 生产能力
  sslmInvestgQa: true, // 质保能力
  sslmInvestgCustservice: true, // 售后服务
  sslmInvestgReserve3: true, // 预留表单1
  sslmInvestgReserve4: true, // 预留表单2
  sslmInvestgReserve10: true, // 预留表单3
  sslmInvestgReserve11: true, // 预留表单4
  sslmInvestgReserve12: true, // 预留表单5
  sslmInvestgReserve13: true, // 预留表单6
  sslmInvestgReserve14: true, // 预留表单7
};

const Index = props => {
  const { investgHeaderId, supplierBasicId } = props;
  // 处理父级tab的activeKey
  const handleInvestigateInfo = useCallback(({ newDataSet, oldDataSet, configName } = {}) => {
    const params = {
      configName,
      investgHeaderId,
      supplierBasicId,
      tenantId: organizationId,
    };
    return new Promise(async resolve => {
      if (isForm[configName]) {
        fetchInvestigateCompareInfo({ ...params, type: 'before' }).then(response => {
          const res = getResponse(response);
          if (res) {
            resolve(true);
            newDataSet.loadData(res[1] || []);
            oldDataSet.loadData(res[0] || []);
          } else {
            resolve(false);
          }
        });
      } else {
        Promise.all([
          fetchInvestigateCompareInfo({ ...params, type: 'before' }),
          fetchInvestigateCompareInfo({ ...params, type: 'after' }),
        ]).then(response => {
          resolve(true);
          const [oldData, newData] = response;
          if (getResponse(oldData)) {
            oldDataSet.loadData(oldData);
          }
          if (getResponse(newData)) {
            newDataSet.loadData(newData);
          }
        });
      }
    });
  }, []);

  return <CompareInvestiga {...props} handleInvestigateInfo={handleInvestigateInfo} />;
};

export default Index;
