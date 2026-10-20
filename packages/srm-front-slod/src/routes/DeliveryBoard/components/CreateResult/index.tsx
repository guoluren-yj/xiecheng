import React, { useEffect, Fragment, useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
// import intl from 'srm-front-boot/lib/utils/intl/index.js';
import indexDataSet, {lineDataColumns} from '@/components/CustomWrapperDs';

import { lineColumns } from './methods';

// interface indexProps: {

// }

const CreateResult = ({initLinkId}) => {

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
  if (initLinkId) {
    indexDs.setQueryParameter('params', {
      initLinkId,
    });
    indexDs.query();
  }
}, []);

return (
  <Fragment>
    <div style={{ height: 'calc(100vh - 180px)' }}>
      <Table
        customizedCode='SLOD'
        columns={lineDataColumns(nodeColumns)}
        dataSet={indexDs}
        style={{ maxHeight: `calc(100% - 22px)` }}
      />
    </div>
  </Fragment>
);
};

export default formatterCollections({
    code: ['hzero.common', 'slod.deliveryBoard', 'slod.common'],
  })(CreateResult);
