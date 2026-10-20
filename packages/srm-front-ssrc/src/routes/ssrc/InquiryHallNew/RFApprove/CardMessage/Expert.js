/*
 * @Descripttion: 寻源过程控制--专家组
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 20:15:05
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
// import intl from 'utils/intl';

import Store from '../store';

const Expert = () => {
  const {
    commonDs: { expertDs },
  } = useContext(Store);

  const columns = [
    {
      name: 'expert',
      width: 150,
    },
    {
      name: 'expertName',
      width: 200,
    },
    {
      name: 'evaluateLeaderFlag',
    },
    {
      name: 'team',
    },
    {
      name: 'expertTypeMeaning',
    },
    {
      name: 'phone',
    },
    {
      name: 'email',
    },
  ];

  return (
    <React.Fragment>
      <Table dataSet={expertDs} columns={columns} />
    </React.Fragment>
  );
};

export default Expert;
