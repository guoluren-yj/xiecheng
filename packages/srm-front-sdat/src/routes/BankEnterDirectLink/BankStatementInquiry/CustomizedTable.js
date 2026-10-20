import React from 'react';
import { Table } from 'choerodon-ui/pro';

import styles from './index.less';

export default function CustomizedTable({ listDS, customizeTable }) {
  const tagMap = {
    SUCCESS: styles['tag-success'],
    PROCESS: styles['tag-process'],
    FAILURE: styles['tag-fail'],
    REFUND: styles['tag-refund'],
  };

  const columns = () => {
    return [
      {
        name: 'pmtNum',
        width: 200,
        lock: 'left',
      },
      {
        name: 'tenantName',
        width: 200,
        lock: 'left',
      },
      { name: 'pmtOutSerialNum', width: 300 },
      { name: 'pmtOutBatchNum', width: 200 },
      { name: 'pmtSceneCode', width: 200 },
      { name: 'pmtSceneName', width: 200 },
      { name: 'pmtBizSerialNum', width: 150 },
      { name: 'pmtTitle', width: 120 },
      {
        name: 'pmtStartTime',
        width: 150,
      },
      {
        name: 'pmtStatus',
        renderer: ({ value, text }) => {
          const classes = tagMap[value];
          return <span className={classes}>{text}</span>;
        },
      },
      {
        name: 'pmtAmount',
        width: 200,
        renderer: ({ value }) => {
          return value ? value.toFixed(2) : 0.0;
        },
      },
      {
        name: 'pmtCurrencyCode',
        width: 100,
      },
      { name: 'pmtBizNum', width: 150 },
      {
        name: 'pmtInfo',
        width: 200,
      },
      {
        name: 'memo',
        width: 120,
      },
      {
        name: 'pmtOrgCode',
        width: 150,
      },
      {
        name: 'pmtOurOrgCode',
        width: 200,
      },
      {
        name: 'pmtAccountNum',
        width: 200,
      },
      {
        name: 'pmtEndTime',
        width: 150,
      },
      {
        name: 'reptAccountNum',
        width: 200,
      },
      {
        name: 'reptAccountName',
        width: 200,
      },
      {
        name: 'reptBankCode',
        width: 200,
      },
      {
        name: 'pmtOutBizNum',
        width: 200,
      },
      {
        name: 'pmtApplyOrgCode',
        width: 200,
      },

      {
        name: 'systemCode',
        width: 200,
      },
      {
        name: 'refundSystemSerialNum',
        width: 200,
      },
    ];
  };

  return (
    <>
      {customizeTable &&
        customizeTable(
          { code: 'SDAT.BANK_ENTER_DIRECT_LINK' },
          <Table
            dataSet={listDS}
            columns={columns()}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            customizable
            columnDraggable
            customizedCode="SDAT.BANK_ENTER_DIRECT_LINK_CUSTOM"
          />
        )}
    </>
  );
}
