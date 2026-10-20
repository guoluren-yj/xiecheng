/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table, TextField } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentUser } from 'utils/utils';
import { isEmpty } from 'lodash';

const BankAccount = ({
  dataSet,
  isEdit,
  customizeTable,
  custLoading,
  code = '',
  bankDefaultInfo,
  buttonCode = '',
  supplierWarehouseRemote,
}) => {
  const {
    additionInfo: { enableDesensitize },
  } = getCurrentUser();

  const handleAdd = () => {
    const currentRow = dataSet.current;
    let rowDefaultInfo = {};
    if (!isEmpty(bankDefaultInfo)) {
      rowDefaultInfo = {
        countryId: {
          countryId: bankDefaultInfo.countryId,
          countryName: bankDefaultInfo.countryName,
        },
      };
    }
    if (currentRow) {
      currentRow.set({
        ...rowDefaultInfo,
      });
    }
  };
  const columns = [
    {
      name: 'countryId',
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
      name: 'correspondentLov',
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
      editor: (enableDesensitize || isEdit) && <TextField restrict="a-zA-Z0-9-@._,/" />,
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
      name: 'masterFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'enabledFlag',
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
  const buttons = isEdit ? [['add', { afterClick: () => handleAdd() }], 'delete'] : [];

  return (
    <Fragment>
      {supplierWarehouseRemote &&
        supplierWarehouseRemote.render('SSLM.SUPPLIER_WAREHOUSE_BANK_INFO_RENDER', <></>, {})}
      {customizeTable(
        {
          code,
          readOnly: !isEdit,
          buttonCode,
        },
        <Table dataSet={dataSet} columns={columns} buttons={buttons} custLoading={custLoading} />
      )}
    </Fragment>
  );
};

export default BankAccount;
