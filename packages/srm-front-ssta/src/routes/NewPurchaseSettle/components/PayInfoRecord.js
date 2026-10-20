import React, { useMemo, useEffect } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import StatusTag from '../../Components/StatusTag';
import { payApplyExcuteRecordDS as recordDs } from '../../../stores/NewPurchaseSettleDS';

const Record = (props) => {
  const { settleRecordId } = props;

  const recordDS = useMemo(() => {
    return new DataSet(recordDs());
  }, []);

  useEffect(() => {
    recordDS.setQueryParameter('settleRecordId', settleRecordId);

    recordDS.query();
  }, []);

  const columns = [
    {
      width: 200,
      name: 'documentNumAndLine',
    },
    {
      width: 200,
      name: 'sourceDocumentNumAndLine',
    },
    {
      width: 200,
      name: 'paymentTypeMeaning',
    },
    {
      width: 200,
      name: 'paymentAmount',
    },
    {
      name: 'recordStatusMeaning',
      width: 120,
      renderer: ({ record, text }) => {
        let color = '';
        switch (record.get('recordStatus')) {
          case 'OCCUPIED':
            color = 'error';
            break;
          case 'CANCELED':
            color = 'info';
            break;
          case 'COMPLETED':
            color = 'success';
            break;
          default:
            color = 'warn';
            break;
        }
        return <StatusTag text={text} color={color} />;
      },
    },
    {
      name: 'recordDate',
      width: 150,
    },
    {
      width: 120,
      name: 'recordSource',
    },
    {
      width: 120,
      name: 'companyName',
    },
    {
      width: 120,
      name: 'supplierCompanyName',
    },
  ];

  return <Table columns={columns} dataSet={recordDS} />;
};

export default Record;
