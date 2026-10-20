import React from 'react';
import { Bind } from 'lodash-decorators';
import qs from 'qs';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { DataSet, Table, Attachment, Button, Form, Output } from 'choerodon-ui/pro';
import { Tabs, Tag, Collapse } from 'choerodon-ui';
import classNames from 'classnames';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import DynamicButtons from '_components/DynamicButtons';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import { AFBasic, AFExtra } from "_components/AFCards";
import cuxRemote from 'hzero-front/lib/utils/remote';

import c7nModal from '@/utils/c7nModal';
import Image from '@/components/Image';
import openCompareModal from '@/routes/components/CompareModal';
import OverflowTip from '@/components/OverflowTip';

import { productDs, freightDs, ds, orderDs, orderBaseInfoDS } from './ds';
// eslint-disable-next-line import/no-duplicates
import styles from './index.less';
// eslint-disable-next-line import/no-duplicates
import './index.less';
import OtherForm from './otherForm';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

@formatterCollections({
  code: ['smodr.orderDetail', 'smodr.common', 'smodr.orderLine', 'smodr.frightLine', 'smodr.apply'],
})
@withCustomize({
  unitCode: [
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.PERSONAL_INFO',
    'SMODR.ORDER.DETAIL.ORDER.APPROVE.INVOICE_INFO',
    'SMODR.ORDER.DETAIL.NEW.WORKFLOW.BATCH.BASE_INFO',
    'SMODR.ORDER.DETAIL.BATCH.EXTRA_INFO',
    'SMODR.ORDER.DETAIL.BATCH.APPROVE.SKU',
    'SMODR.ORDER.DETAIL.BATCH.APPROVE.FREIGHT',
    'SMODR.ORDER.DETAIL.BATCH.BTNS',
    'SMODR.ORDER.DETAIL.FLOW_APPROVE.BATCH.COLLAPSE',
  ],
})
@cuxRemote(
  {
    code: 'SMODR_ORDER_DETAIL_BATCH_APPROVE_REMOTE',
    name: 'remote',
  },
  {
    process: {},
  }
)
export default class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    const { batchNum = '' } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      batchNum,
      baseInfo: {},
      orders: [], // 批次下所有订单
      currentOrderId: '',
      activePaneKeys: ['receiveInfo', 'invoiceInfo', 'prodInfo', 'freInfo', 'innerAccInfo', 'outerAccInfo'],
    };
  }

  orderDs = new DataSet(orderDs());

  extraOrderDs = new DataSet(orderDs())

  productDs = new DataSet(productDs());

  freightDs = new DataSet(freightDs());

  ds = new DataSet(ds());

  attDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件'),
      },
    ],
  });

  outAttDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件'),
      },
    ],
  });

  orderBaseInfoDs = new DataSet(orderBaseInfoDS());

  async componentDidMount() {
    const { batchNum } = this.state;
    const { onFormLoaded, onLoad, remote } = this.props;
    this.ds.setQueryParameter('batchNum', batchNum);
    this.orderDs.setQueryParameter('batchNum', batchNum);
    const res = await this.ds.query();
    if (getResponse(res)) {
      this.setState({ baseInfo: res });
    }
    const orderRes = await this.orderDs.query();
    if (getResponse(orderRes)) {
      this.setState({ orders: orderRes.content }, () => {
        const { orders } = this.state;
        if (orders.length > 0) {
          this.loadOrderData(orders[0].orderId, orders[0]);
        }
      });
    }
    if (onFormLoaded && this.ds.current) {
      onFormLoaded(true);
    }
    if (onLoad && remote) {
      remote.event.fireEvent('onLoad', {remoteThis: this, code: 'S2FUL.BATCH_INTERNAL_APPROVE:SMODR.ORDER.BATCH.APPROVE'});
    }
  }

  componentWillReceiveProps(nextProps) {
    const { batchNum } = qs.parse(nextProps.history.location.search.substr(1));
    const { batchNum: oldBatchNum } = this.state;
    if (batchNum && batchNum !== oldBatchNum) {
      this.setState(
        {
          batchNum,
        },
        async () => {
          this.ds.setQueryParameter('batchNum', batchNum);
          const res = await this.ds.query();
          if (getResponse(res)) {
            this.setState({ baseInfo: res });
          }
          const orderRes = await this.orderDs.query();
          if (getResponse(orderRes)) {
            this.setState({ orders: orderRes.content }, () => {
              const { orders } = this.state;
              if (orders.length > 0) {
                this.loadOrderData(orders[0].orderId, orders[0]);
              }
            });
          }
        }
      );
    }
  }

  loadOrderData = async (orderId, orderInfo) => {
    this.setState({ currentOrderId: orderId });
    this.productDs.setQueryParameter('orderId', orderId);
    this.freightDs.setQueryParameter('orderId', orderId);
    if (orderInfo) {
      this.extraOrderDs.loadData([orderInfo]); // 默认加载第一个订单信息
      this.attDs.loadData([{ attachment: orderInfo?.attachmentUuid }]);
      this.outAttDs.loadData([{ attachment: orderInfo?.outerAttachmentUuid }]);
    }
    this.orderBaseInfoDs.setQueryParameter('orderId', orderId);
    await this.productDs.query();
    // 收货收单、发票等信息
    const detail = await this.orderBaseInfoDs.query();
    if (getResponse(detail)) {
      const { receiverAddress = {}, acquiringInvoice = {}, ouName, purOrganizationName } = detail;
      const data = {
        ...detail,
        ...receiverAddress,
        ...acquiringInvoice,
        receiveFullAddress: receiverAddress?.fullAddress,
      };
      this.orderBaseInfoDs.loadData([data]);
      // 头部 业务实体、采购组织改为从inner-detail接口上取
      this.extraOrderDs.current.set({ ouName, purOrganizationName });
    }
    await this.freightDs.query();
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

  handleTabChange = (key) => {
    const { orders } = this.state;
    if (key) {
      const order = orders.find(o => o.orderId === key);
      this.loadOrderData(key, order);
    }
  };

  handlePaneChange = (activeKeys) => {
    const { activePaneKeys } = this.state;
    const keys = ['innerAccInfo', 'outerAccInfo'];
    const filterKeys = activeKeys.filter(k => !keys.includes(k));
    const attachmentKeys = activeKeys.filter(k => keys.includes(k));
    const preAttachmentKeys = activePaneKeys.filter(k => keys.includes(k));
    // 收起附件
    if (preAttachmentKeys.length > attachmentKeys.length) {
      this.setState({ activePaneKeys: filterKeys });
    }
    else {
      this.setState({ activePaneKeys: filterKeys.concat(keys) });
    }
  };

  render() {
    const { customizeTable, customizeBtnGroup, customizeCommon, customizeCollapse, customizeForm, onFormLoaded } = this.props;
    const { baseInfo, orders, currentOrderId, activePaneKeys } = this.state;
    const { batchAmountMeaning, currencyCode } = baseInfo;
    // const _order = orders.find(o => o.orderId === currentOrderId) || {};
    // const isReceive = _order.agreementBusinessType === 'RECEIVE';
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
        renderer: ({ value }) => value ? (
          <a
            onClick={() => openCompareModal(value)}
          >
            {intl.get('smodr.orderDetail.model.check').d('查看')}
          </a>
        ) : '-',
      },
      {
        name: 'entryCode',
      },
      {
        name: 'productAttributeMeaning',
      },
      {
        name: 'itemCode',
      },
      {
        name: 'itemName',
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
      {
        name: 'containFreight',
        width: 150,
        renderer: ({ value }) => (
          <span>
            {value === '1'
              ? intl.get('smodr.orderDetail.model.yep').d('是')
              : intl.get('smodr.orderDetail.model.no').d('否')}
          </span>
        ),
      },
      {
        name: 'eachFreight',
        align: 'right',
        width: 150,
      },
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
        renderer: ({ value, record }) => (
          <span>
            {record?.get('agreementType') !== 'SALE'
              ? value
              : record.get('proxyNakedPriceMeaning') || '-'}
          </span>
        ),
      },
      {
        name: 'remark',
      },
    ];
    const freColumns = [
      {
        name: 'groupOrderCode',
        width: 200,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'entryCode',
      },
      {
        name: 'extraCostTypeMeaning',
        width: 150,
      },
      {
        name: 'originalQuantityMeaning',
        align: 'right',
      },
      {
        name: 'taxRateMeaning',
        align: 'right',
      },
      {
        name: 'currencyName',
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
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

    const renderColor = (code) => {
      if (
        [
          'CANCELLING',
          'PREEMPTING',
          'APPROVING',
          'DELIVERYING',
          'PROPER_VATE_ING',
          'RECEIVING',
          'STATEMENTING',
          'INVOICETING',
        ].includes(code)
      ) {
        return 'yellow';
      } else if (code === 'APPROVE_REJECT') {
        return 'red';
      } else if (code === 'CANCELED') {
        return 'gray';
      } else {
        return 'green';
      }
    };

    return (
      <React.Fragment>
        {/* 兼容老租户使用只读工作流表单时， tab content 区域未展开 */}
        <div className={classNames(styles['new-order-detail-content'], { [styles['old-work-flow']]: !onFormLoaded })}>
          {
            customizeCommon(
              {
                code: 'SMODR.ORDER.DETAIL.NEW.WORKFLOW.BATCH.BASE_INFO',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={this.ds}
                titleField="batchNum"
                normalFields={['buyerName', 'cecCreatedTime']}
                contentRemainWidth="25%"
                contentRemainRender={() => (
                  <div className='header-right'>
                    <div className='label'>{intl.get('smodr.orderLine.model.batchAmount').d('批次总额')}</div>
                    <div className='amount'>
                      {batchAmountMeaning || '-'}
                      <span style={{ marginLeft: 4 }}>{currencyCode}</span>
                    </div>
                  </div>
                )}
                contentBottomRender={() => (
                  <>
                    {
                      customizeBtnGroup({
                        code: 'SMODR.ORDER.DETAIL.BATCH.BTNS',
                        pro: true,
                      },
                        <DynamicButtons buttons={[]} />)
                    }
                  </>
                )}
              />
            )
          }
          <Content style={{ margin: '8px 0 0 0', padding: '20px 20px 0 20px' }}>
            <div className="order-info-title">{intl.get('smodr.orderLine.view.orderInfo').d('订单信息')}</div>
            <div>
              <Tabs tabPosition='left' onChange={this.handleTabChange}>
                {
                  orders.map(order => {
                    const { orderCode, showOrderStatus, showOrderStatusMeaning, orderId, orderAmountMeaning, proxyOrderAmountMeaning, orderTypeMeaning, orderTypeCode, agreementType } = order || {};
                    const isEc = orderTypeCode === 'EC';
                    return (
                      <TabPane
                        tab={() => (
                          <div className='tab-item'>
                            <div className={classNames('title', { 'title-active': orderId === currentOrderId })}>{orderCode}&nbsp;&nbsp;</div>
                            <div className='sub-title'>
                              <span className='tab-item-label'><Tag border={false} color={renderColor(showOrderStatus)}>{showOrderStatusMeaning}</Tag></span>
                              <span className='divider'>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                              <span className='tab-item-label'>{orderTypeMeaning}</span>
                              <span className='divider'>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
                              <OverflowTip
                                alwaysHow
                                title={
                                  `${intl.get('smodr.apply.model.allAmount').d('总金额(含税)')}:
                                  ${agreementType !== 'SALE' ? orderAmountMeaning : (proxyOrderAmountMeaning || '-')}  
                                  ${currencyCode}`
                                }
                                style={{ maxWidth: 70, display: 'inline-block' }}
                              >
                                {agreementType !== 'SALE' ? orderAmountMeaning : (proxyOrderAmountMeaning || '-')}
                                <span style={{ marginLeft: 4 }}>{currencyCode}</span>
                              </OverflowTip>
                            </div>
                          </div>
                        )}
                        key={orderId}
                      >
                        {
                          customizeCommon({
                            code: 'SMODR.ORDER.DETAIL.BATCH.EXTRA_INFO',
                            processUnitTag: "AF-EXTRA",
                          },
                            <AFExtra
                              dataSet={this.extraOrderDs}
                              fields={['purchaseCompanyName', 'showSupplierCompanyName', 'unitGroup', 'remark']}
                              fieldsConfig={{
                                unitGroup: {
                                  aggregation: true,
                                  aggregationFields: ['ouName', 'purOrganizationName', 'unitName'],
                                },
                                remark: {
                                  renderValue({ value }) {
                                    return value || '-';
                                  },
                                },
                              }}
                            />
                          )
                        }
                        {
                          customizeCollapse({
                            code: 'SMODR.ORDER.DETAIL.FLOW_APPROVE.BATCH.COLLAPSE',
                          }, (
                            <Collapse
                              bordered={false}
                              expandIconPosition="text-right"
                              activeKey={activePaneKeys}
                              onChange={this.handlePaneChange}
                            // defaultActiveKey={activePaneKey}
                            >
                              <Panel header={<span className="order-product-info">{intl.get('smodr.orderDetail.view.reveiverOrAcquirerInfo').d('收货/收单信息')}</span>} key="receiveInfo">
                                {
                                  customizeForm(
                                    { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.PERSONAL_INFO' },
                                    (
                                      <Form
                                        dataSet={this.orderBaseInfoDs}
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
                              </Panel>,
                              {
                                isEc && (
                                  <Panel header={<span className="order-product-info">{intl.get('smodr.orderDetail.model.invoiceInfo').d('发票信息')}</span>} key="invoiceInfo">
                                    {
                                      customizeForm(
                                        { code: 'SMODR.ORDER.DETAIL.ORDER.APPROVE.INVOICE_INFO' },
                                        (
                                          <Form
                                            dataSet={this.orderBaseInfoDs}
                                            className="c7n-pro-vertical-form-display"
                                            labelLayout="vertical"
                                            columns={3}
                                            useWidthPercent
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
                                      )
                                    }
                                  </Panel>
                                )
                              }
                              <Panel header={<span className="order-product-info">{intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}</span>} key="prodInfo">
                                {customizeTable(
                                  { code: 'SMODR.ORDER.DETAIL.BATCH.APPROVE.SKU' },
                                  <SearchBarTable
                                    rowHeight={32}
                                    dataSet={this.productDs}
                                    searchCode='SMODR.ORDER.DETAIL.NE_WORKFLOW.SKU.SEARCHBAR'
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
                              <Panel header={<span className="order-product-info">{intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}</span>} key="freInfo">
                                {customizeTable(
                                  { code: 'SMODR.ORDER.DETAIL.BATCH.APPROVE.FREIGHT' },
                                  <Table
                                    dataSet={this.freightDs}
                                    columns={freColumns}
                                    customizedCode="SMODR.OMS.ORDER_DETAIl.FREIGHT"
                                  />
                                )}
                              </Panel>
                              <Panel className='attachment-pane inner' header={<span className="order-product-info">{intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件')}</span>} key="innerAccInfo">
                                <Attachment
                                  dataSet={this.attDs}
                                  showHistory
                                  readOnly
                                  labelLayout="float"
                                  name="attachment"
                                  bucketName={PRIVATE_BUCKET}
                                />
                              </Panel>
                              <Panel
                                className='attachment-pane outer'
                                header={<span className="order-product-info">{intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件')}</span>}
                                key="outerAccInfo"
                              >
                                <Attachment
                                  readOnly
                                  showHistory
                                  dataSet={this.outAttDs}
                                  labelLayout="float"
                                  name="attachment"
                                  bucketName={PRIVATE_BUCKET}
                                />
                              </Panel>
                            </Collapse>
                          ))
                        }
                      </TabPane>
                    );
                  })
                }
              </Tabs>
            </div>
          </Content>
        </div>
      </React.Fragment>
    );
  }
}
