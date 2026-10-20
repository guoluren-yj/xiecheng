/**
 * 规则配置详情 - 策略配置（只读）
 * @date: 2021-09-02
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function ActionConfigOnlyRead(props = {}) {
  const { actionConfigDs } = props;

  const columns = [
    {
      name: 'actionName',
      width: 200,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'priority',
      width: 200,
    },
    {
      name: 'value',
    },
  ];

  return <Table dataSet={actionConfigDs} columns={columns} />;
}
