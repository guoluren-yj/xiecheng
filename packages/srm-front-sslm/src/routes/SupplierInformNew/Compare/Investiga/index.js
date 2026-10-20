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
import { fetchInvestigateInfo } from '@/services/supplierInformCompareService';

const organizationId = getCurrentOrganizationId();

const Index = props => {
  const { changeReqId, headerInfo: { configNames = [] } = {} } = props;

  // 处理父级tab的activeKey
  const handleInvestigateInfo = useCallback(({ newDataSet, oldDataSet, configName } = {}) => {
    return new Promise(async resolve => {
      fetchInvestigateInfo({
        changeReqId,
        configName,
        dataSource: 2,
        partnerTenantId: organizationId, // 采购方id
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          resolve(true);
          if (configName === 'sslmInvestgSupplierCate') {
            newDataSet.loadData(res.newFirmChangeCates);
            oldDataSet.loadData(res.oldFirmChangeCates);
          } else {
            newDataSet.loadData(res[1] || []);
            oldDataSet.loadData(res[0] || []);
          }
        } else {
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <CompareInvestiga
      {...props}
      configNames={configNames}
      handleInvestigateInfo={handleInvestigateInfo}
    />
  );
};

export default Index;
