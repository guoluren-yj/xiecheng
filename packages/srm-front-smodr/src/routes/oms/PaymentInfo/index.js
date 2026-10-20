import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import qs from 'qs';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import PaymentTab from './PaymentInfo';
import RefundInfo from './RefundInfo';

const { TabPane } = Tabs;

@formatterCollections({
  code: ['smodr.paymentInfo', 'smodr.common', 'smodr.orderDetail', 'smodr.frightLine'],
})
@connect(({ paymentInfo, loading }) => ({
  paymentInfo,
  fetchPayLoading: loading.effects['paymentInfo/fetchPayList'],
  fetchOrderFreLoading: loading.effects['paymentInfo/fetchOrderFreList'],
  fetchOrderPayLoading: loading.effects['paymentInfo/fetchOrderPayList'],
  fetchRefundLoading: loading.effects['paymentInfo/fetchRefundList'],
  fetchRefundFreLoading: loading.effects['paymentInfo/fetchRefundFreList'],
  fetchRefundPayLoading: loading.effects['paymentInfo/fetchRefundProList'],
  fetchOrderPaymentLoading: loading.effects['paymentInfo/fetchOrderPayment'],
}))
export default class PaymenteInfo extends React.Component {
  constructor(props) {
    super(props);
    const { orderId, activeKey } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      orderId,
      activeKey,
    };
  }

  componentDidMount() {
    this.fetchPayList();
    this.fetchOrderFre();
    this.fetchOrderPayList();
    this.fetchOrderPayment();
    this.fetchRefundList();
    this.fetchRefundProList();
    this.fetchRefundFreList();
  }

  componentWillReceiveProps(nextProps) {
    // const { dispatch } = this.props;
    const { orderId } = qs.parse(nextProps.history.location.search.substr(1));
    const { orderId: oldOrderId } = this.state;
    if (orderId && orderId !== oldOrderId) {
      this.setState({ orderId }, () => {
        this.fetchPayList();
        this.fetchOrderFre();
        this.fetchOrderPayList();
        this.fetchOrderPayment();
        this.fetchRefundList();
        this.fetchRefundProList();
        this.fetchRefundFreList();
      });
    }
    // if (activeKey !== oldActiveKey) {
    //   this.setState({ activeKey });
    // }
  }

  @Bind()
  fetchPayList() {
    const { dispatch } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'paymentInfo/fetchPayList',
      payload: { orderId, operationType: 'PAYMENT' },
    });
  }

  @Bind()
  fetchOrderFre(page = { page: 0, size: 10 }) {
    const { dispatch, paymentInfo } = this.props;
    const { orderId } = this.state;
    const { orderFreListPagination = {} } = paymentInfo;
    dispatch({
      type: 'paymentInfo/fetchOrderFreList',
      payload: { orderId, page: isEmpty(page) ? orderFreListPagination : page },
    });
  }

  @Bind()
  fetchOrderPayment(page = { page: 0, size: 10 }) {
    const { dispatch, paymentInfo } = this.props;
    const { orderId } = this.state;
    const { orderPaymentPagination = {} } = paymentInfo;
    dispatch({
      type: 'paymentInfo/fetchOrderPayment',
      payload: { orderId, page: isEmpty(page) ? orderPaymentPagination : page },
    });
  }

  @Bind()
  fetchOrderPayList(page = { page: 0, size: 10 }) {
    const { dispatch, paymentInfo } = this.props;
    const { orderId } = this.state;
    const { orderPayListPagination = {} } = paymentInfo;
    dispatch({
      type: 'paymentInfo/fetchOrderPayList',
      payload: {
        orderId,
        operationType: 'PAYMENT',
        page: isEmpty(page) ? orderPayListPagination : page,
      },
    });
  }

  @Bind()
  fetchRefundList() {
    const { dispatch } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'paymentInfo/fetchRefundList',
      payload: { orderId },
    });
  }

  @Bind()
  fetchRefundFreList(page = { page: 0, size: 10 }) {
    const { dispatch, paymentInfo } = this.props;
    const { orderId } = this.state;
    const { refundFreListPagination = {} } = paymentInfo;
    dispatch({
      type: 'paymentInfo/fetchRefundFreList',
      payload: {
        orderId,
        operationType: 'REFUND',
        page: isEmpty(page) ? refundFreListPagination : page,
      },
    });
  }

  @Bind()
  fetchRefundProList(page = { page: 0, size: 10 }) {
    const { dispatch, paymentInfo } = this.props;
    const { orderId } = this.state;
    const { refundProListPagination = {} } = paymentInfo;
    dispatch({
      type: 'paymentInfo/fetchRefundProList',
      payload: {
        orderId,
        operationType: 'REFUND',
        page: isEmpty(page) ? refundProListPagination : page,
      },
    });
  }

  render() {
    const {
      fetchPayLoading,
      fetchOrderPayLoading,
      fetchRefundPayLoading,
      fetchRefundLoading,
      fetchOrderFreLoading,
      fetchRefundFreLoading,
      fetchOrderPaymentLoading,
    } = this.props;
    const { activeKey } = this.state;
    return (
      <React.Fragment>
        <Header title={intl.get('smodr.paymentInfo.view.title').d('支付/退款信息')} />
        <Content>
          <Tabs activeKey={activeKey} onChange={(key) => this.setState({ activeKey: key })}>
            <TabPane tab={intl.get('smodr.paymentInfo.view.payInfo').d('支付信息')} key="1">
              <PaymentTab
                onSearch={this.fetchOrderPayList}
                fetchOrderFre={this.fetchOrderFre}
                fetchOrderPayment={this.fetchOrderPayment}
                fetchPayLoading={fetchPayLoading}
                fetchOrderPayLoading={fetchOrderPayLoading}
                fetchOrderFreLoading={fetchOrderFreLoading}
                fetchOrderPaymentLoading={fetchOrderPaymentLoading}
              />
            </TabPane>
            <TabPane tab={intl.get('smodr.paymentInfo.view.refundInfo').d('退款信息')} key="2">
              <RefundInfo
                onSearch={this.fetchRefundProList}
                fetchRefundFre={this.fetchRefundFreList}
                fetchRefundLoading={fetchRefundLoading}
                fetchRefundPayLoading={fetchRefundPayLoading}
                fetchRefundFreLoading={fetchRefundFreLoading}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
