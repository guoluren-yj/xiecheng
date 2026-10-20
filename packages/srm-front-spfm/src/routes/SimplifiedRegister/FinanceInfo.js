/**
 * FinanceInfo - 财务信息
 * @date: 2021-11-18
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const FinanceInfo = ({ dataSet, isEdit, companyId }) => {
  useEffect(() => {
    if (companyId) {
      dataSet.setQueryParameter('companyId', companyId);
      dataSet.query();
    }
  }, [companyId]);

  const columns = [
    {
      name: 'year',
      width: 120,
      editor: isEdit,
    },
    {
      name: 'currencyLov',
      width: 140,
      editor: isEdit,
    },
    {
      name: 'totalAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'totalLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentAssets',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'currentLiabilities',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'revenue',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'netProfit',
      width: 180,
      editor: isEdit,
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
      editor: isEdit,
    },
  ];
  const buttons = isEdit
    ? [
        'add',
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
  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      selectionMode={isEdit ? 'rowbox' : 'click'}
    />
  );
};

export default FinanceInfo;
