/**
 * 规则配置详情 - 指标信息 - 添加指标弹窗内部表格组件（平台级）
 * @date: 2021-12-20
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default function AddIndexTable(props = {}) {
  const { tableDs } = props;

  return (
    <Table dataSet={tableDs} queryFieldsLimit={2}>
      <Column name="indexCode" width={100} />
      <Column name="indexName" width={100} />
      <Column name="dataType" width={100} />
      <Column name="serviceCode" width={100} />
      <Column name="serviceName" />
    </Table>
  );
}
