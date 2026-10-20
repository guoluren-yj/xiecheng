/*
 * Bank - 银行信息
 * @Date: 2023-04-11 09:10:12
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table, SecretField } from 'choerodon-ui/pro';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';

const Bank = ({
  dataSet,
  custLoading,
  customizeTable,
  tableMaxHeight,
  handleCompareRender,
  customizeUnitCode,
  showUpdateFlag,
}) => {
  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'bankCountryId',
      width: 150,
      displayField: 'countryName',
    },
    {
      name: 'bankCode',
      width: 150,
    },
    {
      name: 'bankName',
      width: 180,
    },
    {
      name: 'bankFirm',
      width: 200,
      displayField: 'bankFirm',
    },
    {
      name: 'bankBranchName',
      width: 300,
    },
    {
      name: 'bankAccountName',
      width: 300,
    },
    {
      name: 'bankAccountNum',
      width: 250,
      editor: <SecretField readOnly displayOutput />,
    },
    {
      name: 'intlBankAccountNum',
      width: 250,
    },
    {
      name: 'accountNature',
      width: 160,
      type: 'select',
    },
    {
      name: 'accountPurpose',
      width: 120,
      type: 'select',
    },
    {
      name: 'currencyId',
      width: 140,
      displayField: 'currencyName',
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
      type: 'select',
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'paymentType',
      width: 150,
      displayField: 'paymentTypeIdMeaning',
    },
    {
      name: 'enabledFlag',
      width: 80,
      type: 'boolean',
    },
    {
      name: 'masterFlag',
      width: 100,
      type: 'boolean',
    },
    {
      name: 'remark',
      width: 200,
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, displayField, ...others } = column;
      return {
        renderer: ({ value, record, name }) =>
          handleCompareRender({ value, record, name, type, displayField }),
        ...others,
      };
    });

  return customizeTable(
    {
      code: customizeUnitCode,
      readOnly: true,
      extTextRenderIntercept: handleExtTextRenderIntercept,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      style={tableMaxHeight}
      custLoading={custLoading}
      selectionMode="none"
    />
  );
};

export default Bank;
