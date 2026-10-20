import React from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { showRecordModal } from '@/utils/c7nModal';
import { SMALL_ORDER } from '_utils/config';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { applyRefund } from '@/services/oms/paymentRecordService';

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
    // {
    //   name: 'orderAmount',
    //   type: 'string',
    //   label: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
    // },
    {
      name: 'orderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'refundedAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundStatusMeaning').d('退款状态'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.payment.model.currencyCode').d('币种'),
    },
    {
      name: 'refundAmountMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundAmount').d('退款金额'),
    },
    {
      name: 'refundStatusMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.refundStatusMeaning').d('退款状态'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.payment.model.remark').d('退款原因'),
    },
    {
      name: 'cancelDate',
      type: 'string',
      label: intl.get('smodr.payment.model.cancelDate').d('订单取消时间'),
    },
    {
      name: 'action',
      label: intl.get('smodr.payment.model.action').d('操作'),
    },
    {
      name: 'afterSaleCode',
      type: 'string',
      label: intl.get('smodr.payment.model.afterSaleNum').d('售后申请单号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.payment.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.payment.model.skuName').d('商品名称'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.unitPrice').d('单价'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.payment.model.returnNumber').d('退货数量'),
    },
    {
      name: 'applyTime',
      type: 'string',
      label: intl.get('smodr.payment.model.applyTime').d('售后申请时间'),
    },
    {
      name: 'ownerName',
      type: 'string',
      label: intl.get('smodr.payment.model.ownerName').d('售后申请人'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams, ...params } = data;
      const url = `${SMALL_ORDER}/v1/${organizationId}/refunds/refund-info`;
      return {
        url,
        method: 'GET',
        data: { ...params, ...queryParams },
      };
    },
  },
});
export default class PaymentTable extends React.Component {
  constructor(props) {
    super(props);
    const { dataSource = '', refundStatus } = this.props;
    this.state = {
      dataSource,
      refundStatus,
    };
  }

  initDs = new DataSet(tableDs());

  componentDidMount() {
    this.initDs.setQueryParameter('queryParams', {
      orderId: this.state.dataSource?.orderId,
      refundTypeCode: this.state.dataSource?.refundTypeCode,
      refundStatusArr: this.state.refundStatus,
    });
    this.initDs.query();
  }

  componentWillReceiveProps(nextProps) {
    const { dataSource, refundStatus } = nextProps;
    const { dataSource: prevdataSource, refundStatus: prevRefundStatus } = this.props;
    if (dataSource !== prevdataSource || refundStatus !== prevRefundStatus) {
      this.setState({ dataSource, refundStatus }, () => {
        this.initDs.setQueryParameter('queryParams', {
          orderId: this.state.dataSource?.orderId,
          refundTypeCode: this.state.dataSource?.refundTypeCode,
          refundStatusArr: this.state.refundStatus,
        });
        this.initDs.query();
      });
    }
  }

  @Bind()
  async applyRefund(record) {
    const res = getResponse(await applyRefund(record.toData()));
    if (res && !res.failes) {
      this.initDs.setQueryParameter('queryParams', {
        orderId: this.state.dataSource?.orderId,
        refundTypeCode: this.state.dataSource?.refundTypeCode,
        refundStatusArr: this.state.refundStatus,
      });
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

  render() {
    const { onHandleRefund } = this.props;
    const columns =
      this.state.dataSource.refundTypeCode === 'AFTER_SALE'
        ? [
            { name: 'refundStatusMeaning', renderer: this.props.getRefundTag },
            {
              name: 'action',
              width: 230,
              renderer: ({ record }) => [
                <div>
                  <Button
                    funcType="link"
                    color="primary"
                    style={{ marginRight: '20px' }}
                    onClick={() => this.applyRefund(record)}
                    disabled={
                      !(
                        ['NON_REFUND', 'REFUND_FAILED'].includes(record.toData().refundStatus) &&
                        record.toData().refundMethod === 'OMS_REFUND'
                      )
                    }
                  >
                    {intl.get('smodr.payment.model.appRefund').d('申请退款')}
                  </Button>
                  <Button
                    funcType="link"
                    color="primary"
                    style={{ marginRight: '20px' }}
                    onClick={() => onHandleRefund(record)}
                    disabled={record.toData().refundStatus === 'NON_REFUND'}
                  >
                    {intl.get('smodr.payment.model.refundRecord').d('退款记录')}
                  </Button>
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => this.handleOpenModal(record)}
                  >
                    {intl.get('smodr.payment.model.actionRecord').d('操作记录')}
                  </Button>
                </div>,
              ],
            },
            { name: 'afterSaleCode' },
            { name: 'skuCode' },
            { name: 'skuName' },
            {
              name: 'unitPriceMeaning',
            },
            { name: 'quantityMeaning' },
            {
              name: 'refundAmountMeaning',
            },
            { name: 'currencyName' },
            { name: 'remark' },
            { name: 'applyTime' },
            { name: 'ownerName' },
          ]
        : [
            { name: 'refundStatusMeaning', renderer: this.props.getRefundTag },
            { name: 'orderStatusMeaning', renderer: this.props.getTag },
            {
              name: 'action',
              width: 230,
              renderer: ({ record }) => [
                <div>
                  <Button
                    funcType="link"
                    color="primary"
                    style={{ marginRight: '20px' }}
                    onClick={() => this.applyRefund(record)}
                    disabled={
                      record.toData().refundStatus !== 'NON_REFUND' &&
                      record.toData().refundStatus !== 'REFUND_FAILED'
                    }
                  >
                    {intl.get('smodr.payment.model.appRefund').d('申请退款')}
                  </Button>
                  <Button
                    funcType="link"
                    color="primary"
                    style={{ marginRight: '20px' }}
                    onClick={() => onHandleRefund(record)}
                    disabled={record.toData().refundStatus === 'NON_REFUND'}
                  >
                    {intl.get('smodr.payment.model.refundRecord').d('退款记录')}
                  </Button>
                  <Button
                    color="primary"
                    funcType="link"
                    onClick={() => this.handleOpenModal(record)}
                  >
                    {intl.get('smodr.payment.model.actionRecord').d('操作记录')}
                  </Button>
                </div>,
              ],
            },
            { name: 'orderCode', width: 200 },
            { name: 'orderTypeCodeMeaning' },
            { name: 'currencyName' },
            {
              name: 'refundAmountMeaing',
            },
            { name: 'remark' },
            { name: 'cancelDate' },
          ];
    return (
      <React.Fragment>
        <div style={{ fontSize: '14px', margin: '15px 0', fontWeight: 'bolder' }}>
          {intl.get('smodr.payment.model.refundInfo').d('退款信息')}
        </div>
        <Table dataSet={this.initDs} columns={columns} />
      </React.Fragment>
    );
  }
}
