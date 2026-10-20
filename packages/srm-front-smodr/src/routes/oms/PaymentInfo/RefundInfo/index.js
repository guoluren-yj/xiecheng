import React from 'react';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

@connect(({ paymentInfo }) => ({
  paymentInfo,
}))
export default class RefundInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  fetchRefundProList(page) {
    const { onSearch } = this.props;
    onSearch(page);
  }

  @Bind()
  fetchRefundFreList(page) {
    const { fetchRefundFre } = this.props;
    fetchRefundFre(page);
  }

  render() {
    const {
      paymentInfo,
      fetchRefundLoading,
      fetchRefundPayLoading,
      fetchRefundFreLoading,
    } = this.props;
    const {
      refundList = [],
      refundProList = [],
      refundProListPagination = {},
      refundFreListPagination = {},
      refundFreList = [],
    } = paymentInfo;
    const refundColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.refundCode').d('商城退款编码'),
        width: 200,
        dataIndex: 'code',
      },
      {
        title: intl.get('smodr.paymentInfo.model.newCecSerialNumber').d('退款流水号'),
        width: 200,
        dataIndex: 'cecSerialNumber',
      },
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
        title: intl.get('smodr.paymentInfo.model.refundChannelMeaning').d('退款渠道'),
        width: 200,
        dataIndex: 'refundChannelMeaning',
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
        title: intl.get('smodr.paymentInfo.model.refundAmount').d('退款金额'),
        width: 200,
        dataIndex: 'refundAmountMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.refundStatusMeaning').d('退款状态'),
        width: 200,
        dataIndex: 'refundStatusMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.refundOperationTime').d('退款时间'),
        width: 200,
        dataIndex: 'operationTime',
      },
      {
        title: intl.get('smodr.paymentInfo.model.remark').d('退款原因'),
        width: 200,
        dataIndex: 'remark',
      },
      {
        title: intl.get('smodr.paymentInfo.model.receiverOne').d('退款方'),
        width: 200,
        dataIndex: 'supplierCompanyName',
      },
    ];
    const refundProColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.refundCode').d('商城退款编码'),
        width: 200,
        dataIndex: 'code',
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
    const refundFreColumns = [
      {
        title: intl.get('smodr.paymentInfo.model.refundCode').d('商城退款编码'),
        width: 200,
        dataIndex: 'code',
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
        title: intl.get('smodr.paymentInfo.model.sendQuantity').d('发货数量'),
        width: 200,
        dataIndex: 'quantityMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.freUnitPrice').d('运费单价'),
        width: 200,
        dataIndex: 'unitPriceMeaning',
      },
      {
        title: intl.get('smodr.paymentInfo.model.amount').d('行金额'),
        width: 200,
        dataIndex: 'amountMeaning',
      },
    ];
    return (
      <React.Fragment>
        <Table
          bordered
          columns={refundColumns}
          dataSource={refundList}
          loading={fetchRefundLoading}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.orderDetail.model.refundProInfo').d('退款商品信息')}
        </div>
        <Table
          bordered
          columns={refundProColumns}
          dataSource={refundProList}
          pagination={refundProListPagination}
          loading={fetchRefundPayLoading}
          onChange={(page) => this.fetchRefundProList(page)}
        />
        <div style={{ fontSize: '16px', margin: '18px 0' }}>
          {intl.get('smodr.orderDetail.model.refundFreInfo').d('退款运费信息')}
        </div>
        <Table
          bordered
          columns={refundFreColumns}
          dataSource={refundFreList}
          loading={fetchRefundFreLoading}
          pagination={refundFreListPagination}
          onChange={(page) => this.fetchRefundFreList(page)}
        />
      </React.Fragment>
    );
  }
}
