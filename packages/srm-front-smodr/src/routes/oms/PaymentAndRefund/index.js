import React, { Component } from 'react';
import { DataSet, Button, notification } from 'choerodon-ui/pro';
import { Tabs, Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';

import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { fetchDetailInfo } from '@/services/oms/dealRecordService';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { SMALL_ORDER } from '_utils/config';
import { quickBatchPay } from '@/services/oms/paymentRecordService';
import c7nModal from '@/utils/c7nModal';
import AllList from './AllList';
import WaitForPay from './WaitForPay';
import WaitForRefund from './WaitForRefund';
import { allDs, payDs, refundDs } from './initDs';

import PayModal from './PayModal';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();

const ExportBtn = observer(({activeKey, dataSet, fieldValuesFn}) => {
  const templateCodeList = [
    'SRM_C_SRM_S2FUL_PAYMENT_ALL',
    'SRM_C_SRM_S2FUL_PAYMENT_TO_PAY',
    'SRM_C_SRM_S2FUL_PAYMENT_REFUND',
  ];
  const urls = [
    '/payments/payment-all-export',
    '/payments/payment-to-export',
    '/payments/payment-refund-export',
  ];
  return (
    <ExcelExportPro
      method='POST'
      allBody
      requestUrl={`${SMALL_ORDER}/v1/${organizationId}${urls[activeKey - 1]}`}
      templateCode={templateCodeList[activeKey - 1]}
      queryParams={() => {
        const query = fieldValuesFn(dataSet);
        return filterNullValueObject(query);
      }}
      buttonText={dataSet.selected.length > 0 ? intl.get('hzero.common.button.selectedExport').d('勾选导出') : intl.get('hzero.common.button.export').d('导出')}
      otherButtonProps={{
        icon: 'unarchive',
        type: 'c7n-pro',
        funcType: 'flat',
      }}
    />
  );
});

@withRouter
@withCustomize({
  unitCode: [
    'SMODR.PAYMENT.ALL',
    'SMODR.PAYMENT.PAYMENT',
    'SMODR.PAYMENT.REFUND',
    'SMODR.PAYMENT.MERGE.VIEW',
    'SMODR.PAYMENT.TRADING.DETAIL',
    'SMODR.PAYMENT.TRADING.RETURNED',
  ],
})
@formatterCollections({
  code: ['smodr.common', 'smodr.payment', 'smodr.frightLine', 'smodr.orderLine', 'smodr.deal'],
})
// @withProps(() => ({ tableDs: new DataSet(tableDs()) }), {
//   cacheState: true,
//   keepOriginDataSet: true,
// })
export default class PaymentAndRefund extends Component {
  constructor(props) {
    super(props);
    this.state = { activeKey: '1' };
    this.allList = React.createRef();
    this.waitForPay = React.createRef();
    this.waitForRefund = React.createRef();
  }

  allDs = new DataSet(allDs());

  payDs = new DataSet(payDs());

  refundDs = new DataSet(refundDs());

  baseDS = new DataSet();


  componentDidMount() {
    this.payDs.query(1, { onlyCountFlag: 'Y' });
    this.refundDs.query(1, { onlyCountFlag: 'Y' });
  }

  attDs = new DataSet({
    fields: [
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: <span>{intl.get('smodr.deal.view.detail.payDoc').d('汇款凭证')}</span>,
        max: 10,
      },
    ],
  });

  @Bind()
  handleChangeKey(key) {
    this.setState({ activeKey: key });
    if (key === '2') {
      if (this.payDs.getState('queryStatus') === 'ready') {
        this.payDs.query();
      }
    } else if (key === '3') {
      if (this.refundDs.getState('queryStatus') === 'ready') {
        this.refundDs.query();
      }
    } else {
      this.allDs.query();
    }
  }

  @Bind()
  getTag({ record }) {
    const { orderStatus, orderStatusMeaning } = record.toData();
    const colors = {
      TRADING: 'yellow',
      CLOSE: 'gray',
      ORDER_FINISH: 'green',
      FINISH: 'green',
    };
    const color = colors[orderStatus];
    return (
      <Tag color={color} style={{ border: 'none' }}>
        {orderStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  getPayTag({ record }) {
    const { paymentStatus, paymentStatusMeaning } = record.toData();
    const colors = {
      NON_PAYMENT: 'yellow',
      PARTIAL_PAYMENT: 'yellow',
      PAYMENT_PROCESSING: 'yellow',
      FAILED_PAYMENT: 'red',
      ALL_PAYMENT: 'green',
    };
    const color = colors[paymentStatus];
    return (
      <Tag color={color} style={{ border: 'none' }}>
        {paymentStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  getRefundTag({ record }) {
    const { refundStatus, refundStatusMeaning } = record.toData();
    const colors = {
      NON_REFUND: 'yellow',
      REFUNDING: 'yellow',
      REFUND_FAILED: 'red',
      REFUNDED: 'green',
    };
    const color = colors[refundStatus];
    return (
      <Tag color={color} style={{ border: 'none' }}>
        {refundStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  getCancelTag({ record }) {
    const { refundStatus, refundStatusMeaning } = record.toData();
    const colors = {
      NON_REFUND: 'gray',
      REFUND_FAILED: 'red',
    };
    const color = colors[refundStatus];
    return (
      <Tag color={color} style={{ border: 'none' }}>
        {refundStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  handleToDeal() {
    openTab({
      key: `/s2-mall/oms/deal-record`,
      title: 'srm.common.view.dealRecord',
    });
  }

  @Bind()
  async handleMergePayment(modal = {}, record) {
    const list = record ? [record.toData()] : this.payDs?.selected.map((i) => i.toData());
    const attachmentUuid = this.attDs?.current?.get('attachmentUuid');
    const windowHref = window.location.href;
    const res = getResponse(
      await quickBatchPay({ attachmentUuid, returnUrl: windowHref, paymentOrderDTOList: list })
    );
    if (res && res.cashierHtml) {
      if (res?.cashierHtml?.startsWith('http')) {
        window.open(res?.cashierHtml);
      } else {
        document.open('text/html', 'replace');
        document.write(res?.cashierHtml);
        document.close();
      }
    } else if (res?.cashierUri) {
      window.open(`/app${res?.cashierUri}&cashierConfigSource=SMALL_BACK`);
    } else if (res?.merchantOrderNum) {
      modal.close();
      this.setState({ activeKey: '1' }, () => this.allDs.query());
      openTab({
        key: `/s2-mall/oms/deal-record`,
        title: 'srm.common.view.dealRecord',
      });
    } else {
      modal.close();
    }
  }

  @Bind()
  async handleMergePay() {
    const { customizeForm } = this.props;
    const orderIds = this.payDs?.selected.map((i) => i.get('orderId'));
    const selectedData = this.payDs.selected;
    // 勾选订单同时存在无采购方和有采购方
    const payUnEnable = selectedData.some(f => f.get('purchaseCompanyId')) && selectedData.some(f => !f.get('purchaseCompanyId'));
    if(payUnEnable) {
      notification.error({
        message: intl.get('smodr.payment.view.orderPay.mergeNoPurchaser').d('采购方不一致，请重新选择'),
      });
      return;
    }
    const res = await fetchDetailInfo({ orderIds });
    const result = getResponse(res);
    if (result&&!result.failed) {
      // this.setState({ detailInfo: result });
      const modal = c7nModal({
        title: intl.get('smodr.payment.view.orderPay').d('订单支付'),
        style: { width: '1090px' },
        children: (
          <PayModal
            attDs={this.attDs}
            orderIds={orderIds}
            getPayTag={this.getPayTag}
            getTag={this.getTag}
            customizeForm={customizeForm}
            baseData={result}
          />
        ),
        footer: () => (
          <>
            <Button color="primary" onClick={() => this.handleMergePayment(modal)}>
              {intl.get('smodr.payment.view.submitBill').d('提交结算')}
            </Button>
            <Button onClick={() => modal?.close()}>
              {intl.get('smodr.payment.view.cancel').d('取消')}
            </Button>
          </>
        ),
      });
    }
  }

  @Bind()
  handleOpen(record) {
    const { customizeForm } = this.props;
    const modal = c7nModal({
      title: intl.get('smodr.payment.view.orderPay').d('订单支付'),
      style: { width: '1090px' },
      children: (
        <PayModal
          attDs={this.attDs}
          orderIds={[record.get('orderId')]}
          getPayTag={this.getPayTag}
          getTag={this.getTag}
          customizeForm={customizeForm}
        />
      ),
      footer: () => (
        <>
          <Button color="primary" onClick={() => this.handleMergePayment(modal, record)}>
            {intl.get('smodr.payment.view.submitBill').d('提交结算')}
          </Button>
          <Button onClick={() => modal?.close()}>
            {intl.get('smodr.payment.view.cancel').d('取消')}
          </Button>
        </>
      ),
    });
  }

  @Bind()
  fieldValuesFn(ds) {
    if (ds.selected.length > 0) {
      const fieldValues = ds?.queryDataSet?.current?.toJSONData();
      delete fieldValues.__dirty;
      delete fieldValues.__id;
      delete fieldValues._status;
      const orderIds = ds.selected.map((i) => i.toData()).map((item) => item.orderId);
      fieldValues.orderIds = orderIds;
      return filterNullValueObject(fieldValues);
    } else {
      const fieldValues = ds?.queryDataSet?.current?.toJSONData();
      delete fieldValues.__dirty;
      delete fieldValues.__id;
      delete fieldValues._status;
      // 新增筛选器参数
      return filterNullValueObject({
        ...fieldValues,
        orderCodeList: ds.getQueryParameter('orderCodeList'),
      });
    }
  }

  render() {
    const { activeKey } = this.state;
    const { customizeTable, customizeForm } = this.props;
    const dsList = [this.allDs, this.payDs, this.refundDs];
    const currentDs = dsList[activeKey - 1];
    const MergeBtn = observer(({ dataSet }) => (
      <Button
        color="primary"
        onClick={() => this.handleMergePay()}
        icon="account_balance_wallet"
        disabled={dataSet?.selected?.length < 1}
      >
        {intl.get('smodr.payment.view.mergePay').d('合并支付')}
      </Button>
    ));

    return (
      <>
        <Header title={intl.get('smodr.payment.view.orderPayManage').d('订单支付管理')}>
          {activeKey === '1' && (
            <Button color="primary" onClick={() => this.handleToDeal()} icon="assignment">
              {intl.get('smodr.payment.view.dealRecord').d('交易记录')}
            </Button>
          )}
          {activeKey === '2' && <MergeBtn dataSet={this.payDs} />}
          <ExportBtn activeKey={activeKey} dataSet={currentDs} fieldValuesFn={this.fieldValuesFn} />
        </Header>
        <Content>
          <Tabs activeKey={activeKey} onChange={(key) => this.handleChangeKey(key)}>
            <TabPane
              tab={intl.get('smodr.payment.view.all').d('全部')}
              key="1"
              count={() => this.allDs.totalCount}
            >
              <AllList
                allDs={this.allDs}
                getTag={this.getTag}
                getPayTag={this.getPayTag}
                getRefundTag={this.getRefundTag}
                handleOpen={this.handleOpen}
                onRef={(ref) => {
                  this.allList = ref;
                }}
                customizeTable={customizeTable}
                customizeForm={customizeForm}
              />
            </TabPane>
            <TabPane
              tab={intl.get('smodr.payment.view.waitForpay').d('待支付')}
              key="2"
              count={() => this.payDs.totalCount}
            >
              <WaitForPay
                payDs={this.payDs}
                getTag={this.getTag}
                getPayTag={this.getPayTag}
                updateActiveKey={this.handleChangeKey}
                handleOpen={this.handleOpen}
                onRef={(ref) => {
                  this.waitForPay = ref;
                }}
                customizeTable={customizeTable}
              />
            </TabPane>
            <TabPane
              tab={intl.get('smodr.payment.view.waitForrefund').d('待退款')}
              key="3"
              count={() => this.refundDs.totalCount}
            >
              <WaitForRefund
                getTag={this.getTag}
                getRefundTag={this.getRefundTag}
                refundDs={this.refundDs}
                onRef={(ref) => {
                  this.waitForRefund = ref;
                }}
                customizeTable={customizeTable}
              />
            </TabPane>
          </Tabs>
        </Content>
      </>
    );
  }
}
