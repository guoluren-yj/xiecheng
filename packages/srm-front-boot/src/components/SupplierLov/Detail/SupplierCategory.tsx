import React, { useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { enableRender } from 'utils/renderer';

export default function SupplierCategory({ dataSet }: { dataSet: DataSet }) {
  // 供货能力
  const columns: ColumnProps[] = useMemo(
    () => [
      {
        name: 'categoryCode',
      },
      {
        name: 'categoryDescription',
      },
      {
        name: 'evaluationLevel',
      },
      {
        name: 'evaluationScore',
      },
      {
        name: 'enabledFlag',
        renderer: ({ value }) => enableRender(value),
      },
    ],
    []
  );
  return <Table dataSet={dataSet} columns={columns} />;
}
