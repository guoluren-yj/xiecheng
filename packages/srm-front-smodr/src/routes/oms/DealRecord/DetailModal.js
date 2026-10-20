
import React from 'react';
import { Bind } from 'lodash-decorators';
import { Spin, Table, DataSet, Attachment } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { dateTimeRender } from 'utils/renderer';
import RenderForm from '@/routes/components/RenderForm';

import { fetchDealDetail } from '@/services/oms/dealRecordService';

import styles from './detailModal.less';
import { skuDS, freightDS } from './ds';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

export default class DetailModal extends React.Component {
  constructor(props) {
    super(props);
    const { paymentId, paymentTypeCode } = this.props.record?.get(['paymentId', 'paymentTypeCode']);
    // 这个貌似没用
    const operationType = this.props.record?.get('operationType') || this.props?.operationType;
    this.state = {
      loading: false,
      detailInfo: {},
      paymentId,
      operationType,
      paymentType: paymentTypeCode,
    };
  }

  baseDS = new DataSet();

  skuDS = new DataSet(skuDS());

  freightDS = new DataSet(freightDS());

  componentDidMount() {
    const { paymentId, operationType } = this.state;
    this.fetchData(paymentId, operationType);
    this.skuDS.setQueryParameter('queryParam', { paymentId });
    this.freightDS.setQueryParameter('queryParam', { paymentId });
    this.skuDS.query();
    this.freightDS.query();
  }

  componentWillReceiveProps(nextProps, prveState) {
    const newpaymentId = nextProps.record?.get('paymentId');
    const newoperationType = nextProps.record?.get('operationType') || nextProps?.operationType;
    const { paymentId, operationType } = prveState;
    if (paymentId !== newpaymentId || operationType !== newoperationType) {
      this.fetchData(newpaymentId, newoperationType);
      this.skuDS.setQueryParameter('queryParam', { paymentId: newpaymentId });
      this.freightDS.setQueryParameter('queryParam', { paymentId: newpaymentId });
      this.skuDS.query();
      this.freightDS.query();
    }
  }

  @Bind()
  async fetchData(paymentId, operationType) {
    this.setState({ loading: true });
    const res = await fetchDealDetail({ paymentId, operationType });
    this.setState({ loading: false });
    const result = getResponse(res);
    if (result) {
      this.baseDS.loadData([result]);
      this.props.attDs.loadData([{ attachmentUuid: result.attachmentUuid }]);
      this.setState({ detailInfo: result });
    }
  }

  @Bind()
  getRefundTag({ record }) {
    if (record) {
      const { status, statusMeaning } = record.toData();
      const colors = {
        NON_REFUND: 'yellow',
        REFUNDING: 'yellow',
        REFUND_FAILED: 'red',
        REFUNDED: 'green',
      };
      const color = colors[status];
      return (
        <Tag color={color} style={{ border: 'none' }}>
          {statusMeaning}
        </Tag>
      );
    }
  }

