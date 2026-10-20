import React from 'react';
import { Table as C7nTable } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

const ExpandTable = ({ columns, dataSet, customizeTable = (e) => e, custLoading }) => {
  return customizeTable(
    { code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_TABLE' },
    <C7nTable columns={columns} dataSet={dataSet} queryFieldsLimit={2} custLoading={custLoading} />
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSLM.SUPPLIER_ABLILITY_DEFINITION.EXPAND_TABLE'],
  })
)(ExpandTable);
