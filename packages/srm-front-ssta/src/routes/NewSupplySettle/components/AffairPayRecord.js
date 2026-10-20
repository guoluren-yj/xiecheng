import React, { useMemo, useEffect } from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import StatusTag from '@/routes/Components/StatusTag';
import { recordDS as recordDs } from '@/stores/SupplySettlePoolDS';
import Styles from '@/routes/common.less';
import PrePayWriteOffModal from '../../SupplySettlePool/PrePayWriteOffModal';

const Record = (props) => {
  const { settleRecordId, paymentType, history, customizeTable } = props;

  const recordDS = useMemo(() => {
    return new DataSet(recordDs());
  }, []);

  useEffect(() => {
    recordDS.setQueryParameter('settleRecordId', settleRecordId);
    recordDS.query();
  }, [recordDS, settleRecordId]);

  const columns = useMemo(
    () => [
      {
        width: 200,
        name: 'documentNumAndLine',
      },
      {
        width: 200,
        name: 'sourceDocumentNumAndLine',
      },
      {
        width: 100,
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
        width: 130,
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
        width: 120,
      },
      {
        width: 120,
        name: 'recordSource',
      },
      {
        width: 250,
        name: 'companyName',
      },
      {
        width: 250,
        name: 'supplierCompanyName',
      },
    ],
    []
  );

  const handlePrePayWriteOff = (record) => {
    Modal.open({
      drawer: true,
      title: intl.get(`ssta.supplySettle.button.prePayWriteOffRecordHeader`).d('预付款核销记录'),
      closable: true,
      className: Styles['ssta-large-modal'],
      children: <PrePayWriteOffModal settleLineId={record?.get('settleLineId')} settleHeaderId={record?.get('settleHeaderId')} customizeTable={customizeTable} history={history} settleUxFlag />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  return (
    <div style={{ height: 'calc(100vh - 160px)' }}>
      <Table columns={columns} dataSet={recordDS} style={{ maxHeight: `calc(100% - 20px)` }} />
    </div>
  );
};

export default Record;
