/*
 * BankAccount - 银行账号
 * @Date: 2023-08-17 09:15:47
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierDetailNew/Context';
import { getBankAccountDS } from '../stores/getBankAccountDS';

const customizeUnitCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.BANK';

const BankAccount = () => {
  const dataSet = useDataSet(() => getBankAccountDS(), []);
  const context = useContext(Context);
  const { bankAccountList = [], customizeTable, tableMaxHeight } = context;

  useEffect(() => {
    dataSet.loadData(bankAccountList);
  });

  const columns = [
    {
      width: 150,
      name: 'bankCountryId',
      renderer: ({ record }) => record && record.get('bankCountryName'),
    },
    {
      name: 'bankCode',
      width: 120,
    },
    {
      name: 'bankName',
      width: 200,
    },
    {
      name: 'bankFirm',
      width: 150,
    },
    {
      name: 'bankBranchName',
      width: 200,
    },
    {
      name: 'bankAccountName',
      width: 200,
    },
    {
      name: 'bankAccountNum',
      width: 150,
      renderer: ({ record, name }) => (
        <SecretField displayOutput record={record} name={name} tooltip={false} />
      ),
    },
    {
      name: 'intlBankAccountNum',
      width: 150,
    },
    {
      name: 'accountNatureMeaning',
      width: 160,
    },
    {
      name: 'accountPurposeMeaning',
      width: 120,
    },
    {
      name: 'currencyIdMeaning',
      width: 120,
    },
    {
      name: 'bankIdentifyCodeTypeMeaning',
      width: 120,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'paymentTypeIdMeaning',
      width: 120,
    },
    {
      name: 'enabledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
    },
  ];
  return customizeTable(
    {
      code: customizeUnitCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default BankAccount;
