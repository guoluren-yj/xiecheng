import React from 'react';
// import { Bind } from 'lodash-decorators';
import { Spin, DataSet, TextField, Form, Attachment } from 'choerodon-ui/pro';

import SearchBarTable from '_components/SearchBarTable';

import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
// import RenderForm from '@/routes/components/RenderForm';
import withProps from 'utils/withProps';
import TextFieldPro from '@/routes/components/TextFieldPro';
// import { fetchDetailInfo } from '@/services/oms/dealRecordService';
import HeadLine from '@/routes/components/HeadLine';

import { wholeDs, initDs } from './ds';

// const { TabGroup, TabPane } = Tabs;
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

@withProps(
  () => ({
    initDs: new DataSet(initDs()),
    wholeDs: new DataSet(wholeDs()),
  }),
  {
    cacheState: true,
    keepOriginDataSet: true,
  }
)
export default class DetailModal extends React.Component {
  constructor(props) {
    super(props);
    const { orderIds, baseData } = this.props;
    // props.onRef(this);
    this.state = {
      loading: false,
      detailInfo: baseData,
      orderIds,
      // key: 'WHOLEALL',
    };
  }

  baseDS = new DataSet();

  componentDidMount() {
    const { orderIds } = this.state;
    const {baseData}=this.props;
    this.baseDS.loadData([baseData]);
    // this.fetchData(orderIds);
    // this.props.initDs.setQueryParameter('queryParam', { paymentId });
    this.props.wholeDs.setQueryParameter('queryParam', { orderIds });
    // this.props.initDs.query();
    this.props.wholeDs.query();
  }

  componentWillReceiveProps(nextProps, prveState) {
    const newpaymentId = nextProps.record?.get('paymentId');
    const newoperationType = nextProps.record?.get('operationType') || nextProps?.operationType;
    const { paymentId, operationType } = prveState;
    if (paymentId !== newpaymentId || operationType !== newoperationType) {
      this.fetchData(newpaymentId, newoperationType);
      // this.props.initDs.setQueryParameter('queryParam', { paymentId: newpaymentId });
      this.props.wholeDs.setQueryParameter('queryParam', { paymentId: newpaymentId });
      // this.props.initDs.query();
      this.props.wholeDs.query();
    }
  }

  // @Bind()
  // async fetchData(orderIds) {
  //   this.setState({ loading: true });
  //   const res = await fetchDetailInfo({ orderIds });
  //   this.setState({ loading: false });
  //   const result = getResponse(res);
  //   if (result) {
  //     this.setState({ detailInfo: result });
  //     this.baseDS.loadData([result]);
  //   }
  // }

  

  // @Bind()
  // handleTabChange(key) {
  //   switch (key) {
  //     case 'WHOLEALL':
  //       this.props.wholeDs.query();
  //       break;
  //     case 'DETAILALL':
  //       this.props.initDs.query();
  //       break;
  //     default:
  //       break;
  //   }
  //   this.setState({ key });
  // }

