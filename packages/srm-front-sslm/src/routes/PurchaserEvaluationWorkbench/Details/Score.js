/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-10 18:05:56
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/Score.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { useEffect } from 'react';
import { Table } from 'choerodon-ui/pro';

const Score = ({
  dataSet,
  record,
  evalHeaderId,
  batchFlag = false,
  dataSource,
  newIsEdit,
  averageFlag,
}) => {
  useEffect(() => {
    if (batchFlag) {
      dataSet.setQueryParameter('evalHeaderId', evalHeaderId);
      dataSet.setQueryParameter('distributionFlag', 1);
      dataSet.query();
    } else {
      dataSet.loadData(dataSource);
    }
  }, [batchFlag, dataSet, dataSource, record]);

  const columns = [
    { name: 'loginName', width: 100 },
    { name: 'realName', width: 100 },
    { name: 'userDepartment', width: 100 },
    { name: 'respWeight', width: 100, editor: newIsEdit, hidden: averageFlag },
  ];

  return (
    <Table
      dataSet={dataSet}
      selectionMode={newIsEdit ? 'rowbox' : 'click'}
      columns={columns}
      customizable
      customizedCode="sslm-purchaser-evaluation-workbench-batch-scorer"
      autoHeight={{ type: 'maxHeight', diff: 0 }}
    />
  );
};

export default Score;
