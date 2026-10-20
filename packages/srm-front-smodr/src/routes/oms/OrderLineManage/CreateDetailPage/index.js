import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import {
  DataSet,
  Table,
  Button,
  Lov,
  Form,
  Attachment,
  TextField,
  TextArea,
  Select,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import PositionAnchor from '_components/PositionAnchor';
// import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { submitBills } from '@/services/oms/orderDetailService';
import { getResponse } from 'utils/utils';
import { productDs, ds, extraDs } from './ds';
import styles from './index.less';

const { Link } = PositionAnchor;
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

@withCustomize({
  unitCode: [
    'SMODR.ORDER.DETAIL.ORDER',
    'SMODR.ORDER.DETAIL.FREIGHT',
    'SMODR.ORDER.DETAIL.SKU',
    'SMODR.ORDER.DETAIL.BUYER',
    'SMODR.ORDER.DETAIL.RECEIVE',
    'SMODR.ORDER.DETAIL.UNIT',
  ],
})
@formatterCollections({
  code: ['smodr.orderDetail', 'smodr.common', 'smodr.orderLine'],
})
@connect(({ orderDetail, orderLineManage }) => ({
  orderDetail,
  orderLineManage,
}))
export default class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    const { initData = {} } = this.props.location.state || {};
    this.state = {
      initData,
      loading: false,
    };
    this.extraDS = new DataSet(extraDs(initData));
  }

  productDs = new DataSet(productDs());

  Ds = new DataSet(ds());

  componentDidMount() {
    const {
      initData: { order = {}, orderEntryList = [], orderExtraList = [] },
    } = this.state;
    const orderExtra = orderExtraList?.filter((i) => i?.orderInvoiceType === 'PURCHASE');
    this.Ds.create(order);
    this.extraDS.create(orderExtra?.[0]);
    this.productDs.loadData(orderEntryList);
  }

  @Bind()
  handleReturn() {
    this.props.history.push('/s2-mall/oms/order-line/list');
  }

  @Bind()
  handleChange(val) {
    this.extraDS.current.set('invoiceContactName', val.contactName);
    this.extraDS.current.set('invoiceTelNum', val.mobile);
  }

  @Bind()
  async handleSubmit() {
    const flag = await this.Ds.validate();
    const extraFlag = await this.extraDS.validate();
    if (flag && extraFlag) {
      const {
        initData: { order = {}, orderExtraList = [] },
      } = this.state;
      const extra = orderExtraList.filter((i) => i?.orderInvoiceType === 'PURCHASE');
      const orderData = this.Ds.toJSONData();
      const orderExtraData = this.extraDS.toJSONData();
      const productData = this.productDs.toData();
      const newOrder = { ...order, ...orderData[0] };
      const newOrderExtraData = { ...extra[0], ...orderExtraData[0] };
      const { invOrganizationId, invOrganizationCode, invOrganizationName } = this.Ds.current.get([
        'invOrganizationId',
        'invOrganizationCode',
        'invOrganizationName',
      ]);
      const newProductData = productData.map((i) => ({
        ...i,
        invOrganizationId,
        invOrganizationCode,
        invOrganizationName,
      }));
      this.setState({
        initData: {
          ...this.state.initData,
          order: newOrder,
          orderEntryList: newProductData,
          orderExtraList: [newOrderExtraData],
        },
        loading: true,
      });
      const res = getResponse(
        await submitBills({
          ...this.state.initData,
          order: newOrder,
          orderEntryList: newProductData,
          orderExtraList: [newOrderExtraData],
        })
      );
      this.setState({ loading: false });
      if (res && !res.failed) {
        this.props.history.push('/s2-mall/oms/order-line/list');
      }
    } else {
      return false;
    }
  }

  render() {
    const { loading } = this.state;
    const { orderLineManage } = this.props;
    const { extensionHeaderData = {} } = orderLineManage;
    const proColumns = [
      {
        name: 'skuCode',
        width: 120,
      },
      {
        name: 'skuName',
        width: 200,
      },
      {
        name: 'entryCode',
      },
      {
        name: 'itemLov',
        editor: true,
      },
      {
        name: 'itemName',
      },
      {
        name: 'quantityMeaning',
        align: 'right',
      },
      {
        name: 'uomName',
      },
      {
        name: 'taxRate',
        align: 'right',
      },
      {
        name: 'currencyName',
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'unitNakedPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'entryAmountMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'nakedPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'proxyUnitPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'proxyUnitNakedPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'proxyEntryAmountMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'proxyNakedPriceMeaning',
        align: 'right',
        width: 120,
      },
      {
        name: 'pickerName',
      },
      {
        name: 'remark',
        editor: true,
      },
    ];
    const currentOffsetTop = null;
    const currentAnchorContainer = () =>
      document.querySelector('.page-content-wrap') || document.body;
    const currentArr = () => {
      return '#BASE_INFO';
    };
    return (
      <React.Fragment>
        <div className={styles['order-detail-content']}>
          <Header
            title={intl.get('smodr.orderDetail.view.title').d('商城订单详情')}
            backPath="/s2-mall/oms/order-line"
          >
            <Button
              loading={loading}
              icon="check"
              color="primary"
              onClick={() => this.handleSubmit()}
            >
              {intl.get('smodr.orderLine.view.submit').d('提交')}
            </Button>
            <Button icon="cancel" onClick={() => this.handleReturn()} funcType="flat">
              {intl.get('smodr.orderLine.view.cancel').d('取消')}
            </Button>
          </Header>
          <Content style={{ padding: '20px 20px 20px 20px', marginBottom: 0 }}>
            <div className="order-detail-title" id="BASE_INFO">
              {intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')}
            </div>
            {/* {customizeForm(
              { code: 'SMODR.ORDER.DETAIL.ORDER' }, */}
            <Form
              dataSet={this.Ds}
              // className="c7n-pro-vertical-form-display"
              labelLayout="float"
              columns={3}
              style={{ width: '75%', marginBottom: '32px' }}
            >
              <TextField name="orderCode" disabled />
              <TextField name="orderTypeMeaning" disabled />
              <TextField name="agreementBusinessTypeMeaning" disabled />
              <TextField name="paymentTypeMeaning" disabled />
              <TextField name="currencyName" disabled />
              <TextField name="orderAmountMeaning" disabled />
              <TextField name="proxyOrderAmountMeaning" disabled />
              <TextField name="purchaseCompanyName" disabled />
              <TextField name="proxySupplierCompanyName" disabled />
              <TextField name="supplierCompanyName" disabled />
              <TextField name="cecCreatedTime" disabled />
              <TextArea name="remark" colSpan={2} resize="both" newLine />
            </Form>
            {/* )} */}
            <div className="order-detail-base" id="XIADAN_INFO">
              {intl.get('smodr.orderDetail.view.buyerInfo').d('下单人信息')}
            </div>
            {/* {customizeForm(
              { code: 'SMODR.ORDER.DETAIL.BUYER' }, */}
            <Form
              dataSet={this.Ds}
              labelLayout="float"
              columns={3}
              style={{ width: '75%', marginBottom: '32px' }}
            >
              <TextField name="buyerName" disabled />
              <TextField name="buyerPhone" disabled />
            </Form>
            {/* )} */}
            <>
              <div className="order-detail-base" id="AC_INFO">
                {intl.get('smodr.orderDetail.view.acquirerInfo').d('收单信息')}
              </div>
              <Form
                dataSet={this.extraDS}
                labelLayout="float"
                columns={3}
                style={{ width: '75%', marginBottom: '32px' }}
              >
                <TextField name="invoiceContactName" disabled />
                <TextField name="invoiceTelNum" disabled />
                <Lov name="invoiceAddressLov" onChange={(val) => this.handleChange(val)} />
              </Form>
            </>
            <div className="order-org-info" id="ORG_INFO">
              {intl.get('smodr.orderDetail.model.orgInfo').d('业务组织关系')}
            </div>
            {/* {customizeForm(
              { code: 'SMODR.ORDER.DETAIL.UNIT' }, */}
            <Form
              dataSet={this.Ds}
              labelLayout="float"
              columns={3}
              style={{
                width: '75%',
                marginBottom: '32px',
              }}
            >
              <Lov name="purOrganizationNameLov" />
              <Lov name="ouNameLov" />
              <Lov name="invorgNameLov" />
            </Form>
            {/* )} */}
            <>
              <div className="order-org-info" id="ORG_INFO">
                {intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}
              </div>
              <Form dataSet={this.extraDS} labelLayout="float" columns={3} style={{ width: '75%' }}>
                <Select name="invoiceTypeName" />
                <Select name="invoiceStateName" />
                <Select name="invoiceContentName" />
                <TextField name="invoiceTitle" disabled />
                <TextField name="taxRegisterNum" disabled />
                <TextField name="depositBank" disabled />
                <TextField name="bankAccount" disabled />
                <TextField name="registeredAddress" disabled />
                <TextField name="registeredPhone" disabled />
              </Form>
            </>
          </Content>
          <Content style={{ marginBottom: 0, padding: '20px 20px' }}>
            <div className="order-product-info" id="PRO_INFO">
              {intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
            </div>
            {/* {customizeTable(
              { code: 'SMODR.ORDER.DETAIL.SKU' }, */}
            <Table
              dataSet={this.productDs}
              columns={proColumns}
              // customizedCode="SMODR.OMS.ORDER_DETAIl.PRODUCT"
              style={{ maxHeight: 450 }}
            />
            {/* )} */}
          </Content>
          <Content style={{ marginBottom: 16, padding: '20px 20px' }}>
            <div style={{ display: 'flex' }}>
              <div style={{ width: '50%' }}>
                <div className="order-product-info" id="ACC_INFO">
                  {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
                </div>
                <div style={{ width: 400 }}>
                  <Attachment
                    dataSet={this.Ds}
                    showHistory
                    labelLayout="float"
                    name="attachmentUuid"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory='smodr'
                  />
                </div>
              </div>
              <div style={{ paddingLeft: 16, borderLeft: '1px dashed rgba(0,0,0,0.16)' }}>
                <div className="order-product-info" id="ACC_INF_OUT">
                  {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
                </div>
                <div style={{ width: 400 }}>
                  <Attachment
                    showHistory
                    dataSet={this.Ds}
                    labelLayout="float"
                    name="outerAttachmentUuid"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory='smodr'
                  />
                </div>
              </div>
            </div>
          </Content>
          <PositionAnchor
            offsetTop={currentOffsetTop || 150}
            getContainer={currentAnchorContainer}
            getCurrentAnchor={currentArr}
          >
            <Link
              href="#BASE_INFO"
              title={intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')}
            />
            <Link
              href="#PRO_INFO"
              title={intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
            />
            <Link
              href={extensionHeaderData?.attachmentUuid ? '#ACC_INFO' : '#ACC_INF_OUT'}
              title={intl.get('smodr.orderDetail.model.accessory').d('附件')}
            />
          </PositionAnchor>
        </div>
      </React.Fragment>
    );
  }
}
