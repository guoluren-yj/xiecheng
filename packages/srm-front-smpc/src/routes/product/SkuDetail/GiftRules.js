import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { giveRulesDs } from './ds';

export default function GiftRules({ rules }) {
  const ds = useMemo(() => new DataSet(giveRulesDs(rules)), []);

  const columns = [
    {
      name: 'giftSkuCode',
      width: 120,
    },
    {
      name: 'giftSkuName',
    },
    {
      name: 'giftType',
      width: 120,
    },
    {
      name: 'mainQuantity',
      width: 100,
    },
    {
      name: 'giftQuantity',
      width: 100,
    },
    {
      name: 'percentageGift',
      width: 100,
    },
  ];
  return (
    <Table
      dataSet={ds}
      columns={columns}
      customizedCode="SKU_DETAIL_GIFT_RULES_TABLE"
      style={{ maxHeight: 'calc(100% - 5px)' }}
    />
  );
}
