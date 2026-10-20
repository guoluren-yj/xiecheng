import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';

import { sourceDocumentDS } from './storeDS';

interface ExecDetailProps {
  dataSource: any [],
}

const SourceDocument = (props: ExecDetailProps) => {

  const { dataSource = [] } = props;

  const sourceDocumentDs = useMemo<DataSet>(() => new DataSet(sourceDocumentDS(dataSource)), [dataSource]);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'displayDocNum',
      },
      {
        name: 'displayLineNum',
      },
      {
        name: 'docNum',
      },
      {
        name: 'lineNum',
      },
    ];
  }, []);


  return (
    <Table
      columns={columns}
      dataSet={sourceDocumentDs}
      customizedCode="SPFP.REBATE_ORDER_CALCULATE_LIST.SOURCE_DOCUMENT_DETAIL"
    />
  );
};

export default SourceDocument;
