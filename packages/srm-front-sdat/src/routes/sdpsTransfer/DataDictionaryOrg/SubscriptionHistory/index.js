/**
 * 订阅历史tab页
 */
import React from 'react'; // { useState, useEffect }
import { Table } from 'choerodon-ui/pro';
// import { queryIdpValue } from 'hzero-front/lib/services/api';

// import SearchBar from './SearchBar';
import './index.less';

const SubscriptionHistory = (props) => {
  const { dataSet } = props;

  // const [statusList, setStatusList] = useState([]);

  // useEffect(() => {
  //   queryIdpValue('SDAT.DATASHEET_HISTORY_OPERATION_TYPE').then((res) => {
  //     if (res && res.length) {
  //       setStatusList(res);
  //     }
  //   });
  // }, []);

  const columns = () => {
    return [
      {
        name: 'tenantNum',
      },
      { name: 'tenantName' },
      {
        name: 'type',
        renderer: ({ text, record }) => {
          const classes = ['AUDIT_PASS', 'ALLOCATE', 'SUBSCRIBE'].includes(record.get('type'))
            ? 'tag-success'
            : 'tag-danger';
          return text ? <span className={`tag-span ${classes}`}>{text}</span> : null;
        },
      },
      {
        name: 'submitDate',
        width: 180,
      },
      { name: 'submitterName' },
      {
        name: 'advice',
      },
    ];
  };

  // const handleQuery = (params) => {
  //   dataSet.queryParameter = {
  //     sourceTableId: localRecord.metaId || '',
  //     ...params,
  //   };
  //   dataSet.query();
  // };

  return (
    <>
      {/* <SearchBar onQuery={handleQuery} statusList={statusList} /> */}
      <Table
        queryBar="none"
        columns={columns()}
        dataSet={dataSet}
        customizable
        customizedCode="SDAT.DATASHEET_DATATABLE_SUBHISTORYLIST"
        style={{ marginTop: '16px' }}
      />
    </>
  );
};

export default SubscriptionHistory;
