/*
 * @Descripttion: 寻源过程控制--评分要素表格
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 20:36:59
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
// import intl from 'utils/intl';
import { Table } from 'choerodon-ui/pro';

import Store from '../store';

const ScoreTable = () => {
  const {
    commonDs: { scoreDs },
  } = useContext(Store);

  const columns = [
    {
      name: 'indicateLov',
    },
    {
      name: 'indicateName',
    },
    {
      name: 'weight',
    },
    {
      name: 'minScore',
    },
    {
      name: 'maxScore',
    },
    {
      name: 'scoreElements',
    },
    {
      name: 'indicateRemark',
    },
    {
      name: 'expertDistribute',
    },
  ];

  return (
    <React.Fragment>
      <Table dataSet={scoreDs} columns={columns} />
    </React.Fragment>
  );
};

export default ScoreTable;
