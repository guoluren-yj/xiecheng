/**
 * 规则配置详情 - 接口参数
 * @date: 2021-06-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

export default function ParamTable(props = {}) {
  const { tableDs, deleteRecord, isInterface } = props;

  // 接口参数表格列
  const interfaceColumns = [
    {
      name: 'parameterKey',
      width: 200,
    },
    {
      name: 'parameterName',
      width: 300,
    },
    {
      name: 'dataType',
      width: 200,
      editor: true,
    },
    {
      name: 'isRequired',
      width: 100,
      editor: true,
    },
    {
      name: 'description',
      editor: true,
    },
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => deleteRecord(tableDs, record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      ),
    },
  ];

  // 返回参数表格列
  const returnColumns = [
    {
      name: 'parameterKey',
      width: 200,
    },
    {
      name: 'parameterName',
      width: 300,
    },
    {
      name: 'dataType',
      width: 200,
      editor: true,
    },
    {
      name: 'description',
      editor: true,
    },
    {
      name: 'action',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => deleteRecord(tableDs, record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </a>
      ),
    },
  ];

  return <Table dataSet={tableDs} columns={isInterface ? interfaceColumns : returnColumns} />;
}
