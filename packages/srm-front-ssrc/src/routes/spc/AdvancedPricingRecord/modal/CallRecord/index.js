import React, { useMemo } from 'react';
import {
  useDataSet,
  Table,
} from 'choerodon-ui/pro';
import { StatusRender } from '../../utils';

import { TableDS } from './store';

const Index = (props) => {
  const { record: propsRecord } = props;
  const recordId = propsRecord?.get('recordId');
  const tableDs = useDataSet(() => TableDS(recordId), [recordId]);

  const columns = useMemo(
    () => [
      {
        name: 'callResult',
        width: 120,
        renderer: ({ value, record }) => {
          return StatusRender(value, record.get('callResultMeaning'));
        },
      },
      {
        name: 'recordNum',
        width: 150,
      },
      {
        name: 'triggerMode',
        width: 120,
      },
      {
        name: 'errorMsg',
      },
      {
        name: 'callTime',
        width: 150,
      },
      {
        name: 'callByName',
        width: 150,
      },
    ],
    []
  );

  return (
    <Table
      customizable
      customizedCode="SPC.ADVANCED_PRICING_RECORD.ADJUST_TAB.CAll_RECORD_TABLE"
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 178px)' }}
    />
  );
};

export default Index;
