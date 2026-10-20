import React, { useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import {
  TableColumnTooltip,
  TableQueryBarType,
  SelectionMode,
} from 'choerodon-ui/pro/lib/table/enum';

interface ISecondPartsTable {
  dataSet: DataSet;
  tenantId: number | string;
  serviceCode: number | string;
  refreshCompleteData: (res: model.DataBaseAssign[], type: string) => void;
  type: string;
}
export default ({
  dataSet,
  tenantId,
  serviceCode,
  refreshCompleteData,
  type,
}: ISecondPartsTable) => {
  useEffect(() => {
    init();
  }, [tenantId, dataSet, serviceCode]);

  // 初始化
  const init = async () => {
    dataSet.setQueryParameter('tenantId', tenantId);
    dataSet.setQueryParameter('serviceCode', serviceCode);
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
        name: 'apiPath',
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'description',
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'apiMethod',
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