  render() {
    const { detailInfo = {}, loading } = this.state;
    const { customizeForm } = this.props;
    const renderFields = () =>
      [
        {
          name: 'code',
          type: 'string',
          label: intl.get('smodr.deal.model.payDealCode').d('商城交易编码'),
          renderer: () => <span>-</span>,
        },
        {
          name: 'cecCode',
          type: 'string',
          label: intl.get('smodr.deal.model.orderStatusMeaning').d('支付平台单号'),
          renderer: () => <span>-</span>,
        },
        {
          name: 'cecSerialNumber',
          type: 'string',
          label: intl.get('smodr.deal.model.payConfigName').d('支付渠道交易流水号'),
          renderer: () => <span>-</span>,
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
          renderer: () => <span>-</span>,
        },
        {
          name: 'currencyName',
          type: 'string',
          label: intl.get('smodr.deal.model.currency').d('币种'),
        },
        {
          name: 'paymentAmountMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.dealAmount').d('交易金额'),
        },
        {
          name: 'paymentStatusMeaning',
          type: 'string',
          label: intl.get('smodr.deal.model.paymnetStatus').d('支付状态'),
          filter: detailInfo?.operationType === 'PAYMENT',
          // renderer: ({ text }) => (
          //   <div
          //     style={{
          //       padding: '2px 4px',
          //       display: 'inline',
          //       borderRadius: '2px',
          //       color: '#47B881',
          //       backgroundColor: 'rgba(71,184,129,0.10)',
          //       fontWeight: 600,
          //     }}
          //   >
          //     {text}
          //   </div>
          // ),
        },
        // {
        //   name: 'statusMeaning',
        //   type: 'string',
        //   label: intl.get('smodr.deal.model.refundStatus').d('退款状态'),
        //   filter: detailInfo?.operationType !== 'PAYMENT',
        //   renderer: ({ text }) => (
        //     <div
        //       style={{
        //         padding: '2px 4px',
        //         display: 'inline',
        //         borderRadius: '2px',
        //         color: '#F88D10',
        //         backgroundColor: 'rgba(252,160,0,0.10)',
        //         fontWeight: 600,
        //       }}
        //     >
        //       {text}
        //     </div>
        //   ),
        // },
        // {
        //   name: 'typeCodeMeaning',
        //   type: 'string',
        //   label: intl.get('smodr.deal.model.refundType').d('退款类型'),
        //   filter: detailInfo?.operationType !== 'PAYMENT',
        // },
        {
          name: 'operationTime',
          label: intl.get('smodr.deal.model.dealTime').d('交易时间'),
          renderer: () => <span>-</span>,
        },
        {
          name: 'purchaseCompanyName',
          type: 'string',
          label: intl.get('smodr.deal.model.payer').d('付款方'),
        },
        {
          name: 'supplierCompanyName',
          type: 'string',
          label: intl.get('smodr.deal.model.payee').d('收款方'),
        },
      ].filter((i) => i.filter !== false);
    const columns = [
      {
        name: 'paymentStatusMeaning',
        renderer: this.props.getPayTag,
      },
      { name: 'orderCode', width: 200 },
      { name: 'cecOrderCode', width: 200 },
      { name: 'orderAmount', align: 'right', width: 120 },
      {
        name: 'orderStatusMeaning',
        renderer: this.props.getTag,
      },
      { name: 'paymentAmountMeaning', align: 'right', width: 120 },
      { name: 'buyerName' },
      { name: 'purchaseCompanyName' },
      { name: 'supplierCompanyName' },
    ];
    // const parentList = [
    //   {
    //     node: intl.get('smodr.orderLine.view.wholeTab').d('整单'),
    //     key: 'whole',
    //   },
    //   {
    //     node: intl.get('smodr.orderLine.view.detailTab').d('明细'),
    //     key: 'detail',
    //   },
    // ];
    // const sonList = [
    //   {
    //     node: intl.get('smodr.orderLine.view.all').d('全部'),
    //     key: 'WHOLEALL',
    //     parentKey: 'whole',
    //     num: () => this.props.wholeDs?.totalCount,
    //     render: () => {
    //       const columns = [
    //         {
    //           name: 'paymentStatusMeaning',
    //           renderer: this.props.getPayTag,
    //         },
    //         { name: 'orderCode', width: 200 },
    //         { name: 'cecOrderCode', width: 200 },
    //         { name: 'orderAmount', align: 'right', width: 120 },
    //         {
    //           name: 'orderStatusMeaning',
    //           renderer: this.props.getTag,
    //         },
    //         { name: 'paymentAmountMeaning', align: 'right', width: 120 },
    //         { name: 'buyerName' },
    //         { name: 'purchaseCompanyName' },
    //         { name: 'supplierCompanyName' },
    //       ];
    //       return (
    //         <SearchBarTable
    //           style={{ maxHeight: `calc(100vh - 400px)` }}
    //           dataSet={this.props.wholeDs}
    //           columns={columns}
    //           searchCode="SMODR.PAYMENT.REVIEW.QUERY"
    //           customizedCode="SMODR.PAYMENT.REFUND.WAIT.WHOLE"
    //           searchBarConfig={{
    //             left: {
    //               render: () => {
    //                 return (
    //                   <TextFieldPro
    //                     ds={this.props.wholeDs}
    //                     name="orderCode"
    //                     placeholder={intl.get('smodr.deal.model.orderCode').d('商城订单编码')}
    //                     onRef={(ref) => {
    //                       this.queryRefs = ref;
    //                     }}
    //                   />
    //                 );
    //               },
    //             },
    //             onReset: () => {
    //               if (this.queryRefs) this.queryRefs.handleClear();
    //             },
    //             onClear: () => {
    //               if (this.queryRefs) this.queryRefs.handleClear();
    //             },
    //           }}
    //         />
    //       );
    //     },
    //   },
    //   {
    //     node: intl.get('smodr.orderLine.view.all').d('全部'),
    //     key: 'DETAILALL',
    //     parentKey: 'detail',
    //     num: () => this.props.initDs?.totalCount,
    //     render: () => {
    //       const columns = [
    //         {
    //           name: 'cancelStatusMeaning',
    //           renderer: this.props.getCancelTag,
    //         },
    //         { name: 'orderCodeLine' },
    //         { name: 'skuCode' },
    //         { name: 'skuName' },
    //         { name: 'skuTypeMeaning' },
    //         { name: 'quantityMeaning' },
    //         { name: 'unitPriceMeaning' },
    //         { name: 'amountMeaning' },
    //       ];
    //       return (
    //         <SearchBarTable
    //           style={{ maxHeight: `calc(100vh - 400px)` }}
    //           dataSet={this.props.initDs}
    //           columns={columns}
    //           customizedCode="SMODR.PAYMENT.REFUND.WAIT.INIT"
    //           searchBarConfig={{
    //             left: {
    //               render: () => {
    //                 return (
    //                   <TextFieldPro
    //                     ds={this.props.initDs}
    //                     name="orderCode"
    //                     placeholder={intl.get('smodr.deal.model.orderCode').d('商城订单编码')}
    //                     onRef={(ref) => {
    //                       this.queryRef = ref;
    //                     }}
    //                   />
    //                 );
    //               },
    //             },
    //             onReset: () => {
    //               if (this.queryRef) this.queryRef.handleClear();
    //             },
    //             onClear: () => {
    //               if (this.queryRef) this.queryRef.handleClear();
    //             },
    //           }}
    //         />
    //       );
    //     },
    //   },
    // ];

