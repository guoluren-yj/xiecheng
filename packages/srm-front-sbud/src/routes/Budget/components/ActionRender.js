import React from 'react';
import EidtRecord from './EditRecord';
import OccupiedOrAppliedDetail from './OccupiedOrAppliedDetail';

const Index = function Index({ record }) {
  return (
    <div>
      {record.status === 'add' ||
      ['NEW', 'APPROVING', 'REJECT'].includes(record.get('budgetLineStatus')) ? null : (
        <>
          <EidtRecord record={record} style={{ marginRight: '16px' }} />
          <OccupiedOrAppliedDetail record={record} />
        </>
      )}
      {/* {!['NEW', "'APPROVING'", 'REJECT'].includes(budgetHeaderStatus) && (

      )} */}
    </div>
  );
};

export default Index;
