import React from 'react';
import { Table } from 'choerodon-ui/pro';
// import { Table } from 'hzero-ui';

const ListTable = (props) => {
  return (
    <div>
      <Table {...props} style={{ maxHeight: `calc(100vh - 450px)` }} />
    </div>
  );
};

export default ListTable;

// export default React.memo(ListTable, shouldRender);
