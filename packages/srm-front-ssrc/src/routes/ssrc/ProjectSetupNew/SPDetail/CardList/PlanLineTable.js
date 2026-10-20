import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { StoreContext } from '../store/StoreProvider';

// 标段/包信息
const planLineTable = observer(() => {
  const { commonDs: { planLineTableDs } = {}, customizeTable, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const columns = [
    {
      name: 'projectLinePlanNum',
    },
    {
      name: 'projectStageMeaning',
    },
    {
      name: 'planCompleteDate',
    },
  ];

  return customizeTable(
    {
      code: getCustomizeUnitCode('projectPlanTable'),
      dataSet: planLineTableDs,
    },
    <Table dataSet={planLineTableDs} columns={columns} style={{ maxHeight: '4.5rem' }} />
  );
});

export default planLineTable;
