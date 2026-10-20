/**
 * 规则配置详情 - 指标信息 - 维度分配 - 添加维度
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default function AddDimensionTable(props = {}) {
  const { tableDs } = props;

  return (
    <Table dataSet={tableDs}>
      <Column name="parameterKey" width={150} />
      <Column name="parameterName" width={150} />
      <Column name="dataType" />
    </Table>
  );
}
