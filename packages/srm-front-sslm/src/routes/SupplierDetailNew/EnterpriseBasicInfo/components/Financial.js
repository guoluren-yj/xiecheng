/*
 * @Date: 2023-08-18 11:45:31
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useContext, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { Context } from '@/routes/SupplierDetailNew/Context';
import { computeEnglistAmount } from '@/routes/components/utils/utils';
import { getFinancialDS } from '../stores/getFinancialDS';

const customizeCode = 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.FINANCE';

const Financial = () => {
  const context = useContext(Context);
  const { financeList = [], customizeTable, tableMaxHeight } = context;
  const dataSet = useDataSet(() => getFinancialDS(), []);
  useEffect(() => {
    dataSet.loadData(financeList);
  });

  const columns = [
    {
      name: 'year',
      width: 100,
    },
    {
      name: 'currencyName',
      width: 120,
    },
    {
      name: 'totalAssets',
      width: 120,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'totalLiabilities',
      width: 100,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'currentAssets',
      width: 120,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'currentLiabilities',
      width: 120,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'revenue',
      width: 120,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'netProfit',
      width: 120,
      renderer: ({ value }) => computeEnglistAmount(value, 4),
    },
    {
      name: 'assetLiabilityRatio',
      width: 120,
      renderer: ({ value }) => (value || value === 0 ? `${(value * 100).toFixed(2)}%` : '--'),
    },
    {
      name: 'currentRatio',
      width: 120,
      renderer: ({ value }) => (value || value === 0 ? `${(value * 100).toFixed(2)}%` : '--'),
    },
    {
      width: 120,
      name: 'totalAssetsEarningsRatio',
      renderer: ({ value }) => (value || value === 0 ? `${(value * 100).toFixed(2)}%` : '--'),
    },
    {
      name: 'remark',
      width: 200,
    },
  ];

  return customizeTable(
    {
      code: customizeCode,
    },
    <Table dataSet={dataSet} columns={columns} style={{ maxHeight: tableMaxHeight }} />
  );
};

export default Financial;
