/**
 * 规则配置详情 - 策略配置（平台级）（只读）
 * @date: 2021-12-23
 * @author: Zip <Zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Zhenyun
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default function ActionConfigTable(props = {}) {
  const { tableDs } = props;

  return (
    <Table dataSet={tableDs}>
      <Column name="actionName" width={200} />
      <Column name="description" width={200} />
      <Column name="priority" width={100} />
      <Column name="conditionExpression" />
      <Column name="value" width={200} />
    </Table>
  );
}
