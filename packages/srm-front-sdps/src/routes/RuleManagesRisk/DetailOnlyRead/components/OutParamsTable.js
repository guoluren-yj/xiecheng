/**
 * 出参弹窗
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

const { Column } = Table;

export default function OutParamsTable(props = {}) {
  const { tableDs } = props;

  return (
    <Table dataSet={tableDs}>
      <Column name="paramName" width={150} tooltip="overflow" />
      <Column name="paramDesc" width={150} tooltip="overflow" />
      <Column name="fieldType" tooltip="overflow" />
    </Table>
  );
}
