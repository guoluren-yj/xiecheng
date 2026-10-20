import React, { useMemo } from 'react';
import { useDataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { tableDS } from './InPrequalProgressDS';

export default observer(function InPrequalProgress(props) {
  const { record = {}, prequalHeaderId = '' } = props || {};

  const { supplierCompanyId } = record || {};

  const tableDs = useDataSet(() => tableDS({ prequalHeaderId, supplierCompanyId }), [
    prequalHeaderId,
    supplierCompanyId,
  ]);

  const columns = useMemo(() => {
    return [
      {
        name: 'loginName',
        width: 130,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'leaderFlagMeaning',
        width: 110,
      },
      {
        name: 'approvedDate',
        width: 160,
      },
      {
        name: 'lineApprovedStatusMeaning',
        width: 120,
      },
      {
        name: 'approvedRemark',
        width: 130,
      },
    ];
  }, []);

  return (
    <Table
      customizedCode="SSRC.INQUIRY_HALL_DETAIL.PREQUAL_LINE_SUGGEST_PROGRESS"
      dataSet={tableDs}
      columns={columns}
      style={{
        maxHeight: 'calc(100vh - 200px)',
      }}
    />
  );
});
