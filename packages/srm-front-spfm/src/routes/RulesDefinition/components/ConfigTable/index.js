/**
 * index.js
 * 配置表格
 * @date: 2020-07-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';

function ConfigTable(props = {}) {
  const { columns, dataSet, ...otherProps } = props;
  return <Table columns={columns} dataSet={dataSet} data={[]} {...otherProps} />;
}

export default ConfigTable;
