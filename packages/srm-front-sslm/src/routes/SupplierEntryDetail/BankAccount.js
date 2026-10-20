/**
 * BankAccount - 银行账户
 * @date: 2022-03-26
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

const BankAccount = ({
  dataSet,
  isEdit: editFlag,
  companyBaseInfo = {},
  customizedCode,
  customizeTable,
  custLoading,
  disabledObj = {},
  entryDetailRemote,
}) => {
  const {
    registeredCountryId,
    registeredCountryName,
    domesticForeignRelation,
    companyName,
  } = companyBaseInfo;

  const { allDisabled } = disabledObj;
  const isEdit = editFlag && !allDisabled;

  useEffect(() => {
    dataSet.query();
  }, [dataSet]);

  const columns = [
    {
      name: 'bankCountryObj',
      width: 200,
      editor: isEdit,
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
      editor: isEdit,
    },
    {
      name: 'bankBranchName',
      width: 200,
    },
    {
      name: 'bankAccountName',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankAccountNum',
      width: 200,
      editor: <SecretField readOnly={!isEdit} displayOutput={!isEdit} />,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'accountNature',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'accountPurpose',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'currencyLov',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'paymentTypeLov',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'enabledFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'masterFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'remark',
      width: 200,
      editor: isEdit,
    },
  ];
  const buttons = isEdit
    ? [
        Number(domesticForeignRelation) === 1
          ? [
              'add',
              {
                onClick: () =>
                  dataSet.create({
                    bankCountryId: registeredCountryId,
                    bankCountryName: registeredCountryName,
                    bankAccountName: companyName,
                  }),
              },
            ]
          : 'add',
        [
          'delete',
          {
            onClick: () =>
              dataSet.delete(dataSet.selected, {
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: intl
                  .get('spfm.supplierRegister.view.message.deleteConfirm')
                  .d('确认删除选中行？'),
              }),
          },
        ],
      ]
    : [];

  const newColumns = entryDetailRemote
    ? entryDetailRemote.process('SSLM_SUPPLIER_ENTRY_DETAIL_PLATFORM_BANK_INFO_COLUMNS', columns, {
        companyBaseInfo,
        dataSet,
      })
    : columns;

  const newButtins = entryDetailRemote
    ? entryDetailRemote.process('SSLM_SUPPLIER_ENTRY_DETAIL_PLATFORM_BANK_INFO_BUTTONS', buttons, {
        companyBaseInfo,
        editFlag,
        dataSet,
      })
    : buttons;

  return customizeTable(
    { code: customizedCode },
    <Table
      custLoading={custLoading}
      dataSet={dataSet}
      columns={newColumns}
      buttons={newButtins}
      selectionMode={isEdit ? 'rowbox' : 'click'}
    />
  );
};

export default BankAccount;
