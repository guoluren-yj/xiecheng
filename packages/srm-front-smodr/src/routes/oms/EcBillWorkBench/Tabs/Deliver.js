import React, { useMemo, useRef } from 'react';
import { Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import TextFieldPro from '@/routes/components/TextFieldPro';

// import DrawerWrap from '../DrawerWrap';
import CallRecord from '../CallRecord';

function Deliver(props) {
  const queryRef = useRef(undefined);

  function openDrawerWrap(record = {}) {
    const draw = c7nModal({
      title: intl.get('smodr.ecBill.view.drawer').d('接口调用记录'),
      style: { width: 742 },
      footer: (
        <Button color="primary" onClick={() => draw?.close()}>
          {intl.get('smodr.ecBill.view.close').d('关闭')}
        </Button>
      ),
      children: <CallRecord recordObj={record} type={props.type} />,
    });
  }

  function renderColor(record) {
    const status = record.get('status');
    if (status.match('SUCCESS')) {
      return 'rgba(71,184,129,0.10)';
    } else {
      return 'rgba(245,99,73,0.10)';
    }
  }

  function renderFontColor(record) {
    const status = record.get('status');
    if (status.match('SUCCESS')) {
      return '#47B881';
    } else {
      return '#F56349';
    }
  }

  const columns = useMemo(
    () => [
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
          <span className="action-link">
            <Button color="primary" funcType="link" onClick={() => openDrawerWrap(record)}>
              {intl.get('smodr.ecBill.view.checkRecord').d('接口调用记录')}
            </Button>
            {/* <Button color="primary" funcType="link" onClick={() => openDrawerWrap(record)}>
              {intl.get('smodr.ecBill.view.examine').d('关联单据')}
            </Button> */}
          </span>
        ),
      },
      {
        name: 'thirdOrderId',
        width: 180,
      },
      {
        name: 'subOrderId',
        width: 180,
      },
      {
        name: 'deliveryId',
        width: 150,
      },
      {
        name: 'successCount',
        align: 'right',
      },
      {
        name: 'errorCount',
        align: 'right',
      },
      {
        name: 'supplierMeaning',
      },
      {
        name: 'requestTime',
        width: 150,
      },
    ],
    []
  );

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      <SearchBarTable
        style={{ maxHeight: `calc(100% - 22px)` }}
        dataSet={props.deliverDS}
        columns={columns}
        customizedCode="SMODR.EC.BILL.WORKBENCH.DELIVER.QUERY"
        searchCode="SMOP.EC.RECORD.EC_SIGN_BAR"
        searchBarConfig={{
          left: {
            render: () => (
              <TextFieldPro
                ds={props.deliverDS}
                placeholder={intl.get('smodr.ecBill.model.deliveryId').d('电商发货单编码')}
                name="orderQuery"
                onRef={(ref) => {
                  queryRef.current = ref;
                }}
              />
            ),
          },
          onReset: () => {
            if (queryRef.current) {
              queryRef.current.handleClear();
            }
          },
          onClear: () => {
            if (queryRef.current) {
              queryRef.current.handleClear();
            }
          },
        }}
      />
    </div>
  );
}

export default Deliver;
