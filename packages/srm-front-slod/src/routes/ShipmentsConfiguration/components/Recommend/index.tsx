import React, { useEffect, Fragment, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
// import intl from 'srm-front-boot/lib/utils/intl/index.js';
// import SearchBarTable from '@/routes/components/SearchBarTable';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import indexDataSet, {lineDataColumns} from '@/components/CustomWrapperDs';

import { lineColumns } from './methods';

// interface indexProps: {

// }

const RecIndex = () => {

const {
nodeColumns = [],
lineFetchList,
}= lineColumns();
const indexDs = useMemo(() => new DataSet(indexDataSet({
componentData: nodeColumns,
read: lineFetchList,
selection: false,
pageSize: 20,
paging: true,
dataToJSON: 'all',
})), []);

useEffect(() => {
indexDs.query();
}, []);

return (
  <Fragment>
    <div style={{ height: 'calc(100vh - 157px)' }}>
      <Table
        boxSizing={TableBoxSizing.wrapper}
        style={{ maxHeight: `calc(100% - 10px)` }}
        columns={lineDataColumns(nodeColumns)}
        dataSet={indexDs}
      />
    </div>
  </Fragment>
);
};

export default formatterCollections({
    code: ['hzero.common', 'slod.shipmentsConfiguration', 'slod.common'],
  })(RecIndex);
