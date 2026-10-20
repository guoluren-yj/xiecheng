import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import {
  TableColumnTooltip,
  TableQueryBarType,
  SelectionMode,
} from 'choerodon-ui/pro/lib/table/enum';

// const { Search } = Input;
interface ISecondPartsTable {
  dataSet: DataSet;
  tenantId: number | string;
  dataSourceId: number | string;
  refreshCompleteData: (res: model.DataBaseAssign[], type: string) => void;
  type: string;
}
export default ({
  dataSet,
  tenantId,
  dataSourceId,
  refreshCompleteData,
  type,
}: ISecondPartsTable) => {
  useEffect(() => {
    init();
  }, [tenantId, dataSourceId, dataSet]);

  // 初始化
  const init = async () => {
    dataSet.setQueryParameter('tenantId', tenantId);
    dataSet.setQueryParameter('dataSourceId', dataSourceId);
    dataSet.query().then((res) => {
      refreshCompleteData(res, type);
    });
  };

  /**
   * 内置columns（useMemo）
   */
  const columns = useMemo(
    () => [
      {
        name: 'name',
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'description',
        tooltip: TableColumnTooltip.overflow,
      },
    ],
    []
  );

  return (
    <Table
      dataSet={dataSet}
      queryBar={TableQueryBarType.none} // 不加时默认dom结构和演示环境不一致
      columns={columns} // 内置columns,使用useMemo
      useMouseBatchChoose
      selectionMode={SelectionMode.rowbox}
    />
  );
};
