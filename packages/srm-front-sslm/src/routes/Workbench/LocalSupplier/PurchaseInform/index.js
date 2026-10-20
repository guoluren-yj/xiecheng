/**
 * PurchaseInform - 采购财务
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment, useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

import HeaderInfo from './HeaderInfo';

const PurchaseInform = ({
  headerDs,
  lineDs,
  customizeTable,
  customizeForm,
  custLoading,
  tableMaxHeight,
}) => {
  useEffect(() => {
    headerDs.query();
  }, []);

  const columns = [
    {
      name: 'organizationCode',
      width: 200,
    },
    {
      name: 'organizationName',
      width: 200,
    },
    {
      name: 'purchaseAgentName',
      width: 200,
    },
    {
      name: 'termName',
      width: 200,
    },
    {
      name: 'typeName',
      width: 200,
    },
    {
      name: 'tradeTermsMeaning',
      width: 200,
    },
    {
      name: 'tradeTermsSite',
      width: 100,
    },
    {
      name: 'currencyName',
      width: 100,
    },
    {
      name: 'reconciliationAccountMeaning',
      width: 200,
    },
    {
      name: 'sortNumber',
      width: 200,
    },
    {
      name: 'frozenFlag',
      width: 200,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  return (
    <Fragment>
      <HeaderInfo dataSet={headerDs} customizeForm={customizeForm} custLoading={custLoading} />
      {customizeTable(
        {
          code: 'SSLM.SUPPLIER_WORKBENCH_LOCAL.PURCHASE_LINE',
          readOnly: false,
        },
        <Table
          dataSet={lineDs}
          columns={columns}
          custLoading={custLoading}
          style={{ maxHeight: tableMaxHeight }}
        />
      )}
    </Fragment>
  );
};

export default PurchaseInform;
