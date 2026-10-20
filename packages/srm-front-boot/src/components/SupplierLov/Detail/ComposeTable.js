/*
 * @Date: 2023-12-20 11:12:39
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

import { getCommonTableProps } from '../utils';

const Index = ({ dataSet, columns = [] }) => {
  const newColumns = columns.map((column) => {
    const { fieldCode, componentType, fixedCol } = column;
    const lock = fixedCol;
    // 处理其他属性
    const tableProps = getCommonTableProps(column);
    const name = ['Lov', 'TransferLov'].includes(componentType) ? `${fieldCode}Lov` : fieldCode;
    return {
      name,
      lock,
      ...tableProps,
    };
  });

  return <Table dataSet={dataSet} columns={newColumns} rowHeight={32} />;
};
export default Index;