  render() {
    const { detailInfo = {}, loading, paymentType } = this.state;
    const { customizeForm } = this.props;
    const skuColumns = [
      { name: 'orderCode' },
      { name: 'cecOrderCode' },
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'skuTypeMeaning' },
      { name: 'quantityMeaning', align: 'right' },
      { name: 'unitPriceMeaning', align: 'right' },
      { name: 'per' },
      { name: 'amountMeaning', align: 'right' },
    ];
    const freightColumns = [
      { name: 'orderCode' },
      { name: 'extraCostTypeMeaning' },
      { name: 'quantityMeaning', align: 'right' },
      { name: 'unitPriceMeaning', align: 'right' },
      { name: 'amountMeaning', align: 'right' },
    ];
    const colorStyle = (record) => {
      if (record?.get('status') === 'ALL_PAYMENT') {
        return {
          color: '#47B881',
          backgroundColor: 'rgba(71,184,129,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        };
      } else {
        return {
          color: '#F88D10',
          backgroundColor: 'rgba(252,160,0,0.10)',
          padding: '2px 4px',
          fontWeight: 600,
          borderRadius: '2px',
          display: 'inline',
        }; // 黄
      }
    };
    const renderFields = () =>
      [
        {
          name: 'code',
          type: 'string',
          label: intl.get('smodr.deal.model.payDealCode').d('商城交易编码'),
        },
        {
          name: 'cecCode',
          type: 'string',
          label: intl.get('smodr.deal.model.orderStatusMeaning').d('支付平台单号'),
          show: paymentType === 'CASH_PAYMENT', // 现金支付
        },
        {
          name: 'cecCode',
          type: 'string',
          label: intl.get('smodr.deal.model.cecCode').d('电商合单号'),
          show: paymentType === 'REMITTANCE_PAYMENT', // 汇款支付
        },
        {
          name: 'cecSerialNumber',
          type: 'string',
          label: intl.get('smodr.deal.model.payConfigName').d('支付渠道交易流水号'),
          show: paymentType === 'CASH_PAYMENT',
        },
        {
          name: 'cecSerialNumber',
          type: 'string',
          label: intl.get('smodr.deal.model.cecSerialNumber').d('电商交易码'),
          show: paymentType === 'REMITTANCE_PAYMENT',
        },
        {
          name: 'operationTypeMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.dealType').d('交易类型'),
        },
        {
          name: 'channelMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.dealChannel').d('支付渠道'),
        },
        {
          name: 'currencyName',
          type: 'string',
          label: intl.get('smodr.deal.model.currency').d('币种'),
        },
        {
          name: 'amountMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.dealAmount').d('交易金额'),
        },
        {
          name: 'statusMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.paymnetStatus').d('支付状态'),
          show: detailInfo?.operationType === 'PAYMENT',
          renderer: ({ text, record }) => <div style={colorStyle(record)}>{text}</div>,
        },
        {
          name: 'operationTime',
          label: intl.get('smodr.deal.model.dealTime').d('交易时间'),
          renderer: ({ value }) => dateTimeRender(value),
        },
        {
          name: 'statusMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.refundStatus').d('退款状态'),
          show: detailInfo?.operationType !== 'PAYMENT',
          renderer: this.getRefundTag,
        },
        {
          name: 'typeCodeMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.refundType').d('退款类型'),
          show: detailInfo?.operationType !== 'PAYMENT',
        },
        {
          name: 'purchaseCompanyName',
          type: 'string',
          label: intl.get('smodr.common.model.purchaseCompanyName').d('采购方'),
        },
        {
          name: 'showSupplierCompanyName',
          type: 'string',
          label: intl.get('smodr.common.model.supplierCompanyName').d('供应商'),
        },
        {
          name: 'remark',
          type: 'string',
          label: intl.get('smodr.common.model.remark1').d('备注'),
        },
        // {
        //   name: 'payerName',
        //   type: 'string',
        //   label: intl.get('smodr.deal.model.payer').d('付款方'),
        // },
        // {
        //   name: 'receiverName',
        //   type: 'string',
        //   label: intl.get('smodr.deal.model.payee').d('收款方'),
        // },
      ].filter((i) => i.show !== false);
    return (
      <Spin spinning={loading}>
        <div className={styles['detail-content']}>
          <div className="app-info">
            {intl.get('smodr.deal.view.detail.baseInfo').d('基本信息')}
          </div>
          <RenderForm
            useLabel
            columns={3}
            dataSet={this.baseDS}
            fields={renderFields()}
            customizeForm={customizeForm}
            code={paymentType === 'CASH_PAYMENT' ? 'SMODR.PAYMENT.TRADING.DETAIL' : 'SMODR.PAYMENT.TRADING.RETURNED'}
          />
          <div className="app-info" style={{ marginTop: 32 }}>
            {intl.get('smodr.deal.view.detail.skuInfo').d('商品信息')}
          </div>
          <Table
            dataSet={this.skuDS}
            columns={skuColumns}
            customizedCode="SMODR.DEAL.RECORD.SKU.SELECT"
          />
          <div className="app-info" style={{ marginTop: 32 }}>
            {intl.get('smodr.deal.view.detail.additionInfo').d('附加费信息')}
          </div>
          <Table
            dataSet={this.freightDS}
            columns={freightColumns}
            customizedCode="SMODR.DEAL.RECORD.FREIGHT.SELECT"
          />
          {
            paymentType === 'REMITTANCE_PAYMENT' && (
              <>
                <div className="app-info" style={{ marginTop: 32 }}>
                  {intl.get('smodr.deal.view.detail.attachment').d('附件')}
                </div>
                <div style={{ width: '400px' }}>
                  <Attachment
                    dataSet={this.props.attDs}
                    name="attachmentUuid"
                    labelLayout="float"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory='smodr'
                  />
                </div>
              </>
            )
          }
        </div>
      </Spin>
    );
  }
}
