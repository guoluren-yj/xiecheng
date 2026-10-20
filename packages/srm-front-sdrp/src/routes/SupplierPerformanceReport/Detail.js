import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { ReportDetailDs } from './ds';

function Detail(props) {
  const { record, type, monthOrQuarter } = props;
  const tableProps = useMemo(() => {
    return {
      dataSet: new DataSet(ReportDetailDs({ data: record.toData(), type, monthOrQuarter })),
      columns: [
        { name: 'indicatorCode', width: 170 },
        { name: 'indicatorName' },
        { name: 'evalWeight', align: 'right' },
        { name: 'finalScore', align: 'right' },
        { name: 'avgScore', align: 'right', width: 170 },
        { name: 'diffScore', align: 'right', width: 170 },
        { name: 'maxScore', align: 'right', width: 170 },
        { name: 'minScore', align: 'right', width: 170 },
      ],
      autoHeight: { type: 'maxHeight', diff: 30 },
    };
  }, []);
  return (
    <>
      <div style={{ marginBottom: 8 }}>
        {`${intl.get('sdrp.supplierPerformance.model.bodyTitle').d('考评颗粒度')}：${
          tableProps.dataSet?.current?.get('title') || '-'
        }`}
      </div>
      <div style={{ flex: 1 }}>
        <Table
          mode="tree"
          customizable
          customizedCode="SDRP.SUPPLIER.PERFORMANCE_DETAIL.REPORT.TABLE"
          {...tableProps}
        />
      </div>
    </>
  );
}

export default observer(Detail);
