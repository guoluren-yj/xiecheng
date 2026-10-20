import React, { useEffect, Fragment, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import SearchBarTable from '@/routes/components/SearchBarTable';
import indexDataSet, {lineDataColumns} from '@/components/CustomWrapperDs';

import { lineColumns } from './methods';

// interface indexProps: {

// }

const HistoryIndex = () => {

const queryParams: any = [
{
label: intl.get('slod.deliveryBoard.model.common.displayPoNum').d('来源订单号'),
name: 'displayPoNum',
type: 'string',
},
{
label: intl.get('slod.deliveryBoard.model.common.displayPoLineNum').d('来源订单行号'),
name: 'displayPoLineNum',
type: 'string',
},
{
label: intl.get('slod.deliveryBoard.model.common.displayLineLocationNum').d('来源订单发运行号'),
name: 'displayLineLocationNum',
type: 'string',
},
];

const {
nodeColumns = [],
lineFetchList,
}= lineColumns();
const indexDs = useMemo(() => new DataSet(indexDataSet({
componentData: nodeColumns,
read: lineFetchList,
selection: false,
queryParams,
pageSize: 20,
paging: true,
dataToJSON: 'all',
})), []);

useEffect(() => {
indexDs.query();
}, []);

return (
  <Fragment>
    <div style={{ height: 'calc(100vh - 155px)' }}>
      <SearchBarTable
        customizedCode='SLOD'
        boxSizing={TableBoxSizing.wrapper}
        style={{ maxHeight: `calc(100% - 22px)` }}
        columns={lineDataColumns(nodeColumns)}
        dataSet={indexDs}
      />
    </div>
  </Fragment>
);
};

export default formatterCollections({
    code: ['hzero.common', 'slod.deliveryBoard', 'slod.common'],
  })(HistoryIndex);
