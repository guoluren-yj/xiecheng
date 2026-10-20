import React, { useMemo, Fragment } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { executionDS } from './storeDS';

interface ExecutionProps {
  payId: number | string;
}

const Execution = (props: ExecutionProps) => {

  const { payId } = props;

  const executionDs = useMemo(() => new DataSet(executionDS(payId)), [payId]);

  const columns = useMemo(() => [
    { name: 'payHeaderNum', width: 150 },
    { name: 'payLineNum', width: 120 },
    { name: 'payAmount', width: 120 },
    { name: 'recordTypeMeaning', width: 170 },
    { name: 'recordStatusMeaning', width: 150 },
    { name: 'creationDate', width: 120 },
    { name: 'operationSourceMeaning', width: 150 },
    { name: 'companyNum', width: 160 },
    { name: 'companyName', width: 200 },
    { name: 'displaySupplierNum', width: 160 },
    { name: 'displaySupplierName', width: 200 },
    { name: 'currencyCode', width: 100 },
    { name: 'payTypeName', width: 150 },
    { name: 'payFormMeaning', width: 150 },
  ], []);

  return (
    <Fragment>
      <Table
        columns={columns}
        dataSet={executionDs}
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      />
    </Fragment>
  );
};

export default Execution;