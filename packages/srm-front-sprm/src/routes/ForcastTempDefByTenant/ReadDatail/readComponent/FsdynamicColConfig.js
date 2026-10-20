/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';

import { Store } from '../../Detail/stores';

const FsdynamicColConfig = function FsdynamicColConfig() {
  const { fsListDs } = useContext(Store);

  const lineColumns = [
    {
      name: 'dimensionCode',
      width: 200,
    },
    { name: 'dimensionCodeMeaning', width: 180 },
    { name: 'dimensionValue', width: 150 },
    { name: 'dimensionSeq', width: 150 },
    // { name: 'detailFeedbackFlag', width: 150 },
    { name: 'sumWithinDimension', width: 150 },
  ];

  return (
    <Table
      dataSet={fsListDs}
      columns={lineColumns}
      customizedCode="sprm_forcast_temp_tenant_fsdynamicCol"
    />
  );
};

export default FsdynamicColConfig;
