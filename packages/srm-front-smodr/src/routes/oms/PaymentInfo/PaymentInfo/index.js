import React from 'react';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

@connect(({ paymentInfo }) => ({
  paymentInfo,
}))
export default class PaymentInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  fetchOrderPayList(page) {
    const { onSearch } = this.props;
    onSearch(page);
  }

  @Bind()
  fetchOrderFreList(page) {
    const { fetchOrderFre } = this.props;
    fetchOrderFre(page);
  }

  @Bind()
  fetchOrderPaymentInfo(page) {
    const { fetchOrderPayment } = this.props;
    fetchOrderPayment(page);
  }

  render() {
    const {
      paymentInfo,
      fetchOrderPayLoading,
      fetchPayLoading,
      fetchOrderFreLoading,
      fetchOrderPaymentLoading,
    } = this.props;
    const {
      payList = [],
      orderPayList = [],
      orderPayListPagination = {},
      orderFreListPagination = {},
      orderFreList = [],
      orderPayment = [],
      orderPaymentPagination = {},
    } = paymentInfo;
    const payColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.code').d('商城支付编码'),
        width: 200,
        dataIndex: 'code',
      },
      {
        title: intl.get('smodr.paymentInfo.model.cecSerialNumber').d('支付流水号'),
        width: 200,
        dataIndex: 'cecSerialNumber',
      },
      {
        title: intl.get('smodr.paymentInfo.model.paymentChannelMeaning').d('支付渠道'),
        width: 200,
        dataIndex: 'paymentChannelMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.currencyCode').d('币种'),
        width: 200,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.paymentInfo.model.paymentAllAmount').d('支付总金额'),
        width: 200,
        dataIndex: 'paymentAmountMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.operationTime').d('支付时间'),
        width: 200,
        dataIndex: 'operationTime',
      },
      {
        title: intl.get('smodr.paymentInfo.model.payerName').d('付款方'),
        width: 200,
        dataIndex: 'payerUserName',
      },
      {
        title: intl.get('smodr.frightLine.model.newSupplierCompanyName').d('供应商公司'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
    ];
    const orderProColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.paymentInfo.model.skuCode').d('商品编码'),
        width: 200,
        dataIndex: 'skuCode',
      },
      {
        title: intl.get('smodr.paymentInfo.model.skuName').d('商品名称'),
        width: 200,
        dataIndex: 'skuName',
      },
      {
        title: intl.get('smodr.paymentInfo.model.skuTypeMeaning').d('商品类型'),
        width: 200,
        dataIndex: 'skuTypeMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.quantity').d('数量'),
        width: 200,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.unitPrice').d('单价'),
        width: 200,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.amount').d('行金额'),
        width: 200,
        dataIndex: 'amountMeaning',
      },
    ];
    const orderFreColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.paymentInfo.model.freightTypeMeaning').d('运费类型'),
        width: 200,
        dataIndex: 'freightTypeMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.payMethod').d('运费计价方式'),
        width: 200,
        dataIndex: 'payHao',
      },
      {
        title: intl.get('smodr.paymentInfo.model.quantity').d('数量'),
        width: 200,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.unitPrice').d('单价'),
        width: 200,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.amount').d('行金额'),
        width: 200,
        dataIndex: 'amountMeaning',
      },
    ];
    const orderPayColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.paymentInfo.model.orderTypeCodeMeaning').d('订单类型'),
        width: 200,
        dataIndex: 'orderTypeCodeMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.paymentMethods').d('支付方式'),
        width: 200,
        dataIndex: 'paymentTypeMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.currencyCode').d('币种'),
        width: 200,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.paymentInfo.model.orderAmount').d('订单金额'),
        width: 200,
        dataIndex: 'orderAmountMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.paymentAmount').d('支付金额'),
        width: 200,
        dataIndex: 'paymentAmountMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.paymentStatusMeaning').d('支付状态'),
        width: 200,
        dataIndex: 'paymentStatusMeaning',
      },
    ];
    return (
      <React.Fragment>
        <Table bordered columns={payColumns} dataSource={payList} loading={fetchPayLoading} />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.orderDetail.model.orderPayInfo').d('订单支付信息')}
        </div>
        <Table
          bordered
          columns={orderPayColumns}
          dataSource={orderPayment}
          loading={fetchOrderPaymentLoading}
          pagination={orderPaymentPagination}
          onChange={(page) => this.fetchOrderPaymentInfo(page)}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.orderDetail.model.orderProInfo').d('订单商品信息')}
        </div>
        <Table
          bordered
          columns={orderProColumns}
          dataSource={orderPayList}
          loading={fetchOrderPayLoading}
          pagination={orderPayListPagination}
          onChange={(page) => this.fetchOrderPayList(page)}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.orderDetail.model.orderFreInfo').d('订单运费信息')}
        </div>
        <Table
          bordered
          columns={orderFreColumns}
          dataSource={orderFreList}
          loading={fetchOrderFreLoading}
          pagination={orderFreListPagination}
          onChange={(page) => this.fetchOrderFreList(page)}
        />
      </React.Fragment>
    );
  }
}
