/**
 * 规则配置详情 - 接口参数、返回参数（只读）
 * @date: 2021-09-02
 * @author: Zepeng Huang <zepeng.Huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */
import React from 'react';
import { Table, Icon } from 'choerodon-ui/pro';

export default function ParamTableOnlyRead(props = {}) {
  const { tableDs, isInterface, routeIndexSearch } = props; // isInterface用于区分是接口参数页面还是返回参数页面

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
    },
    {
      name: 'isRequired',
      width: 100,
    },
    {
      name: 'description',
    },
  ];

  const returnColumns = [
    {
      name: 'parameterKey',
      width: 200,
    },
    {
      name: 'parameterName',
      width: 200,
    },
    {
      name: 'dataType',
      width: 200,
    },
    {
      name: 'description',
    },
    {
      name: 'operator',
      width: 100,
      renderer: ({ record }) => {
        return (
          record.get('parameterType') === 'index_parameter' && (
            <Icon
              style={{ fontSize: 12, color: '#29bece', cursor: 'pointer' }}
              type="arrow_forward"
              onClick={routeIndexSearch}
            />
          )
        );
      },
    },
  ];

  return <Table dataSet={tableDs} columns={isInterface ? interfaceColumns : returnColumns} />;
}
