import React, { useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import QueryBarMore from './QueryBarMore';

import { OperationListDS } from '../stores/eventUpdateSummaryDS';

export default function OperationList(props) {
  const { tenantId = '', userId = '', client, socialCode, enterpriseName = '' } = props;

  const listDS = React.useMemo(() => new DataSet({ ...OperationListDS() }), []);

  useEffect(() => {
    if (tenantId && userId) {
      listDS.setQueryParameter('tenantId', tenantId);
      listDS.setQueryParameter('userId', userId);
      listDS.setQueryParameter('socialCode', socialCode);
      listDS.setQueryParameter('client', client);
      listDS.setQueryParameter('enterpriseName', enterpriseName);
      listDS.query();
    }
  }, [socialCode]);

  const renderQueryBar = (prop) => {
    return <QueryBarMore {...prop} />;
  };

  const columns = () => {
    return [{ name: 'operateType' }, { name: 'operateName' }, { name: 'operateTime' }];
  };

  return (
    <div style={{ height: 'calc(100vh - 180px)' }}>
      <Table
        columns={columns()}
        dataSet={listDS}
        queryFieldsLimit={2}
        queryBar={renderQueryBar}
        autoHeight={{ type: 'maxHeight', diff: 40 }}
      />
    </div>
  );
}
