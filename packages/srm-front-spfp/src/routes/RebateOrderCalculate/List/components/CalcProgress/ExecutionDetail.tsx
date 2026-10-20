import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import { executionDetailDS } from './storeDS';

interface ExecDetailProps {
  dataSource: any [],
}

const ExecutionDetail = (props: ExecDetailProps) => {

  const { dataSource = [] } = props;

  const executionDetailDs = useMemo<DataSet>(() => new DataSet(executionDetailDS(dataSource)), [dataSource]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'calculateParamCode',
        width: 150,
      },
      {
        name: 'calculateParamName',
        width: 200,
      },
      {
        name: 'calculateFormula',
        width: 180,
      },
      {
        name: 'calculateProcess',
      },
      {
        name: 'calculateResult',
        width: 160,
      },
    ];
  }, []);


  return (
    <Table
      columns={columns}
      dataSet={executionDetailDs}
      customizedCode="SPFP.REBATE_ORDER_CALCULATE_LIST.CALC_EXEC_DETAIL"
    />
  );
};

export default ExecutionDetail;