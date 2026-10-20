/**
 * 订阅历史tab页
 */
import React from 'react';
import { Table } from 'choerodon-ui/pro';

import SearchBar from './SearchBar';

const SubscriptionHistory = (props) => {
  const { dataSet, localRecord } = props;

  const columns = () => {
    return [
      {
        name: 'tenantNum',
      },
      { name: 'tenantName' },
      {
        name: 'operateType',
      },
      {
        name: 'operateTime',
        width: 180,
      },
      { name: 'operateUserName' },
    ];
  };

  const handleQuery = (params) => {
    dataSet.queryParameter = {
      cardId: localRecord.cardId || '',
      bizType: 'CARD_DISTRIBUTION',
      ...params,
    };
    dataSet.query();
  };

  return (
    <>
      <SearchBar onQuery={handleQuery} />
      <Table
        queryBar="none"
        columns={columns()}
        dataSet={dataSet}
        customizable
        customizedCode="SDAT.CARD_DISTRIBUTION_SUBHISTORY_LIST"
      />
    </>
  );
};

export default SubscriptionHistory;
