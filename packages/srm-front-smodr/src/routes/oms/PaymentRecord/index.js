import React from 'react';
import { connect } from 'dva';
import qs from 'qs';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import FeightInfoTable from './ExtensionTable/FeightInfoTable';
import ProductInfoTable from './ExtensionTable/ProductInfoTable';
import HistoryModal from '../HistoryModal';

@formatterCollections({ code: ['smodr.payment', 'smodr.common'] })
@connect(({ paymentRecord, loading }) => ({
  paymentRecord,
  productInfoLoading: loading.effects['paymentRecord/fetchPaymentHead'],
  feightInfoLoading: loading.effects['paymentRecord/fetchPaymentPro'],
  fetchDataLoading: loading.effects['paymentRecord/fetchPaymentRecord'],
  quickPayLoading: loading.effects['paymentRecord/quickPay'],
  fetchHistoryLoading: loading.effects['paymentRecord/fetchHistory'],
}))
export default class PaymentRecord extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      productFlag: false,
      feightFlag: false,
      selectedRows: [],
    };
  }

  form;

  componentDidMount() {
    this.fetchCallbackInfo();
  }

  // 跳回查询
  @Bind()
  fetchCallbackInfo() {
    const { merchantOrderNum } = qs.parse(this.props.location.search.substr(1));
    const { dispatch } = this.props;
    if (merchantOrderNum) {
      dispatch({
        type: 'paymentRecord/fetchCallbackInfo',
        payload: { merchantOrderNum },
      }).then(() => {
        this.fetchCompany();
        this.fetchBatchCodes();
        this.fetchPaymentRecord();
      });
    } else {
      this.fetchCompany();
      this.fetchBatchCodes();
      this.fetchPaymentRecord();
    }
  }

  // 批量查询值集
  @Bind()
  fetchBatchCodes() {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentRecord/fetchBatchCodes',
    });
  }

  // 查询所有公司
  @Bind()
  fetchCompany() {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentRecord/fetchCompany',
    });
    dispatch({
      type: 'paymentRecord/fetchPurchaseCompany',
    });
  }

  // 打开历史记录
  @Bind()
  handleOpenModal(record = {}) {
    this.setState({ historyModalVisible: true, record }, () => this.fetchHistory());
  }

  // 查看历史记录
  @Bind()
  fetchHistory(page = { page: 0, size: 10 }) {
    const {
      dispatch,
      paymentRecord: { historyListPagination = {} },
    } = this.props;
    const { record } = this.state;
    const params = {
      orderId: record && record.orderId,
      // orderType: 'ORDER',
      operationType: 'PAYMENT',
      page: isEmpty(page) ? historyListPagination : page,
    };
    dispatch({
      type: 'paymentRecord/fetchHistory',
      payload: { ...params },
    });
  }

  // 查询支付记录信息
  @Bind()
  fetchPaymentRecord(pageParams = { page: 0, size: 10 }) {
    const {
      dispatch,
      paymentRecord: { orderLinePagination = {} },
    } = this.props;
    const filterValue = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'paymentRecord/fetchPaymentRecord',
      payload: {
        page: isEmpty(pageParams) ? orderLinePagination : pageParams,
        ...filterValue,
        queryDateFrom:
          filterValue.queryDateFrom && filterValue.queryDateFrom.format(DEFAULT_DATETIME_FORMAT),
        queryDateTo:
          filterValue.queryDateTo && filterValue.queryDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    });
    this.setState({
      productFlag: false,
      feightFlag: false,
    });
  }

  // 查询支付头
  @Bind()
  handleExtensionHeader(record = {}) {
    const { dispatch } = this.props;
    const { cecPaymentCode } = record;
    dispatch({
      type: 'paymentRecord/fetchPaymentHead',
      payload: { cecPaymentCode },
    });
    this.setState({
      productFlag: true,
      feightFlag: false,
    });
  }

  // 查询
  @Bind()
  handleExtensionPro(record = {}) {
    const { dispatch } = this.props;
    const { cecPaymentCode, orderId } = record;
    dispatch({
      type: 'paymentRecord/fetchPaymentPro',
      payload: { cecPaymentCode, orderId },
    });
    this.setState({
      productFlag: false,
      feightFlag: true,
    });
  }

  // 跳转第三方支付
  @Bind()
  handleQuickPay(record) {
    const windowHref = window.location.href;
    const { dispatch, history } = this.props;
    dispatch({
      type: 'paymentRecord/quickPay',
      payload: { returnUrl: windowHref, paymentOrderDTOList: [record] },
    }).then((res) => {
      if (res && res.paymentOrderNum) {
        history.push(
          `/pub/hpay/checkout-counter?paymentOrderNum=${res.paymentOrderNum}&channelTrxType=link`
        );
      }
    });
  }

  @Bind()
  handlePaymentRecord(record = {}) {
    const { history } = this.props;
    history.push(`/s2-mall/oms/payment-info?orderId=${record.orderId}&activeKey=1`);
  }

  @Bind()
  handleRefundRecord(record = {}) {
    const { history } = this.props;
    history.push(`/s2-mall/oms/payment-info?orderId=${record.orderId}&activeKey=2`);
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  onRow(index) {
    const a = document.getElementsByClassName('ant-table-row-payment');
    if (a && a.length > 0) {
      a[index].className += ' click-row-payment';
      const clickRow = document.getElementsByClassName('click-row-payment');
      if (clickRow.length > 0) {
        for (let i = 0; i < clickRow.length; i++) {
          if (clickRow[i].rowIndex === a[index].rowIndex) {
            clickRow[i].style.backgroundColor = '#f2f2f2';
          } else {
            clickRow[i].style.backgroundColor = '#fff';
          }
        }
      }
    }
  }

  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({
      // selectedRowKeys,
      selectedRows,
    });
  }

  @Bind()
  handleBatchPay() {
    const { selectedRows = [] } = this.state;
    const windowHref = window.location.href;
    const { dispatch, history } = this.props;
    dispatch({
      type: 'paymentRecord/quickPay',
      payload: { returnUrl: windowHref, paymentOrderDTOList: selectedRows },
    }).then((res) => {
      if (res && res.paymentOrderNum) {
        history.push(
          `/pub/hpay/checkout-counter?paymentOrderNum=${res.paymentOrderNum}&channelTrxType=link`
        );
      }
    });
  }

  render() {
    const {
      paymentRecord,
      fetchDataLoading,
      feightInfoLoading,
      productInfoLoading,
      fetchHistoryLoading,
      quickPayLoading,
    } = this.props;
    const {
      historyModalVisible,
      productFlag,
      feightFlag,
      // selectedRowKeys,
      // selectedRows,
    } = this.state;
    const {
      paymentData = [],
      paymentTypes = [],
      paymentStatus = [],
      companyList = [],
      purchaseCompanyList = [],
      paymentDataPagination = {},
      extensionHeaderData = {},
      freightPayments = [],
      productPayments = [],
      historyList = [],
      historyListPagination = {},
    } = paymentRecord;
    const columns = [
      {
        title: intl.get('smodr.payment.model.orderCode').d('商城订单编码'),
        width: 200,
        dataIndex: 'orderCode',
      },
      {
        title: intl.get('smodr.payment.model.cecFromMeaning').d('订单类型'),
        width: 200,
        dataIndex: 'cecFromMeaning',
      },
      {
        title: intl.get('smodr.payment.model.orderAmount').d('订单金额'),
        width: 200,
        dataIndex: 'orderAmount',
      },
      {
        title: intl.get('smodr.payment.model.orderStatusMeaning').d('订单状态'),
        width: 200,
        dataIndex: 'orderStatusMeaning',
      },
      // {
      //   title: intl.get('smodr.payment.model.cecPaymentCode').d('交易流水号'),
      //   width: 200,
      //   dataIndex: 'cecPaymentCode',
      //   render: (val, record) => <a onClick={() => this.handleExtensionHeader(record)}>{val}</a>,
      // },
      {
        title: intl.get('smodr.payment.model.paymentMethods').d('支付方式'),
        width: 100,
        dataIndex: 'paymentTypeMeaning',
      },
      {
        title: intl.get('smodr.payment.model.payAmount').d('支付金额'),
        width: 100,
        dataIndex: 'paymentAmount',
      },
      {
        title: intl.get('smodr.payment.model.paymentStatusMeaning').d('支付状态'),
        width: 100,
        dataIndex: 'paymentStatusMeaning',
      },
      {
        title: intl.get('smodr.payment.model.refundedAmount').d('已退款金额'),
        width: 100,
        dataIndex: 'refundedAmount',
      },
      {
        title: intl.get('smodr.payment.model.refundingAmount').d('退款中金额'),
        width: 100,
        dataIndex: 'refundingAmount',
      },
      {
        title: intl.get('smodr.payment.model.currencyCode').d('币种'),
        width: 100,
        dataIndex: 'currencyName',
      },
      {
        title: intl.get('smodr.payment.model.buyerDate').d('下单时间'),
        width: 150,
        dataIndex: 'buyerDate',
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get('smodr.payment.model.buyerName').d('下单人'),
        width: 150,
        dataIndex: 'buyerName',
      },
      {
        title: intl.get('smodr.payment.model.purchaseCompanyName').d('采购方公司'),
        width: 150,
        dataIndex: 'purchaseCompanyName',
      },
      {
        title: intl.get('smodr.payment.model.supplierCompanyName').d('供应方公司'),
        width: 150,
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('smodr.payment.model.action').d('操作'),
        width: 300,
        render: (_, record) => (
          <span className="action-link">
            {/* <a
              disabled={!(record && record.paymentStatus === 'NON_PAYMENT')}
              onClick={() => this.handleQuickPay(record)}
            >
              {intl.get('smodr.payment.model.quickPay').d('立即支付')}
            </a> */}
            <a
              disabled={!(record && record.paymentFlag)}
              onClick={() => this.handlePaymentRecord(record)}
            >
              {intl.get('smodr.payment.model.paymentRecord').d('支付记录')}
            </a>
            <a
              disabled={!(record && record.paymentFlag)}
              onClick={() => this.handleRefundRecord(record)}
            >
              {intl.get('smodr.payment.model.refundRecord').d('退款记录')}
            </a>
            <a onClick={() => this.handleOpenModal(record)}>
              {intl.get('smodr.payment.model.history').d('操作记录')}
            </a>
          </span>
        ),
      },
    ];
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.handleSelectRow,
    // };
    return (
      <React.Fragment>
        <Header title={intl.get('smodr.payment.model.titleManage').d('支付管理')} />
        <Content>
          <FilterForm
            companyList={companyList}
            purchaseCompanyList={purchaseCompanyList}
            paymentTypes={paymentTypes}
            paymentStatus={paymentStatus}
            onRef={this.handleRef}
            onSearch={this.fetchPaymentRecord}
          />
          {/* <div className="table-operator">
            <Button disabled={selectedRows.length === 0} onClick={() => this.handleBatchPay()}>
              {intl.get('smodr.payment.view.batchPayment').d('批量支付')}
            </Button>
          </div> */}
          <Table
            bordered
            rowKey="orderId"
            // rowSelection={rowSelection}
            columns={columns}
            dataSource={paymentData}
            loading={fetchDataLoading || quickPayLoading}
            pagination={paymentDataPagination}
            onChange={(page) => this.fetchPaymentRecord(page)}
            onRow={(_, index) => {
              return {
                className: 'ant-table-row-payment',
                onClick: () => this.onRow(index),
              };
            }}
          />
          {feightFlag && (
            <FeightInfoTable
              productPayments={productPayments}
              freightPayments={freightPayments}
              loading={feightInfoLoading}
              handleToDetail={this.handleToDetail}
              handleOpenModal={this.handleOpenModal}
            />
          )}
          {productFlag && (
            <ProductInfoTable
              extensionHeaderData={extensionHeaderData}
              loading={productInfoLoading}
              handleToDetail={this.handleToDetail}
              handleOpenModal={this.handleOpenModal}
            />
          )}
        </Content>
        <HistoryModal
          rowKey="historyId"
          history
          visible={historyModalVisible}
          onCancel={() => this.setState({ historyModalVisible: false })}
          pagination={historyListPagination}
          loading={fetchHistoryLoading}
          dataSource={historyList}
          onChange={(page) => this.fetchHistory(page)}
        />
      </React.Fragment>
    );
  }
}
