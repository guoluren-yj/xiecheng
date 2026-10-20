import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import { sourceDocumentDS } from './mainDS';


const SourceDocument = (props) => {

  const { dataSource = [] } = props;

  const sourceDocumentDs = useMemo(() => new DataSet(sourceDocumentDS(dataSource)), [dataSource]);

  const columns = useMemo(() => {
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
