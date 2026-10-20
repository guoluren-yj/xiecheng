import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import payDocRecordDS from '../stores/payDocRecordDS';
import { PayDocRecordCustCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

interface PayDocRecordProps {
  paperId: string | number;
}

const PayDocRecord = withCustomize({
  unitCode: [ PayDocRecordCustCode ],
})((props) => {

  const { paperId, customizeTable } = props;

  const listDs = useMemo(() => new DataSet(payDocRecordDS(paperId)), [paperId]);

  const columns = useMemo(() => {
    return [
      { name: 'statusCode', width: 120, renderer: statusTagRender },
      { name: 'payNum', width: 150 },
      { name: 'statementLineNum', width: 130 },
      { name: 'createdByName', width: 120 },
      { name: 'creationDate', width: 120 },
    ];
  }, []);

  return customizeTable({
    code: PayDocRecordCustCode,
  }, (
    <Table
      columns={columns}
      dataSet={listDs}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    />
  ));
}) as React.FC<PayDocRecordProps>;

export default PayDocRecord;