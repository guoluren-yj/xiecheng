/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const BankAccount = props => {
  const { dataSet, customizeTable, custLoading } = props;
  const columns = [
    {
      name: 'countryId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.countryIdFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.countryName}
          </div>
        );
      },
    },
    {
      name: 'bankCode',
      width: 200,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.bankCodeFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.bankCode}
          </div>
        );
      },
    },
    {
      name: 'bankName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'correspondentLov',
      width: 200,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.bankFirmFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.bankFirm}
          </div>
        );
      },
    },
    {
      name: 'bankBranchName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'bankAccountName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'bankAccountNum',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'masterFlag',
      width: 100,
      tooltip: 'overflow',
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.masterFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {value
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
        );
      },
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.enabledFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {value
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
        );
      },
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
    },
  ].map(n => ({
    renderer: ({ record }) => {
      const data = record.toData();
      return (
        <div
          style={{
            color: (data[`${n.name}Flag`] === 'UPDATE' || data.objectFlag === 'CREATE') && 'red',
          }}
        >
          {data[`${n.name}Meaning`] || data[`${n.name}`]}
        </div>
      );
    },
    ...n,
  }));

  return customizeTable(
    {
      code: 'SSLM.EASY_SUPPLIER_WAREHOUSE.BANK_ACCOUNT',
      readOnly: true,
    },
    <Table dataSet={dataSet} columns={columns} custLoading={custLoading} />
  );
};

export default BankAccount;
