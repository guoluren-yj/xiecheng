/*
 * @Date: 2023-10-19 14:30:42
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const RuleConfiguration = ({ isEdit, dataSet, handlePolicy }) => {
  const buttons = isEdit
    ? [
      <Button icon="playlist_add" onClick={() => handlePolicy(null, dataSet)}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
        'delete',
      ]
    : [];

  const columns = [
    {
      name: 'strategyCode',
      width: 200,
      renderer: ({ value, record }) => <a onClick={() => handlePolicy(record, dataSet)}>{value}</a>,
    },
    {
      name: 'strategyName',
    },
    {
      name: 'orderSeq',
      width: 100,
    },
  ];

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      selectionMode={isEdit ? 'rowbox' : 'none'}
      customizedCode="SSLM.TEMPLATE_DEFINE.STRATEGY_TABLE"
    />
  );
};

export default RuleConfiguration;
