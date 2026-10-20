/**
 * @Description:
 * @Date: 2021-09-07
 * @author: ljw <jiwei01.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { useMemo, useEffect } from 'react';
import intl from 'utils/intl';
import { Tabs } from 'choerodon-ui';
import { queryIdpValue } from 'services/api';
import { Table, DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { deliveryDS, receiptDS, settlementDS, billDS } from './AssociatedDocumentDs';
import { statusTagRender } from './render';
import ExecuteNum from './ExecuteNum';
import Styles from './index.less';

const { TabPane } = Tabs;
const AssociatedDocument = ({
  poLineLocationId,
  record: currentRecord,
  customizeTabPane,
  displayPoNum,
}) => {
  const { deliveryStrategyId } = currentRecord.get(['deliveryStrategyId']);
  const [state, setState] = React.useState({});
  const [statusData, setStatusData] = React.useState(statusData || {});
  const [recStatusData, setRecStatusData] = React.useState(recStatusData || {});
  const [billStatusData, setBillStatusData] = React.useState(billStatusData || {});
  const [settleStatusData, setSettleStatusData] = React.useState(settleStatusData || {});
  const deliveryDs = useMemo(
    () => new DataSet(deliveryDS(poLineLocationId, deliveryStrategyId)),
    []
  );
  const receiptDs = useMemo(() => new DataSet(receiptDS()), []);
  const settlementDs = useMemo(() => new DataSet(settlementDS(poLineLocationId)), []);
  const billDs = useMemo(() => new DataSet(billDS(poLineLocationId)), []);
  // 明细页面行查询接口没有displayPoNum
  const poNum = displayPoNum || currentRecord.get('displayPoNum');

  const poLineNum = currentRecord.get('displayLineNum');
  useEffect(() => {
    init();
    asnFetchLov();
    recFetchLov();
    billFetchLov();
    settlementFetchLov();
  }, []);
  const init = () => {
    deliveryDs.query().then((res) => {
      const { netReceivedQuantity } = res;
      setState({ netReceivedQuantity });
    }, []);
    receiptDs.setQueryParameter('poLineLocationId', poLineLocationId);
    receiptDs.query();
    settlementDs.setQueryParameter('poNumEquals', poNum);
    settlementDs.setQueryParameter('poLineNum', poLineNum);
    settlementDs.query();
    billDs.setQueryParameter('poNumEquals', poNum);
    billDs.setQueryParameter('poLineNum', poLineNum);
    billDs.setQueryParameter('action', 'INVOICE');
    billDs.query();
  };
  const { netReceivedQuantity } = state;

  /**
   * 送货单状态值集
   */
  const asnFetchLov = async () => {
    const data = await queryIdpValue('SINV.ASN_HEADERS_STATUS');
    if (data) {
      const asnStatusData = {};
      data.forEach(({ value, tag }) => {
        asnStatusData[value] = tag;
      });
      setStatusData(asnStatusData);
    }
  };
  /**
   * 收货单状态值集
   */
  const recFetchLov = async () => {
    const data = await queryIdpValue('SPUC.SINV_STATUS');
    if (data) {
      const reStatusData = {};
      data.forEach(({ value, tag }) => {
        reStatusData[value] = tag;
      });
      setRecStatusData(reStatusData);
    }
  };
  /**
   * 开票状态值集
   */
  const settlementFetchLov = async () => {
    const data = await queryIdpValue('SSTA.SETTLE_STATUS');
    if (data) {
      const statusDataSet = {};
      data.forEach(({ value, tag }) => {
        statusDataSet[value] = tag;
      });
      setSettleStatusData(statusDataSet);
    }
  };
  /**
   * 查询对账单状态值集
   *
   */
  const billFetchLov = async () => {
    const data = await queryIdpValue('SSTA.BILL_STATUS');
    if (data) {
      const statusDataBill = {};
      data.forEach(({ value, tag }) => {
        statusDataBill[value] = tag;
      });
      setBillStatusData(statusDataBill);
    }
  };

  const columns = React.useMemo(() => {
    return [
      {
        name: 'asnNum',
        renderer: ({ value, record }) => (
          <span>
            {value}|{record.get('displayAsnLineNum')}
          </span>
        ),
      },
      {
        name: 'asnStatusMeaning',
        renderer: ({ value, record }) =>
          statusTagRender(value, statusData[record.get('asnStatus')]),
      },
      { name: 'creationDate' },
      { name: 'shipQuantity' },
      { name: 'createdUserName' },
    ];
  });
  const receiptColumns = React.useMemo(() => {
    return [
      {
        name: 'displayTrxNum',
        renderer: ({ value, record }) => (
          <span>
            {value}|{record.get('trxLineNum')}
          </span>
        ),
      },
      {
        name: 'rcvStatusMeaning',
        renderer: ({ value, record }) =>
          statusTagRender(value, recStatusData[record.get('rcvStatus')]),
      },
      { name: 'creationDate' },
      { name: 'rcvTrxTypeName' },
      { name: 'quantity' },
      { name: 'createdUserName' },
    ];
  });
  const settlementColumns = React.useMemo(() => {
    return [
      {
        name: 'billNum',
        renderer: ({ value, record }) => (
          <span>
            {value}|{record.get('lineNum')}
          </span>
        ),
      },
      {
        name: 'billStatusMeaning',
        renderer: ({ value, record }) =>
          statusTagRender(value, billStatusData[record.get('billStatus')]),
      },
      { name: 'creationDate' },
      { name: 'quantity' },
      { name: 'createdUserName' },
    ];
  });
  const invoiceColumns = React.useMemo(() => {
    return [
      {
        name: 'settleHeaderNum',
        renderer: ({ value, record }) => (
          <span>
            {value}|{record.get('lineNum')}
          </span>
        ),
      },
      {
        name: 'settleStatusMeaning',
        renderer: ({ value, record }) => {
          return statusTagRender(value, settleStatusData[record.get('settleStatus')]);
        },
      },
      { name: 'creationDate' },
      { name: 'quantity' },
      { name: 'createdUserName' },
    ];
  });
  return (
    <div style={{ height: '100%' }}>
      {customizeTabPane(
        {
          code: 'SINV.ORDER_EXECUTION_CHECKCONTECTDOC.TABS',
        },
        <Tabs animated={false} tabPosition="left" className={Styles['contect-item']}>
          <TabPane
            key="delivery"
            count={() => deliveryDs.totalCount}
            tab={intl.get('slod.orderExecution.view.title.delivery').d('送货')}
          >
            <div>
              <ExecuteNum count={netReceivedQuantity} />

              <Table dataSet={deliveryDs} columns={columns} />
            </div>
          </TabPane>
          <TabPane
            key="receipt"
            count={() => receiptDs.totalCount}
            tab={intl.get('slod.orderExecution.view.title.receipt').d('收货')}
          >
            <div>
              <div className={Styles['receipt-num-wrapper']}>
                <ExecuteNum
                  count={currentRecord.get('netReceivedQuantity')}
                  label={intl
                    .get('slod.orderExecution.model.common.allNetReceivedQuantity')
                    .d('总接收数量')}
                />
                <ExecuteNum
                  count={currentRecord.get('netDeliverQuantity')}
                  label={intl
                    .get('slod.orderExecution.model.common.allNetDeliverQuantity')
                    .d('总入库数量')}
                />
              </div>
              <Table dataSet={receiptDs} columns={receiptColumns} />
            </div>
          </TabPane>
          <TabPane
            key="settlement"
            count={() => settlementDs.totalCount}
            tab={intl.get('slod.orderExecution.view.title.account').d('对账')}
          >
            <div>
              <ExecuteNum count={currentRecord.get('billMatchedQuantity')} />

              <Table dataSet={settlementDs} columns={settlementColumns} />
            </div>
          </TabPane>
          <TabPane
            key="invoice"
            count={() => billDs.totalCount}
            tab={intl.get('slod.orderExecution.view.title.invoice').d('开票')}
          >
            <div>
              <ExecuteNum count={currentRecord.get('invoicedQuantity')} />

              <Table dataSet={billDs} columns={invoiceColumns} />
            </div>
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['slod.orderExecution', 'sodr.workspace'],
  }),
  withCustomize({
    unitCode: ['SINV.ORDER_EXECUTION_CHECKCONTECTDOC.TABS'],
  })
)(AssociatedDocument);
