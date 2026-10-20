/**
 *
 * @date: 2020/7/22
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

const Operate = ({ dataSet }) => {
  const columns = [
    {
      name: 'processUserName',
      tooltip: 'overflow',
    },
    {
      name: 'creationDate',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'processStatusMeaning',
      tooltip: 'overflow',
    },
  ];
  return <Table dataSet={dataSet} columns={columns} />;
};

export default Operate;
