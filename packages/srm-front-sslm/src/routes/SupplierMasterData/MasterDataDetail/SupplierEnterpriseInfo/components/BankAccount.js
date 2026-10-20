/*
 * BankAccount - 银行账号
 * @Date: 2023-08-17 09:15:47
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { enableRender } from 'utils/renderer';
import { Context } from '@/routes/SupplierMasterData/Context';
import { getBankDS } from '../stores/getBankDS';

const customizeUnitCode = '';

const BankAccount = () => {
  const dataSet = useDataSet(() => getBankDS(), []);
  const context = useContext(Context);
  const {
    enterpriseBasicInfo: { bankAccountList = [] } = {},
    customizeTable,
    tableMaxHeight,
  } = context;

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
      name: 'bankIdentifyCodeType',
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
      renderer: ({ value }) => enableRender(value),
    },
    {
      name: 'masterFlag',
      width: 80,
      renderer: ({ value }) => enableRender(value),
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
