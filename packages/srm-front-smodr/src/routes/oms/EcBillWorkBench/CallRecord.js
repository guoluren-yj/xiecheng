import React, { useEffect, useMemo } from 'react';
import { Button, DataSet } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

// import { getResponse } from 'utils/utils';
import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';

import { recordDS } from './ds';
import LogModal from './LogModal';

const list = ['order', 'sub', 'sub', 'afs', 'bill', 'invoice'];

function CallRecord(props) {
  const { recordObj, type } = props;

  const ds = useMemo(() => new DataSet(recordDS(list[type], recordObj)), [recordObj]);
  useEffect(() => {
    switch (type) {
      case '0':
        ds.setQueryParameter('param', {
          id: recordObj.get('id'),
          // thirdOrderId: recordObj.get('thirdOrderId'),
        });
        ds.query();
        break;
      case '1':
        ds.setQueryParameter('param', {
          id: recordObj.get('id'),
          orderId: recordObj.get('orderId'),
        });
        ds.query();
        break;
      case '2':
        ds.setQueryParameter('param', {
          id: recordObj.get('id'),
          orderId: recordObj.get('orderId'),
        });
        ds.query();
        break;
      case '3':
        ds.setQueryParameter('param', {
          id: recordObj.get('id'),
          orderId: recordObj.get('orderId'),
        });
        ds.query();
        break;
      case '4':
        ds.setQueryParameter('param', {
          id: recordObj?.get('id'),
          billId: recordObj?.get('billId'),
        });
        ds.query();
        break;
      case '5':
        ds.setQueryParameter('param', {
          id: recordObj.get('id'),
          applicationNo: recordObj.get('applicationNo'),
        });
        ds.query();
        break;
      default:
        ds.query();
        break;
    }
  }, [type]);

  function renderColor(record) {
    const status = record.get('status');
    if (status === 1) {
      return 'rgba(71,184,129,0.10)';
    } else {
      return 'rgba(245,99,73,0.10)';
    }
  }

  function renderFontColor(record) {
    const status = record.get('status');
    if (status === 1) {
      return '#47B881';
    } else {
      return '#F56349';
    }
  }

  function handleLog(record = {}) {
    const draw = c7nModal({
      title: intl.get('smodr.ecBill.view.log').d('日志'),
      children: <LogModal data={record.toData()} type={type} />,
      style: { width: 742 },
      footer: (
        <Button color="primary" onClick={() => draw?.close()}>
          {intl.get('smodr.ecBill.view.close').d('关闭')}
        </Button>
      ),
    });
  }

  const columns = [
    {
      name: 'statusMeaning',
      renderer: ({ record, value }) => (
        <Tag color={renderColor(record)} style={{ color: renderFontColor(record) }}>
          {value}
        </Tag>
      ),
    },
    {
      name: 'operation',
      renderer: ({ record }) => (
        <Button funcType="link" color="primary" onClick={() => handleLog(record)}>
          {intl.get('smodr.ecBill.view.looklog').d('查看日志')}
        </Button>
      ),
    },
    { name: 'nameMeaning' },
    { name: 'thirdOrderId', filter: type === '0' || type === '1' || type === '2' },
    { name: 'billId', filter: type === '4' },
    { name: 'applicationNo', filter: type === '5' },
    { name: 'deliveryId', filter: type === '1' || type === '2' },
    { name: 'afsOrderId', filter: type === '3' },
    { name: 'errorHandle' },
    { name: 'errorMessage' },
    { name: 'time' },
  ].filter((i) => i.filter !== false);

  return (
    <SearchBarTable
      style={{ maxHeight: `calc(100vh - 280px)` }}
      dataSet={ds}
      columns={columns}
      searchCode="SMOP.EC.RECORD.EC_PARAM_BAR"
      customizedCode="SMODR.EC.BILL.WORKBENCH.PARAM.QUERY"
    />
  );
}

export default CallRecord;
