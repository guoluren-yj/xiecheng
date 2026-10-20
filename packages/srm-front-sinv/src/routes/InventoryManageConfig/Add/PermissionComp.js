import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Table } from 'choerodon-ui/pro';

const PermissionComp = forwardRef(({ tableDs, strategyHeaderId, editorFlag }, ref) => {
  const columns = [
    { name: 'tabCodeMeaning', width: 120 },
    { name: 'operateRoleIdListAll', width: 200, editor: editorFlag },
    { name: 'queryRoleIdListAll', editor: editorFlag },
  ];

  const queryData = () => {
    tableDs.setQueryParameter('params', { strategyHeaderId });
    tableDs.query();
  };

  useEffect(() => {
    queryData();
  }, []);

  useImperativeHandle(ref, () => ({
    ref: ref.current,
    queryData,
  }));

  return (
    <div style={{ height: 'calc(100vh - 155px)' }}>
      <Table
        customizable
        boxSizing="wrapper"
        pagination={false}
        dataSet={tableDs}
        columns={columns}
        style={{ maxHeight: `calc(100% - 20px)` }}
        customizedCode="new-strategy-receiptManageConfig-workbench"
      />
    </div>
  );
});

export default PermissionComp;
