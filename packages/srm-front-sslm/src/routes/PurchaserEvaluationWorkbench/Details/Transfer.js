/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-08 14:34:49
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/Transfer.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { divide, round } from 'lodash';
import uuidv4 from 'uuid/v4';

const Transfer = ({ dataSet, weightSameFlag, averageFlag, currentRespWeight = 100 }) => {
  const columns = [
    { name: 'userLov', editor: true },
    { name: 'userName', editor: true },
    { name: 'userDepartment', editor: true },
    { name: 'respWeight', editor: true },
    { name: 'transformReason', editor: true },
  ];

  const handleAdd = () => {
    const data = dataSet?.toData() || [];
    // 非平均式计算且权重不一致，只能新增一行数据
    if (!averageFlag && !weightSameFlag && data.length === 1) {
      notification.warning({
        message: intl
          .get('sslm.siteInvestigateReport.view.tag.inconsistentWeightMsg')
          .d('存在权重不一致的指标，无法转交给多个评分人'),
      });
      return;
    }
    // 非平均式计算且权重一致，权重默认均分
    if (!averageFlag && weightSameFlag) {
      const respWeight = round(divide(currentRespWeight, data.length + 1), 2);
      const newList = [{ _status: 'create', scorerId: uuidv4() }, ...data].map(n => ({
        ...n,
        respWeight,
      }));
      newList.forEach(n => {
        if (n.$form) {
          n.$form.resetFields(['respWeight']); // 重置已经修改过的权重
        }
      });
      dataSet.loadData(newList);
    } else {
      dataSet.loadData([{ _status: 'create', scorerId: uuidv4() }, ...data]);
    }
  };

  const handleDelete = () => {
    const dataSource = dataSet?.toData() || [];
    const selectedRowKeys = dataSet?.selected?.map(i => i.data.scorerId);
    const newList = dataSource.filter(n => !selectedRowKeys.includes(n.scorerId));
    const respWeight = round(divide(currentRespWeight, newList.length), 2);
    let newDataSource = [];
    // 非平均式计算且权重一致，删除后权重重新分配
    if (!averageFlag && weightSameFlag) {
      newDataSource = newList.map(n => ({ ...n, respWeight }));
    } else {
      newDataSource = newList;
    }
    dataSet.loadData(newDataSource);
    // eslint-disable-next-line no-unused-expressions
    dataSet?.unSelectAll();
    // eslint-disable-next-line no-unused-expressions
    dataSet?.clearCachedSelected();
  };

  const buttons = [['add', { onClick: handleAdd }], ['delete', { onClick: handleDelete }]];

  return <Table dataSet={dataSet} columns={columns} buttons={buttons} />;
};

export default Transfer;
