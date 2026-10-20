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
import { Link } from 'dva/router';
import { stringify } from 'querystring';
import { getResponse } from 'utils/utils';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { fetchPaymentData } from '@/services/orderWorkspaceService';

import {
  deliveryDS,
  receiptDS,
  settlementDS,
  billDS,
  paymentDS,
  advanceChargeDS,
} from './AssociatedDocumentDs';
import { statusTagRender } from './render';
import ExecuteNum from './ExecuteNum';
import Styles from './index.less';

const { TabPane } = Tabs;
const AssociatedDocument = ({
  modal,
  displayPoNum,
  activeDocKey,
  poLineLocationId,
  record: currentRecord,
  customizeTable,
  customizeTabPane,
}) => {
  const {
    poHeaderId,
    poLineId,
    deliveryStrategyId,
    advancePaymentAmount,
    advanceTotalPaymentAmount,
    advanceActualPaymentAmount,
    advanceVerificationPaymentAmount,
  } = currentRecord.get([
    'poHeaderId',
    'poLineId',
    'deliveryStrategyId',
    'advancePaymentAmount',
    'advanceTotalPaymentAmount',
    'advanceActualPaymentAmount',
    'advanceVerificationPaymentAmount',
  ]);
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
  const [activeKey, setActiveKey] = React.useState(activeDocKey);
  const [paymentData, setPaymentData] = React.useState({});
  // 明细页面行查询接口没有displayPoNum
  const poNum = displayPoNum || currentRecord.get('displayPoNum');
  const poLineNum = currentRecord.get('displayLineNum');
  const paymentDs = useMemo(() => new DataSet(paymentDS({ poNum, poLineNum })), []);
  const advanceChargeDs = useMemo(() => new DataSet(advanceChargeDS()), []);
  useEffect(() => {
    init();
    asnFetchLov();
    recFetchLov();
    billFetchLov();
    settlementFetchLov();
    paymentFetch();
  }, []);

  const init = () => {
    if (modal) {
      const {
        update,
        props: { bodyStyle },
      } = modal;
      update({ bodyStyle: { ...bodyStyle, overflow: 'hidden' } });
    }
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
    paymentDs.query();
    if (advancePaymentAmount) {
      advanceChargeDs.setQueryParameter('associateLineId', poLineId);
      advanceChargeDs.setQueryParameter('prepaymentType', 'PO_LINE');
    } else {
      advanceChargeDs.setQueryParameter('associateId', poHeaderId);
      advanceChargeDs.setQueryParameter('prepaymentType', 'ORDER');
    }
    advanceChargeDs.query();
  };
  const { netReceivedQuantity } = state;

  const paymentFetch = async () => {
    paymentDs.loadData([]);
    const data = getResponse(
      await fetchPaymentData({
        poNum,
        poLineNum,
        action: 'PAYMENT',
        customizeUnitCode: 'SODR.WORKSPACE_CHECKCONTECTDOC.PAYMENT_TABLE',
      })
    );
    if (data) {
      setPaymentData(data);
    }
  };
  /**
   * 送货单状态值集
   */
  const asnFetchLov = async () => {
    const data = await queryIdpValue('SINV.ASN_HEADERS_STATUS');
    if (getResponse(data)) {
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
    if (getResponse(data)) {
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
    if (getResponse(data)) {
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
    if (getResponse(data)) {
      const statusDataBill = {};
      data.forEach(({ value, tag }) => {
        statusDataBill[value] = tag;
      });
      setBillStatusData(statusDataBill);
    }
  };

  /**
   * 改变tab标签
   */

  const changeTabs = (activityKey) => {
    setActiveKey(activityKey);
  };

  const columns = React.useMemo(() => {
    return [
      {
        name: 'asnNum',
        renderer: ({ value, record }) => {
          const { asnHeaderId, queryPermissionFlag, displayAsnLineNum, nodeConfigId } = record.get([
            'asnHeaderId',
            'queryPermissionFlag',
            'displayAsnLineNum',
            'nodeConfigId',
          ]);
          const text = `${value} - ${displayAsnLineNum}`;
          return deliveryStrategyId && !queryPermissionFlag ? (
            text
          ) : (
            <Link
              to={
                deliveryStrategyId
                  ? `/slod/delivery-workbench/detail/all?headerId=${asnHeaderId}&from=all&nodeConfigId=${nodeConfigId}&nodeTemplateCode=ASN`
                  : `/sinv/purchaser-delivery/detail/${asnHeaderId}`
              }
            >
              {text}
            </Link>
          );
        },
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
        renderer: ({ value, record }) => {
          const { rcvTrxHeaderId, nodeConfigIndex, trxLineNum } = record.get([
            'rcvTrxHeaderId',
            'nodeConfigIndex',
            'trxLineNum',
          ]);
          const index = String.fromCharCode(65 + nodeConfigIndex);
          const search = stringify({
            type: 'END',
            from: 'three',
            viewType: 'flat',
            nodeConfigIndexAbc: index,
          });
          const text = `${value} - ${trxLineNum}`;
          return nodeConfigIndex ? (
            <Link to={`/sinv/receipt-workbench/detail/${rcvTrxHeaderId}?${search}`}>{text}</Link>
          ) : (
            text
          );
        },
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
        renderer: ({ value, record }) => {
          const { billHeaderId, billNum, lineNum } = record.get([
            'billHeaderId',
            'billNum',
            'lineNum',
          ]);
          const search = stringify({
            action: 'DETAIL',
            editFlag: 0,
            billList: JSON.stringify([{ billHeaderId, billNum }]),
          });
          return (
            <Link to={`/ssta/new-reconciliation-workbench/detail?${search}`}>
              {value}-{lineNum}
            </Link>
          );
        },
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
        renderer: ({ value, record }) => {
          const { settleHeaderId, lineNum } = record.get(['settleHeaderId', 'lineNum']);
          const search = stringify({
            source: 'list',
            type: 'view',
          });
          return (
            <Link to={`/ssta/new-purchase-settle/invoice/${settleHeaderId}?${search}`}>
              {value}-{lineNum}
            </Link>
          );
        },
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

  const paymentColumns = useMemo(() => {
    return [
      {
        name: 'documentNumAndLine',
        width: 150,
        renderer: ({ value, record }) => {
          const { documentId } = record.get(['documentId']);
          const search = stringify({
            source: 'list',
            type: 'view',
          });
          return (
            <Link to={`/ssta/new-purchase-settle/payment/${documentId}?${search}`}>{value}</Link>
          );
        },
      },
      {
        name: 'recordStatusMeaning',
        renderer: ({ value, record }) => {
          return statusTagRender(value, settleStatusData[record.get('recordStatus')]);
        },
      },
      { name: 'paymentAmount' },
      { name: 'supplierCompanyName' },
      { name: 'companyName' },
      { name: 'paymentType', renderer: ({ record }) => record.get('paymentTypeMeaning') },
      { name: 'paymentDate' },
      { name: 'recordSource' },
    ];
  });

  const advanceChargeColumns = useMemo(
    () => [
      {
        name: 'settleHeaderNum',
        width: 210,
        renderer: ({ record, value }) => `${value}-${record.get('lineNum') || ''}`,
      },
      {
        name: 'settleStatus',
        renderer: ({ record }) => record.get('settleStatusMeaning'),
      },
      {
        name: 'settleType',
        renderer: ({ record }) => record.get('prepaymentTypeMeaning'),
      },
      {
        name: 'prepaymentAmount',
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'companyName',
      },
      {
        name: 'settleHeaderCreationDate',
      },
      {
        name: 'createdUserName',
      },
    ],
    []
  );
  return (
    <div style={{ height: `calc(100vh - 110px)` }}>
      {customizeTabPane(
        {
          code: 'SODR.WORKSPACE_CHECKCONTECTDOC.TABS',
          custDefaultActive: (key) => {
            changeTabs(activeKey || key);
          },
        },
        <Tabs
          onChange={changeTabs}
          activeKey={activeKey}
          animated={false}
          tabPosition="left"
          className={Styles['contect-item']}
        >
          <TabPane
            key="delivery"
            count={() => deliveryDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.delivery').d('送货')}
          >
            <div>
              <ExecuteNum count={netReceivedQuantity} />
              <Table
                dataSet={deliveryDs}
                columns={columns}
                style={{ maxHeight: 'calc(100vh - 260px)' }}
              />
            </div>
          </TabPane>
          <TabPane
            key="receipt"
            count={() => receiptDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.receipt').d('收货')}
          >
            <div>
              <div className={Styles['receipt-num-wrapper']}>
                <ExecuteNum
                  count={currentRecord.get('netReceivedQuantity')}
                  label={intl
                    .get('sodr.workspace.model.common.allNetReceivedQuantity')
                    .d('总接收数量')}
                />
                <ExecuteNum
                  count={currentRecord.get('netDeliverQuantity')}
                  label={intl
                    .get('sodr.workspace.model.common.allNetDeliverQuantity')
                    .d('总入库数量')}
                />
              </div>
              <Table
                dataSet={receiptDs}
                columns={receiptColumns}
                style={{ maxHeight: 'calc(100vh - 260px)' }}
              />
            </div>
          </TabPane>
          <TabPane
            key="settlement"
            count={() => settlementDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.account').d('对账')}
          >
            <div>
              <ExecuteNum count={currentRecord.get('billMatchedQuantity')} />

              <Table
                dataSet={settlementDs}
                columns={settlementColumns}
                style={{ maxHeight: 'calc(100vh - 260px)' }}
              />
            </div>
          </TabPane>
          <TabPane
            key="invoice"
            count={() => billDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.invoice').d('开票')}
          >
            <div>
              <ExecuteNum count={currentRecord.get('invoicedQuantity')} />

              <Table
                dataSet={billDs}
                columns={invoiceColumns}
                style={{ maxHeight: 'calc(100vh - 260px)' }}
              />
            </div>
          </TabPane>
          <TabPane
            key="payment"
            count={() => paymentDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.newPayment').d('付款(含预付款核销)')}
          >
            <div style={{ display: 'flex' }}>
              <ExecuteNum
                label={intl.get('sodr.workspace.model.common.paymentAmountTotal').d('总执行金额')}
                count={paymentData.paymentAmountTotal || 0}
              />
              <ExecuteNum
                label={intl
                  .get('sodr.workspace.model.common.advanceActualPaymentAmount')
                  .d('实际付款金额')}
                count={advanceActualPaymentAmount || 0}
              />
              <ExecuteNum
                label={intl
                  .get('sodr.workspace.model.common.advanceVerificationPaymentAmount')
                  .d('预付款核销金额')}
                count={advanceVerificationPaymentAmount || 0}
              />
            </div>
            {customizeTable(
              {
                code: 'SODR.WORKSPACE_CHECKCONTECTDOC.PAYMENT_TABLE', // 必传，和unitCode一一对应
                dataSet: paymentDs,
              },
              <Table
                style={{ maxHeight: 'calc(100vh - 260px)' }}
                dataSet={paymentDs}
                columns={paymentColumns}
                virtual
              />
            )}
          </TabPane>
          <TabPane
            key="advanceCharge"
            count={() => advanceChargeDs.totalCount}
            tab={intl.get('sodr.workspace.view.title.advanceCharge').d('预付款')}
          >
            <div style={{ display: 'flex' }}>
              <ExecuteNum
                label={intl.get('sodr.workspace.model.common.paymentAmountTotal').d('总执行金额')}
                count={advancePaymentAmount || advanceTotalPaymentAmount || 0}
              />
            </div>
            {customizeTable(
              { code: 'SODR.WORKSPACE_CHECKCONTECTDOC.ADVANCECHARGE_TABLE' },
              <Table
                style={{ maxHeight: '400px', width: '100%' }}
                dataSet={advanceChargeDs}
                columns={advanceChargeColumns}
                virtual
              />
            )}
          </TabPane>
        </Tabs>
      )}
    </div>
  );
};

export default compose(
  formatterCollections({
    code: ['sodr.workspace'],
  }),
  withCustomize({
    unitCode: [
      'SODR.WORKSPACE_CHECKCONTECTDOC.PAYMENT_TABLE',
      'SODR.WORKSPACE_CHECKCONTECTDOC.TABS',
      'SODR.WORKSPACE_CHECKCONTECTDOC.ADVANCECHARGE_TABLE',
    ],
  })
)(AssociatedDocument);
