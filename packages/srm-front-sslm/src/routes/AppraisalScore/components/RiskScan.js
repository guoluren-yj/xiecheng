/*
 * @Date: 2024-08-14 17:32:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { downLoadFile } from '@/routes/components/utils';
import { riskScan } from '@/routes/LifeCycleManage/utils';

const organizationId = getCurrentOrganizationId();

const RiskScan = ({ dataSet }) => {
  const handleRiskReport = record => {
    const { fileUrl } = record.get(['fileUrl']);
    const url = downLoadFile({ tenantId: organizationId, attachmentUrl: fileUrl });
    window.open(url);
  };

  // const buttons = [
  //   <Button funcType="flat" icon="pending_actions">
  //     {intl.get('sslm.common.view.field.allRiskScan').d('全部扫描')}
  //   </Button>,
  // ];

  const columns = [
    {
      name: 'supplierName',
    },
    {
      name: 'riskScanning',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => riskScan(record, false, true)}>
          {intl.get('sslm.common.view.button.isScan').d('风险扫描')}
        </a>
      ),
    },
    {
      name: 'riskScanDate',
      width: 140,
    },
    {
      name: 'riskLevelMeaning',
      width: 100,
    },
    {
      name: 'fileUrl',
      width: 100,
      renderer: ({ record }) => {
        const { fileUrl } = record.get(['fileUrl']);
        if (!fileUrl) {
          return '-';
        }
        return (
          <a onClick={() => handleRiskReport(record)}>
            {intl.get('sslm.common.view.message.riskReport').d('风险报告')}
          </a>
        );
      },
    },
  ];
  return <Table dataSet={dataSet} columns={columns} style={{ maxHeight: 'calc(100vh - 300px)' }} />;
};

export default RiskScan;
