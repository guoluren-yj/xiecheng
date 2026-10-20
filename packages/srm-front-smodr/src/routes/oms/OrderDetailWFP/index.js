import React from 'react';
import { Collapse } from 'choerodon-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import qs from 'qs';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import { isFunction } from 'lodash';
import { DataSet, Table, Button, Output, Form, Attachment, notification } from 'choerodon-ui/pro';
import cuxRemote from 'hzero-front/lib/utils/remote';

import intl from 'utils/intl';
import PositionAnchor from '_components/PositionAnchor';
// import { PRIVATE_BUCKET } from '_utils/config';
// import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import { AFBasic, AFExtra } from "_components/AFCards";

import { handlePrint } from '@/services/oms/orderDetailService';
import c7nModal from '@/utils/c7nModal';
import openCompareModal from '@/routes/components/CompareModal';
import Image from '@/components/Image';

import { productDs, freightDs, ds } from './ds';
import OtherForm from './otherForm';

// eslint-disable-next-line import/no-duplicates
import styles from './index.less';
// eslint-disable-next-line import/no-duplicates
import './index.less';

const { Link } = PositionAnchor;
const { Panel } = Collapse;
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

@withCustomize({
  unitCode: [
    'SMODR.ORDER.DETAIL.NEW_WORKFLOW.BASEINFO', // 头部卡片
    'SMODR.ORDER.DETAIL.NEW_WORKFOW.EXTRA.BASE_INFO', // 头部额外卡片信息
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.PERSONAL_INFO', // 收货收单
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.SKU', // 商品信息
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.FREIGHT',
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.INVOICE_INFO', // 发票信息
    'SMODR.ORDER.DETAIL.APPROVE.COLLAPSE',
  ],
})
@formatterCollections({
  code: ['smodr.orderDetail', 'smodr.common', 'smodr.orderLine', 'smodr.frightLine'],
})
@connect(({ orderLineManage }) => ({
  orderLineManage,
}))
@cuxRemote(
  {
    code: 'SMODR_ORDER_DETAIL_ORDER_APPROVE_REMOTE',
    name: 'remote',
  },
  {
    process: {},
  }
)
export default class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    const { orderId = '' } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      orderId,
    };
  }

  productDs = new DataSet(productDs());

  freightDs = new DataSet(freightDs());

  Ds = new DataSet(ds());

  attDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件'),
      },
    ],
  });

  outAttDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件'),
      },
    ],
  });

  componentDidMount() {
    const { orderId } = this.state;
    const { onFormLoaded } = this.props;
    if (orderId) {
      this.fetchOrderDetail();
      this.productDs.setQueryParameter('orderId', orderId);
      this.productDs.setQueryParameter('customizeUnitCode', 'SMODR.ORDER.DETAIL.ORDER.APPROVE.SKU, SMODR.ORDER.DETAIL.WORKFOLW.SKU.SEARCHBAR');
      this.freightDs.setQueryParameter('orderId', orderId);
      // this.productDs.query();
      this.freightDs.query();
    } else {
      if (onFormLoaded) {
        onFormLoaded(false);
      }
      notification.warning({ message: intl.get('smodr.orderDetail.model.orderNonexistent').d('订单不存在') });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { orderId } = qs.parse(nextProps.history.location.search.substr(1));
    const { orderId: oldorderId } = this.state;
    if (orderId && orderId !== oldorderId) {
      dispatch({
        type: 'orderLineManage/fetchWFPExtensionHeader',
        payload: { orderId, customizeUnitCode: 'SMODR.ORDER.DETAIL.NEW_WORKFLOW.BASEINFO' },
      }).then((res) => {
        const { receiverAddress = {}, acquiringInvoice = {} } = res;
        const data = {
          ...res,
          ...receiverAddress,
          ...acquiringInvoice,
          receiveFullAddress: receiverAddress?.fullAddress,
          receiveSpliceAddress: receiverAddress?.spliceAddress,
          acquirSpliceAddress: acquiringInvoice?.spliceAddress,
        };
        this.Ds.loadData([data]);
        this.attDs.loadData([{ attachment: res?.attachmentUuid }]);
        this.outAttDs.loadData([{ attachment: res?.outerAttachmentUuid }]);
      });
      this.setState(
        {
          orderId,
        },
        () => {
          this.productDs.setQueryParameter('orderId', this.state.orderId);
          this.freightDs.setQueryParameter('orderId', this.state.orderId);
          this.productDs.query();
          this.freightDs.query();
        }
      );
    }
  }

  @Bind()
  fetchOrderDetail() {
    const { dispatch, onFormLoaded, onLoad, remote } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'orderLineManage/fetchWFPExtensionHeader',
      payload: { orderId, customizeUnitCode: 'SMODR.ORDER.DETAIL.NEW_WORKFLOW.BASEINFO' },
    }).then((res) => {
      const { receiverAddress = {}, acquiringInvoice = {} } = res;
      const data = {
        ...res,
        ...receiverAddress, // 收货信息
        ...acquiringInvoice, // 收单信息
        receiveFullAddress: receiverAddress.fullAddress,
        receiveSpliceAddress: receiverAddress?.spliceAddress,
        acquirSpliceAddress: acquiringInvoice?.spliceAddress,
      };
      this.Ds.loadData([data]);
      this.attDs.loadData([{ attachment: res?.attachmentUuid }]);
      this.outAttDs.loadData([{ attachment: res?.outerAttachmentUuid }]);
      // 表单渲染完才允许操作审批
      if (onFormLoaded) {
        onFormLoaded(true);
      }
      
      if (onLoad && remote) {
        remote.event.fireEvent('onLoad', {remoteThis: this});
      }
    });
  }

  @Bind()
  async handlePrint(orderId = '') {
    const res = await handlePrint([orderId]);
    if (res) {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(file);
      const printWindow = window.open(fileUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  }

  @Bind()
  handleCustomValue(item) {
    const { componentType, cpValue, cpValueName, inputMethod } = item;
    let value = '';
    switch (componentType) {
      case 'IMAGE':
        if (inputMethod === 'MANUAL') {
          value = (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="mall-front"
              value={cpValue || cpValueName}
            />
          );
        } else {
          value = <img style={{ width: 80 }} src={cpValue || cpValueName} alt="" />;
        }
        break;
      case 'UPLOAD':
        value = (
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="mall-front"
            value={cpValue || cpValueName}
          />
        );
        break;
      case 'LOV':
        value = cpValueName;
        break;
      case 'SELECT':
        value = cpValueName;
        break;
      default:
        value = cpValue;
        break;
    }
    return value;
  }

  @Bind()
  handleCheckHeader(record) {
    const dimValueDTO = record.get('dimValueDTO');
    const newlist = (dimValueDTO?.headerCustomizedList || []).concat(
      dimValueDTO?.lineCustomizedList || []
    );
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
      children: <OtherForm list={newlist} />,
      style: { width: 380 },
    });
  }

  @Bind()
  handleCheckSku(value = []) {
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.view.customInfo').d('定制品信息'),
      children: (
        <div>
          {value?.map((i) => (
            <div>
              <div style={{ color: 'rgba(0,0,0,0.65)', marginBottom: '4px' }}>
                {i?.componentName}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>{this.handleCustomValue(i)}</div>
            </div>
          ))}
        </div>
      ),
      style: { width: 380 },
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.common.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  handleCheckInfo(record) {
    const dimValueDTO = record.get('dimValueDTO');
    const newlist = (dimValueDTO?.headerCustomizedList || []).concat(
      dimValueDTO?.lineCustomizedList || []
    );
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
      children: (
        <div>
          {newlist?.map((i) => (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: 'rgba(0,0,0,0.65)', marginBottom: '4px' }}>
                {i?.dimensionName}
              </div>
              <div style={{ fontWeight: 600 }}>{i?.valueName || i?.value || '-'}</div>
            </div>
          ))}
        </div>
      ),
      style: { width: 380 },
    });
  }

  render() {
    const { orderLineManage, customizeForm, customizeTable, customizeCollapse, customizeCommon } = this.props;
    const { extensionHeaderData = {} } = orderLineManage; // 订单头信息
    const { orderId } = this.state;
    const proColumns = [
      {
        name: 'primaryUrl',
        width: 80,
        renderer: ({ value }) => (
          <Image value={value} />
        ),
      },
      {
        name: 'skuCode',
        width: 150,
      },
      {
        name: 'skuName',
      },
      {
        name: 'neededDate',
        width: 140,
      },
      {
        name: 'productCompareDTO',
        renderer: ({ value }) => (
          <a
            onClick={() => openCompareModal(value)}
          >
            {value
              ? intl.get('smodr.orderDetail.model.check').d('查看')
              : '-'}
          </a>
        ),
      },
      {
        name: 'entryCode',
      },
      // {
      //   name: 'skuTypeMeaning',
      //   hidden: true,
      // },
      {
        name: 'productAttributeMeaning',
        hidden: true,
      },
      {
        name: 'catalogName',
        hidden: true,
      },
      {
        name: 'categoryName',
        hidden: true,
      },
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
      },
      // {
      //   name: 'parentSkuCode',
      //   hidden: true,
      //   width: 150,
      // },
      // {
      //   name: 'parentSkuName',
      //   hidden: true,
      //   width: 150,
      // },
      // {
      //   name: 'buyTypeMeaning',
      //   // width: ''
      // },
      {
        name: 'customSpecificationList',
        hidden: true,
        renderer: ({ value }) =>
          value?.length > 0 ? (
            <Button color="primary" funcType="link" onClick={() => this.handleCheckSku(value)}>
              {intl.get('smodr.orderDetail.model.check').d('查看')}
            </Button>
          ) : (
            <span>-</span>
          ),
      },
      {
        name: 'originalQuantityMeaning',
        align: 'right',
        width: 90,
      },
      {
        name: 'uom',
        width: 80,
      },
      {
        name: 'taxRateMeaning',
        align: 'right',
        width: 60,
      },
      {
        name: 'currencyName',
        // width: ''
      },
      // {
      //   name: 'containFreight',
      //   width: 150,
      //   renderer: ({ value }) => (
      //     <span>
      //       {value === '1'
      //         ? intl.get('smodr.orderDetail.model.yep').d('是')
      //         : intl.get('smodr.orderDetail.model.no').d('否')}
      //     </span>
      //   ),
      // },
      // {
      //   name: 'eachFreight',
      //   align: 'right',
      //   width: 150,
      // },
      {
        name: 'proxyUnitPriceMeaning',
        align: 'right',
        width: 110,
        renderer: ({ value, record }) => (
          <span>
            {record?.get('agreementType') !== 'SALE' ? record?.get('unitPriceMeaning') : value}
          </span>
        ),
      },
      {
        name: 'unitNakedPriceMeaning',
        align: 'right',
        width: 110,
        hidden: true,
        renderer: ({ value, record }) => (
          <span>
            {record?.get('agreementType') !== 'SALE'
              ? value
              : record.get('proxyUnitNakedPriceMeaning')}
          </span>
        ),
      },
      {
        name: 'per',
        width: 100,
      },
      {
        name: 'proxyEntryAmountMeaning',
        align: 'right',
        width: 110,
        renderer: ({ value, record }) => (
          <span>
            {record?.get('agreementType') !== 'SALE' ? record?.get('entryAmountMeaning') : value}
          </span>
        ),
      },
      {
        name: 'nakedPriceMeaning',
        align: 'right',
        width: 110,
        hidden: true,
        renderer: ({ value, record }) => (
          <span>
            {record?.get('agreementType') !== 'SALE' ? value : record.get('proxyNakedPriceMeaning')}
          </span>
        ),
      },
      // {
      //   name: 'otherInfo',
      //   renderer: ({ record }) => {
      //     if (record.get('dimValueDTO')) {
      //       return (
      //         <Button color="primary" funcType="link" onClick={() => this.handleCheckInfo(record)}>
      //           {intl.get('smodr.orderDetail.model.check').d('查看')}
      //         </Button>
      //       );
      //     } else {
      //       return <span>-</span>;
      //     }
      //   },
      // },
      {
        name: 'remark',
      },
    ];
    const freColumns = [
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      // {
      //   name: 'entryCode',
      // },
      // {
      //   name: 'orderTypeMeaning',
      //   // width: ''
      // },
      // {
      //   name: 'freightTypeMeaning',
      //   // width: ''
      // },
      {
        name: 'extraCostTypeMeaning',
        width: 150,
      },
      {
        name: 'originalQuantityMeaning',
        align: 'right',
        // width: ''
      },
      {
        name: 'taxRateMeaning',
        align: 'right',
        // width: ''
      },
      {
        name: 'currencyName',
        // width: ''
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
        // width: ''
      },
      {
        name: 'entryAmountMeaning',
        align: 'right',
        width: 150,
      },
      {
        name: 'nakedPriceMeaning',
        align: 'right',
        width: 150,
      },
    ];
    const currentOffsetTop = null;
    const currentAnchorContainer = () =>
      document.querySelector('.page-content-wrap') || document.body;
    const currentArr = () => {
      return '#BASE_INFO';
    };
    const {
      proxyOrderAmountMeaning,
      // agreementBusinessType,
      orderTypeCode,
      currencyCode,
      orderAmountMeaning,
      agreementType,
    } = extensionHeaderData;
    // const isReceive = agreementBusinessType === 'RECEIVE';
    const isEc = orderTypeCode === 'EC';
    return (
      <React.Fragment>
        <div className={styles['order-detail-content']}>
          {
            customizeCommon(
              {
                code: 'SMODR.ORDER.DETAIL.NEW_WORKFLOW.BASEINFO',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={this.Ds}
                titleField="orderCode"
                tagFields={['orderTypeMeaning']}
                normalFields={['buyerName', 'creationDate']}
                contentRemainWidth="25%"
                contentRemainRender={() => (
                  <div className='header-right'>
                    <div className='label'>{intl.get('smodr.orderDetail.model.orderMoneyTax').d('订单金额(含税)')}</div>
                    <div className='amount'>
                      {agreementType !== 'SALE' ? orderAmountMeaning : (proxyOrderAmountMeaning || '-')}
                      <span style={{ marginLeft: 4 }}>{currencyCode}</span>
                    </div>
                  </div>
                )}
                contentBottomRender={() => (
                  <Button icon="print" onClick={() => this.handlePrint(orderId)} funcType="flat">
                    {intl.get('smodr.orderLine.view.print').d('打印')}
                  </Button>
                )}
              />
            )
          }
          {
            customizeCommon({
              code: 'SMODR.ORDER.DETAIL.NEW_WORKFOW.EXTRA.BASE_INFO',
              processUnitTag: "AF-EXTRA",
            },
              <AFExtra
                dataSet={this.Ds}
                fields={['purchaseCompanyName', 'showSupplierCompanyName', 'unitGroup', 'remark']}
                fieldsConfig={{
                  unitGroup: {
                    aggregation: true,
                    aggregationFields: ['ouName', 'purOrganizationName', 'unitName'],
                  },
                  // ouName: {
                  //   hidden: !isReceive,
                  // },
                  // purOrganizationName: {
                  //   hidden: !isReceive,
                  // },
                }}
              />
            )
          }
          {
            customizeCollapse({
              code: 'SMODR.ORDER.DETAIL.APPROVE.COLLAPSE',
              // activeKey和个性化的默认展开逻辑是冲突的
              // custDefaultActive: (keys) => {
              // },
            },
              (
                <Collapse bordered={false} expandIconPosition="text-right" defaultActiveKey={['baseInfo', 'receiveInfo', 'invoiceInfo', 'prodInfo', 'freInfo', 'innerAccInfo']}>
                  <Panel header={<span className="order-detail-title">{intl.get('smodr.orderDetail.view.reveiverOrAcquirerInfo').d('收货/收单信息')}</span>} id="RECEIVE_INFO" key="receiveInfo">
                    {
                      customizeForm(
                        { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.PERSONAL_INFO' },
                        (
                          <Form
                            dataSet={this.Ds}
                            className="c7n-pro-vertical-form-display"
                            labelLayout="vertical"
                            columns={3}
                            useWidthPercent
                          >
                            {/* 收货信息 */}
                            <Output name="contactName" />
                            <Output name="fullPhone" />
                            <Output name="receiveFullAddress" />
                            {/* 收单信息 */}
                            {isEc && <Output name="invoiceContactName" />}
                            {isEc && <Output name="invoiceTelNum" />}
                            {isEc && <Output name="fullAddress" />}
                          </Form>
                        )
                      )
                    }
                  </Panel>
                  {
                    isEc && (
                      <Panel header={<span className="order-detail-title">{intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}</span>} id="INVOICE_INFO" key="invoiceInfo">
                        {
                          customizeForm(
                            { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.INVOICE_INFO' },
                            (
                              <Form
                                dataSet={this.Ds}
                                className="c7n-pro-vertical-form-display"
                                labelLayout="vertical"
                                columns={3}
                                useWidthPercent
                                style={{ marginBottom: '4px' }}
                              >
                                <Output name="invoiceTypeName" />
                                <Output name="invoiceStateName" />
                                <Output name="invoiceTitle" />
                                <Output name="invoiceContentName" />
                                <Output name="taxRegisterNum" />
                                <Output name="depositBank" />
                                <Output name="bankAccount" />
                                <Output name="registeredAddress" />
                                <Output name="registeredPhone" />
                              </Form>
                            )
                          )}
                      </Panel>
                    )
                  }
                  <Panel header={<span className="order-detail-title">{intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}</span>} id="PRO_INFO" key="prodInfo">
                    {customizeTable(
                      { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.SKU' },
                      <SearchBarTable
                        searchCode='SMODR.ORDER.DETAIL.WORKFOLW.SKU.SEARCHBAR'
                        rowHeight={32}
                        dataSet={this.productDs}
                        columns={proColumns}
                        customizedCode="SMODR.OMS.ORDER_DETAIl.PRODUCT"
                        searchBarConfig={{
                          closeFilterSelector: true,
                          expandable: false,
                          // autoQuery: false,
                        }}
                      />
                    )}
                  </Panel>
                  <Panel header={<span className="order-detail-title">{intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}</span>} id="FRE_INFO" key="freInfo">
                    {customizeTable(
                      { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.FREIGHT' },
                      <Table
                        dataSet={this.freightDs}
                        columns={freColumns}
                        customizedCode="SMODR.OMS.ORDER_DETAIl.FREIGHT"
                      />
                    )}
                  </Panel>
                  <Panel header={<span className="order-detail-title">{intl.get('smodr.orderDetail.model.accessory').d('附件')}</span>} id="ACC_INFO" key="innerAccInfo">
                    <div style={{ display: 'flex' }}>
                      <div style={{ width: '50%', paddingRight: 20 }}>
                        <div className="sub-title">
                          {intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}
                        </div>
                        <Attachment
                          dataSet={this.attDs}
                          showHistory
                          readOnly
                          labelLayout="float"
                          name="attachment"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </div>
                      <div style={{ paddingLeft: 31, borderLeft: '1px dashed rgba(0,0,0,0.16)', width: '50%' }}>
                        <div className="sub-title" id="ACC_INF_OUT">
                          {intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}
                        </div>
                        <Attachment
                          readOnly
                          showHistory
                          dataSet={this.outAttDs}
                          labelLayout="float"
                          name="attachment"
                          bucketName={PRIVATE_BUCKET}
                        />
                      </div>
                    </div>
                  </Panel>
                </Collapse>
              )
            )
          }
        </div>
        <PositionAnchor
          offsetTop={currentOffsetTop || 150}
          getContainer={currentAnchorContainer}
          getCurrentAnchor={currentArr}
        >
          <Link href="#BASE_INFO" title={intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')} />
          <Link
            href="#RECEIVE_INFO"
            title={intl.get('smodr.orderDetail.view.reveiverOrAcquirerInfo').d('收货/收单信息')}
          />
          {isEc && (
            <Link
              href="#INVOICE_INFO"
              title={intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}
            />
          )}
          <Link
            href="#PRO_INFO"
            title={intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
          />
          <Link
            href="#FRE_INFO"
            title={intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}
          />
          {(extensionHeaderData?.attachmentUuid || extensionHeaderData?.outerAttachmentUuid) && (
            <Link
              href={extensionHeaderData?.attachmentUuid ? '#ACC_INFO' : '#ACC_INF_OUT'}
              title={intl.get('smodr.orderDetail.model.accessory').d('附件')}
            />
          )}
        </PositionAnchor>
      </React.Fragment>
    );
  }
}
