/*
 * @Date: 2022-05-28 10:27:27
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { categoryDS } from '../stores/getCategoryDS';

const Index = ({
  evalHeaderId,
  supplierId,
  onRef,
  docStatus,
  selectedData,
  isBdkpiEvalFlag,
  categorySelectFlag,
}) => {
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
  const dataSet = new DataSet(
    categoryDS({
      evalHeaderId,
      supplierId,
      docStatus,
      isBdkpiEvalFlag,
      selectedData,
      categorySelectFlag,
    })
  );
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
