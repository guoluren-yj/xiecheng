/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

const BankAccount = ({
  dataSet,
  // allInfo = {},
  bankInfo = {},
  sourceKey,
  bankInfoRemote,
  remoteParams = {},
}) => {
  const { enableFieldList = [] } = bankInfo;

  const columns = [
    {
      name: 'bankCountryObj',
      width: 200,
    },
    {
      name: 'bankCode',
      width: 200,
    },
    {
      name: 'bankName',
      width: 200,
    },
    {
      name: 'bankFirmObj',
      width: 200,
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
      width: 200,
      editor: sourceKey !== 'platformApprove' && <SecretField readOnly displayOutput />,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
    },
    {
      name: 'accountNature',
      width: 200,
    },
    {
      name: 'accountPurpose',
      width: 200,
    },
    {
      name: 'currencyLov',
      width: 200,
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
      name: 'paymentTypeLov',
      width: 200,
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });

  const newColumns = bankInfoRemote
    ? bankInfoRemote.process('SSLM_CERTIFICATION_APPROVAL_PLATFORM_BANK_INFO_COLUMNS', columns, {
        ...(remoteParams || {}),
      })
    : columns;

  return (
    <Fragment>
      <Table dataSet={dataSet} columns={newColumns} />
    </Fragment>
  );
};

export default BankAccount;