    return (
      <Spin spinning={loading}>
        <HeadLine title={intl.get('smodr.deal.view.detail.baseInfo').d('基本信息')} />
        {customizeForm(
          { code: 'SMODR.PAYMENT.MERGE.VIEW' },
          <Form
            columns={3}
            dataSet={this.baseDS}
            labelLayout="float"
            style={{
              width: '100%',
            }}
          >
            {renderFields()?.map((m) => {
              return <TextField disabled {...m} />;
            })}
          </Form>
        )}
        <HeadLine
          style={{ marginTop: '32px' }}
          title={intl.get('smodr.deal.view.detail.orderInfo').d('订单信息')}
        />
        {/* <Tabs defaultActiveKey="WHOLEALL" onChange={(k) => this.handleTabChange(k)} activeKey={key}>
          {parentList.map((m) => {
            const son = sonList.filter((f) => f.parentKey === m.key);
            return (
              <TabGroup tab={m.node} key={m.key}>
                {son.map((i) => {
                  return (
                    <TabPane key={i.key} tab={i.node} count={i.num}>
                      {i.render()}
                    </TabPane>
                  );
                })}
              </TabGroup>
            );
          })}
        </Tabs> */}
        <SearchBarTable
          dataSet={this.props.wholeDs}
          columns={columns}
          searchCode="SMODR.PAYMENT.REVIEW.QUERY"
          customizedCode="SMODR.PAYMENT.REFUND.WAIT.WHOLE"
          searchBarConfig={{
            left: {
              render: () => {
                return (
                  <TextFieldPro
                    ds={this.props.wholeDs}
                    name="orderCode"
                    placeholder={intl.get('smodr.deal.model.orderCode').d('商城订单编码')}
                    onRef={(ref) => {
                      this.queryRefs = ref;
                    }}
                  />
                );
              },
            },
            onReset: () => {
              if (this.queryRefs) this.queryRefs.handleClear();
            },
            onClear: () => {
              if (this.queryRefs) this.queryRefs.handleClear();
            },
          }}
        />
        <HeadLine
          style={{ marginTop: '32px' }}
          title={intl.get('smodr.deal.view.detail.attachment').d('附件')}
        />
        <div style={{ width: '400px' }}>
          <Attachment
            dataSet={this.props.attDs}
            name="attachmentUuid"
            labelLayout="float"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory='smodr'
          />
        </div>
      </Spin>
    );
  }
}
