/**
 * PurchaseInform - 采购财务
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

import HeaderInfo from './HeaderInfo';

const PurchaseInform = ({
  headerDs,
  lineDs,
  isEdit,
  customizeTable,
  customizeForm,
  custLoading,
  headerCode = '',
  lineCode = '',
  type = '',
  proxyDsCreate,
  buttonCode = '',
}) => {
  const columns = [
    {
      name: 'organizationCode',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'organizationName',
      width: 200,
    },
    {
      name: 'purchaseAgentId',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'termId',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'typeCode',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'tradeTerms',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'tradeTermsSite',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'currencyCode',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'reconciliationAccount',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'sortNumber',
      width: 100,
      editor: isEdit,
    },
    {
      name: 'frozenFlag',
      width: 100,
      editor: isEdit,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];
  const buttons = isEdit ? ['add', 'delete'] : [];

  return (
    <Fragment>
      <HeaderInfo
        code={headerCode}
        dataSet={headerDs}
        isEdit={isEdit}
        customizeForm={customizeForm}
        custLoading={custLoading}
        type={type}
        proxyDsCreate={proxyDsCreate}
      />
      {customizeTable(
        {
          code: lineCode,
          readOnly: !isEdit,
          buttonCode,
        },
        <Table dataSet={lineDs} columns={columns} buttons={buttons} custLoading={custLoading} />
      )}
    </Fragment>
  );
};

export default PurchaseInform;
