import React, { useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { dateRender } from 'utils/renderer';

export default function PerformanceEvaluation({ dataSet }: { dataSet: DataSet }) {
  // 供货能力
  const columns: ColumnProps[] = useMemo(
    () => [
      {
        name: 'evalStatusMeaning',
      },
      {
        name: 'evalNum',
      },
      {
        name: 'evalName',
      },
      {
        name: 'evalTplName',
      },
      {
        name: 'kpiMethodMeaning',
      },
      {
        name: 'evalCycleMeaning',
      },
      {
        name: 'evalDateFrom',
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'evalDateTo',
        renderer: ({ value }) => dateRender(value),
      },
      {
        name: 'evalDimensionMeaning',
      },
      {
        name: 'evalDimensionValueMeaning',
      },
      {
        name: 'levelCode',
      },
      {
        name: 'finalScore',
      },
      {
        name: 'processUserName',
      },
      {
        name: 'processUnitName',
      },
      {
        name: 'creationDate',
      },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} rowHeight={32} />;
}
