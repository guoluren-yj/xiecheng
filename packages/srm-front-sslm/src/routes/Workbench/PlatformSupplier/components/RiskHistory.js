/**
 * RiskHistory - 风险扫描历史
 * @date: 2024-08-15
 * @author: CDJ
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { downLoadFile } from '@/routes/components/utils';

import { getRiskHistoryDS } from '../../stores/riskHistoryDS';

const organizationId = getCurrentOrganizationId();

const RiskHistory = ({ record }) => {
  const riskHistoryDs = useDataSet(() => getRiskHistoryDS(), []);

  useEffect(() => {
    if (record) {
      const companyName = record.get('supplierCompanyName');
      riskHistoryDs.setQueryParameter('companyName', companyName);
      riskHistoryDs.query();
    }
  }, []);

  const handleRiskReport = r => {
    const { fileUrl } = r.get(['fileUrl']);
    const url = downLoadFile({ tenantId: organizationId, attachmentUrl: fileUrl });
    window.open(url);
  };

  const columns = [
    {
      name: 'lastScanTime',
    },
    {
      name: 'riskLevelMeaning',
    },
    {
      name: 'fileUrl',
      width: 120,
      renderer: ({ record: currentRecord }) => {
        const { fileUrl } = currentRecord.get(['fileUrl']);
        if (!fileUrl) {
          return '-';
        }
        return (
          <a
            onClick={() => {
              handleRiskReport(currentRecord);
            }}
          >
            {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
          </a>
        );
      },
    },
  ];

  return <Table dataSet={riskHistoryDs} columns={columns} />;
};

export default RiskHistory;
