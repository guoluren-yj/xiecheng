import React, { useMemo } from 'react';
import type { DataSet} from 'choerodon-ui/pro';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { yesOrNoRender } from 'utils/renderer';

export default function SupplierAvailable({ dataSet, remote }: { dataSet: DataSet, remote:any }) {
  // 供货能力
  const cols: ColumnProps[] = useMemo(
    () => [
      { name: 'itemCode' },
      { name: 'itemName' },
      { name: 'itemCategoryCode' },
      { name: 'itemCategoryName' },
      { name: 'supplyFlag', renderer: ({ value }) => yesOrNoRender(value) },
    ],
    []
  );
  const columns = remote?remote.process("SRM_COMMON_SUPPLIER_LOV_SUPPLIER_AVAILABLE_TABLE_COLUMNS",cols,{dataSet}):cols;
  return <Table dataSet={dataSet} columns={columns} />;
}
