import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import StatusTag from '../Components/StatusTag';
import { recordDS as recordDs } from '../../stores/SupplySettlePoolDS';
import PrePayWriteOffModal from'./PrePayWriteOffModal';
import Styles from '@/routes/common.less';

const Record = (props) => {
  const { settleRecordId, paymentType, customizeTable, history } = props;

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
    paymentType === 'PREPAYMENT' && {
      name: 'prePaymentWriteOff',
      width: 150,
      renderer: ({ record }) => (
        <a onClick={() => handlePrePayWriteOff(record)}>
          {intl.get(`ssta.supplySettle.button.prePayWriteOffRecordHeader`).d('预付款核销记录')}
        </a>
      ),
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

  const handlePrePayWriteOff = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get(`ssta.supplySettle.button.prePayWriteOffRecordHeader`).d('预付款核销记录'),
      closable: true,
      className: Styles['ssta-large-modal'],
      children: <PrePayWriteOffModal settleLineId={record?.get('settleLineId')} settleHeaderId={record?.get('settleHeaderId')} customizeTable={customizeTable} history={history} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  return <Table columns={columns} dataSet={recordDS} />;
};

export default Record;
