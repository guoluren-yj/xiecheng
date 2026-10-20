/**
 * @Description: 供应商评估计划详情 - 批量分配其他信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-08 15:14:43
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';

const BatchAllocation = observer(({ dataSet, isGroup, customizeTable }) => {
  const columns = useMemo(
    () => [
      { name: 'ouId', hidden: isGroup, editor: true },
      { name: 'invOrganizationId', hidden: isGroup, editor: true },
      { name: 'inventoryId', hidden: isGroup, editor: true },
      { name: 'categoryCode', editor: true },
      { name: 'categoryName', editor: true },
      { name: 'itemId', editor: true },
      { name: 'itemName', editor: true },
      { name: 'evalPrincipalId', width: 150, editor: true },
      { name: 'planMonth', width: 150, editor: true },
      { name: 'planDateFrom', width: 150, editor: true },
      { name: 'planDateTo', width: 150, editor: true },
    ],
    [isGroup]
  );

  const buttons = [
    [
      'add',
      {
        children: intl.get('sslm.vendorEvaluationPlanDetail.button.header.add').d('添加'),
      },
    ],
    [
      'delete',
      {
        onClick: () => {
          dataSet.delete(dataSet.selected, false);
        },
      },
    ],
  ];

  return customizeTable(
    {
      code: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BATCH_ALLOCATION_TABLE',
    },
    <Table
      dataSet={dataSet}
      selectionMode="rowbox"
      columns={columns}
      buttons={buttons}
      autoHeight={{ type: 'maxHeight', diff: 35 }}
    />
  );
});

export default BatchAllocation;
