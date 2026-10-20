/**
 * 规则配置详情 - 添加参数弹框表格
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

export default function ParamTable(props = {}) {
  const { lovDataSet } = props;

  const columns = [
    {
      name: 'parameterKey',
      width: 150,
    },
    {
      name: 'parameterName',
      width: 200,
    },
    {
      name: 'dataType',
      width: 100,
    },
    {
      name: 'parameterType',
      width: 100,
    },
    {
      name: 'lastUpdatedBy',
      width: 120,
    },
    {
      name: 'lastUpdateDate',
      width: 150,
    },
    // {
    //   name: 'description',
    //   width: 200,
    // },
  ];

  return <Table dataSet={lovDataSet} columns={columns} />;
}
