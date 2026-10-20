import React, { useMemo } from 'react';
import {
  useDataSet,
  Table,
} from 'choerodon-ui/pro';

import { TableDS } from './store';

const Index = (props) => {
  const { record: propsRecord } = props;
  const recordId = propsRecord?.get('recordId');
  const tableDs = useDataSet(() => TableDS(recordId), [recordId]);

  const columns = useMemo(
    () => [
      {
        name: 'priceAdjustmentName',
      },
      {
        name: 'priceAdjustmentCode',
      },
    ],
    []
  );

  return (
    <Table
      customizable
      customizedCode="SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.EXECUTION_RES_DOC_TABLE"
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 178px)' }}
    />
  );
};

export default Index;
