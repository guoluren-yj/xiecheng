/**
 * 规则配置详情 - 指标维度弹窗的表格(平台级)
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default function IndexDimensionTable(props = {}) {
  const { tableDs, buttons } = props;

  return (
    <Table dataSet={tableDs} buttons={buttons}>
      <Column name="parameterKey" width={150} />
      <Column name="parameterName" width={150} />
      <Column name="dataType" />
    </Table>
  );
}
