/*
 * @Date: 2023-03-07 10:39:32
 * @Author: CDJ <dengji.chen@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { categoryDS } from './stores/getCategoryDS';

const Index = ({ scopeId, onRef = () => {} }) => {
  const dataSet = useMemo(() => new DataSet(categoryDS({ scopeId })), []);

  useEffect(() => {
    onRef(dataSet);
  }, []);
  const columns = [
    {
      name: 'categoryCode',
      width: 300,
    },
    {
      name: 'categoryName',
      width: 300,
    },
  ];
  return (
    <Table
      mode="tree"
      virtual
      virtualCell
      dataSet={dataSet}
      columns={columns}
      queryFieldsLimit={2}
      defaultRowExpanded
      autoHeight={{ type: 'minHeight', diff: 0 }}
    />
  );
};

export default Index;
