import React from 'react';
import { Table } from 'choerodon-ui/pro';

import QueryBarMore from './QueryBarMore';

export default function AuthHistoryModal(props) {
  const { dataSet } = props;

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const columns = () => {
    return [
      { name: 'companyName' },
      { name: 'sealCode' },
      { name: 'authorizeStartTime' },
      { name: 'authorizeEndTime' },
      { name: 'operationName' },
    ];
  };

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 120px)' }}>
      <Table
        dataSet={dataSet}
        columns={columns()}
        queryBar={renderQueryBar}
        autoHeight={{ type: 'maxHeight', diff: 20 }}
      />
    </div>
  );
}
