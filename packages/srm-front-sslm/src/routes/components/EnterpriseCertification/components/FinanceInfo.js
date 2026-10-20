/**
 * FinanceInfo - 财务信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';

const FinanceInfo = ({ dataSet, finInfo = {} }) => {
  const { enableFieldList = [] } = finInfo;

  const columns = [
    {
      name: 'year',
      width: 120,
    },
    {
      name: 'currencyLov',
      width: 140,
    },
    {
      name: 'totalAssets',
      width: 180,
    },
    {
      name: 'totalLiabilities',
      width: 180,
    },
    {
      name: 'currentAssets',
      width: 180,
    },
    {
      name: 'currentLiabilities',
      width: 180,
    },
    {
      name: 'revenue',
      width: 180,
    },
    {
      name: 'netProfit',
      width: 180,
    },
    {
      name: 'assetLiabilityRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'currentRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'totalAssetsEarningsRatio',
      width: 180,
      renderer: ({ value }) =>
        value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
    },
    {
      name: 'remark',
      width: 200,
    },
  ].filter(item => {
    return enableFieldList.includes(item.name);
  });

  return (
    <Fragment>
      <Table dataSet={dataSet} columns={columns} />
    </Fragment>
  );
};

export default FinanceInfo;
