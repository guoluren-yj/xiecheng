import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { syncStatusDs } from '@/stores/NewPurchaseSettleDS';

export default function (props) {
  const syncStatusOprDS = useMemo(() => new DataSet(syncStatusDs()), []);

  useEffect(() => {
    const { settleHeaderId } = props;
    syncStatusOprDS.setQueryParameter('settleHeaderId', settleHeaderId);
    syncStatusOprDS.query();
  }, [syncStatusOprDS]);

  const columns = useMemo(
    () => [
      { name: 'syncSystem', width: 160 },
      { name: 'syncStatusMeaning', width: 160 },
      { name: 'syncRemark' },
    ],
    []
  );

  return (
    <Table
      columns={columns}
      dataSet={syncStatusOprDS}
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    />
  );
}
