import React, { useRef, useState, useEffect } from 'react';
import { compose } from 'lodash';
import { DataSet, Button, Tabs } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import TextFieldPro from '@/routes/components/TextFieldPro';
import c7nModal from '@/utils/c7nModal';

import { tableDS, deliverDS, delieveredDS, afsDS, stateDS, invoiceDS } from './ds';
// import DrawerWrap from './DrawerWrap';
import CallRecord from './CallRecord';
import Afs from './Tabs/Afs';
import Delievered from './Tabs/Delievered';
import Deliver from './Tabs/Deliver';
import Invoice from './Tabs/Invoice';
import Statement from './Tabs/Statement';

function EcBillWorkBench(props) {
  const queryRef = useRef(undefined);
  const [type, setType] = useState('0');

  useEffect(() => {
    props.delieveredDS.query(1, { onlyCountFlag: 'Y' });
    props.deliverDS.query(1, { onlyCountFlag: 'Y' });
    props.afsDS.query(1, { onlyCountFlag: 'Y' });
    props.stateDS.query(1, { onlyCountFlag: 'Y' });
    props.invoiceDS.query(1, { onlyCountFlag: 'Y' });
  }, []);

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

  function openDrawerWrap(record = {}) {
    const draw = c7nModal({
      title: intl.get('smodr.ecBill.view.drawer').d('接口调用记录'),
      style: { width: 742 },
      footer: (
        <Button color="primary" onClick={() => draw?.close()}>
          {intl.get('smodr.ecBill.view.close').d('关闭')}
        </Button>
      ),
      // children: <DrawerWrap recordData={record} />,
      children: <CallRecord recordObj={record} type={type} />,
    });
  }

  function handleChange(key) {
    setType(key);
    switch (key) {
      case '0':
        if (props.ds.getState('queryStatus') === 'ready') {
          ds.query();
        }
        break;
      case '1':
        if (props.delieveredDS.getState('queryStatus') === 'ready') {
          props.delieveredDS.query();
        }
        break;
      case '2':
        if (props.deliverDS.getState('queryStatus') === 'ready') {
          props.deliverDS.query();
        }
        break;
      case '3':
        if (props.afsDS.getState('queryStatus') === 'ready') {
          props.afsDS.query();
        }
        break;
      case '4':
        if (props.stateDS.getState('queryStatus') === 'ready') {
          props.stateDS.query();
        }
        break;
      case '5':
        if (props.invoiceDS.getState('queryStatus') === 'ready') {
          props.invoiceDS.query();
        }
        break;
      default:
        ds.query();
        break;
    }
  }

  const { ds } = props;
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
      name: 'orderId',
      width: 180,
    },
    {
      name: 'orderTime',
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
  ];
  return (
    <React.Fragment>
      <Header title={intl.get('smodr.ecBill.view.title').d('电商单据工作台')} />
      <Content>
        <Tabs onChange={(key) => handleChange(key)}>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.ecOrder').d('电商订单')}
            count={() => ds.totalCount}
            key={0}
          >
            {/* {customizeTable(
              { code: 'SMOP.EC.RECORD.EC.DETAIL' }, */}
            <div style={{ height: 'calc(100vh - 260px)' }}>
              <SearchBarTable
                style={{ maxHeight: `calc(100% - 22px)` }}
                customizedCode="SMODR.EC.BILL.WORKBENCH.QUERY"
                searchCode="SMOP.EC.RECORD.EC_ORDER_BAR"
                dataSet={ds}
                columns={columns}
                searchBarConfig={{
                  left: {
                    render: () => (
                      <TextFieldPro
                        ds={ds}
                        placeholder={intl
                          .get('smodr.ecBill.view.queryTipp')
                          .d('电商订单编码、商城订单编码')}
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
            {/* )} */}
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.dispatchBill').d('发货单')}
            count={() => props.delieveredDS?.totalCount}
            key={1}
          >
            <Delievered delieveredDS={props.delieveredDS} type={type} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.delievered').d('妥投')}
            count={() => props.deliverDS?.totalCount}
            key={2}
          >
            <Deliver deliverDS={props.deliverDS} type={type} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.afterSaleBill').d('售后单')}
            count={() => props.afsDS?.totalCount}
            key={3}
          >
            <Afs afsDS={props.afsDS} type={type} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.statementAccount').d('对账单')}
            count={() => props.stateDS?.totalCount}
            key={4}
          >
            <Statement stateDS={props.stateDS} type={type} />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={intl.get('smodr.ecBill.view.invoice').d('发票')}
            count={() => props.invoiceDS?.totalCount}
            key={5}
          >
            <Invoice invoiceDS={props.invoiceDS} type={type} />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </React.Fragment>
  );
}

export default compose(
  withCustomize({
    unitCode: ['SMOP.EC.RECORD.EC.DETAIL'],
  }),
  formatterCollections({
    code: 'smodr.ecBill',
  }),
  withProps(
    () => ({
      ds: new DataSet(tableDS()),
      deliverDS: new DataSet(deliverDS()),
      delieveredDS: new DataSet(delieveredDS()),
      afsDS: new DataSet(afsDS()),
      stateDS: new DataSet(stateDS()),
      invoiceDS: new DataSet(invoiceDS()),
    }),
    {
      cacheState: true,
    }
  )
)(EcBillWorkBench);
