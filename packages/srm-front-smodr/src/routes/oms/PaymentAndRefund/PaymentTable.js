import React from 'react';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'react-router-dom';

import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { quickPay } from '@/services/oms/paymentRecordService';
import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { showRecordModal } from '@/utils/c7nModal';

const organizationId = getCurrentOrganizationId();

const tableDs = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'orderTypeCodeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderTypeCodeMeaning').d('订单类型'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
    },
    {
      name: 'paymentAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.payAmount').d('支付金额'),
    },
    {
      name: 'paymentStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.paymentStatusMeaning').d('支付状态'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'buyerDate',
      type: 'string',
      label: intl.get('smodr.payment.model.buyerDate').d('下单时间'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/payments/payment-order`,
        method: 'GET',
        data: {
          ...data,
          paymentTypeCodeArr: 'COMPANY_PAYMENT,PERSONAL_PAYMENT',
        },
      };
    },
  },
});
@withRouter
export default class PaymentTable extends React.Component {
  constructor(props) {
    super(props);
    const { dataSource } = this.props;
    this.state = {
      dataSource,
    };
  }

  initDs = new DataSet(tableDs());

  componentDidMount() {
    this.initDs.setQueryParameter('orderId', this.state.dataSource?.orderId);
    this.initDs.query();
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource } = nextProps;
    const { dataSource: prevdataSource } = this.props;
    if (dataSource !== prevdataSource) {
      this.setState({ dataSource });
      this.initDs.setQueryParameter('orderId', dataSource.orderId);
      this.initDs.query();
    }
  }

  @Bind()
  handleOpenModal(record) {
    const params = { orderId: record.get('orderId'), operationType: 'PAYMENT' };
    showRecordModal({
      width: 700,
      params,
      url: `/smodr/v1/${organizationId}/payment-records`,
      columns: [
        { name: 'operationTime' },
        { name: 'userName' },
        { name: 'description' },
        { name: 'sourceSystemMeaning', tooltip: 'overflow' },
      ],
      fields: [
        { name: 'operationTime', label: intl.get('smodr.common.model.creationDate').d('日期时间') },
        { name: 'userName', label: intl.get('smodr.common.model.operatorName').d('操作人') },
        { name: 'description', label: intl.get('smodr.common.model.description').d('内容') },
        {
          name: 'sourceSystemMeaning',
          label: intl.get('smodr.common.model.sourceSystem').d('操作系统'),
        },
      ],
    });
  }

  @Bind()
  getTag({ record }) {
    const { orderStatus, orderStatusMeaning } = record.toData();
    const colors = {
      TRADING: ['rgba(48,149,242,0.10)', '#3095F2'],
      CLOSE: ['rgba(0,0,0,0.08)', '#000000'],
      ORDER_FINISH: ['rgba(71,184,129,0.10)', '#47B881'],
      FINISH: ['rgba(71,184,129,0.10)', '#47B881'],
    };
    const [bgColor, fontColor] = colors[orderStatus] || ['', ''];
    return (
      <Tag color={bgColor} style={{ color: fontColor }}>
        {orderStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  getPayTag({ record }) {
    const { paymentStatus, paymentStatusMeaning } = record.toData();
    const colors = {
      NON_PAYMENT: ['rgba(252,160,0,0.10)', '#F88D10;'],
      PARTIAL_PAYMENT: ['rgba(252,160,0,0.10)', '#F88D10;'],
      PAYMENT_PROCESSING: ['rgba(252,160,0,0.10)', '#F88D10;'],
      FAILED_PAYMENT: ['rgba(245,99,73,0.10)', '#F56349'],
      ALL_PAYMENT: ['rgba(71,184,129,0.10)', '#47B881'],
    };
    const [bgColor, fontColor] = colors[paymentStatus] || ['', ''];
    return (
      <Tag color={bgColor} style={{ color: fontColor }}>
        {paymentStatusMeaning}
      </Tag>
    );
  }

  @Bind()
  async quickpay(record) {
    const windowHref = window.location.href;
    const { history } = this.props;
    const res = getResponse(
      await quickPay({ returnUrl: windowHref, paymentOrderDTOList: [record.toData()] })
    );
    if (res && res.paymentOrderNum) {
      history.push(
        `/pub/hpay/checkout-counter?paymentOrderNum=${res.paymentOrderNum}&channelTrxType=link`
      );
    }
  }

  render() {
    const { onHandlepPay } = this.props;
    const columns = [
      { name: 'orderStatusMeaning', renderer: this.props.getTag },
      { name: 'paymentStatusMeaning', renderer: this.props.getPayTag },
      {
        name: 'action',
        width: 230,
        renderer: ({ record }) => [
          <div>
            <Button
              color="primary"
              funcType="link"
              style={{ marginRight: '20px' }}
              disabled={record.toData().paymentStatus !== 'NON_PAYMENT'}
              onClick={() => this.quickpay(record)}
            >
              {intl.get('smodr.payment.model.quickpay').d('立即支付')}
            </Button>
            <Button
              color="primary"
              funcType="link"
              style={{ marginRight: '20px' }}
              disabled={record.toData().paymentStatus === 'NON_PAYMENT'}
              onClick={() => onHandlepPay(record)}
            >
              {intl.get('smodr.payment.model.paymentRecord').d('支付记录')}
            </Button>
            <Button color="primary" funcType="link" onClick={() => this.handleOpenModal(record)}>
              {intl.get('smodr.payment.model.actionRecord').d('操作记录')}
            </Button>
          </div>,
        ],
      },
      { name: 'orderCode', width: 200 },
      { name: 'orderTypeCodeMeaning' },
      {
        name: 'orderAmountMeaning',
      },
      { name: 'paymentTypeMeaning' },
      {
        name: 'paymentAmountMeaning',
      },
      { name: 'currencyName' },
      { name: 'buyerDate' },
    ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '14px', margin: '15px 0', fontWeight: 'bolder' }}>
          {intl.get('smodr.payment.model.payInfo').d('支付信息')}
        </div>
        <Table dataSet={this.initDs} columns={columns} pagination={false} />
      </React.Fragment>
    );
  }
}
