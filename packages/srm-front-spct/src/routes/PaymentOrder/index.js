/**
 * paymentOrder 入口文件
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @date 2019-06-14
 * @copyright 2018 © HAND
 */

import React from 'react';
import { Popconfirm, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Content, Header } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { TagRender, operatorRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import PaymentOrderDrawer from './PaymentOrderDrawer';

@connect(({ loading, paymentOrderNewly }) => ({
  paymentOrderNewly,
  fetchOrderListLoading: loading.effects['paymentOrderNewly/fetchOrderList'],
  getOrderDetailLoading: loading.effects['paymentOrderNewly/getOrderDetail'],
}))
@formatterCollections({ code: ['spct.paymentOrder'] })
export default class PaymentOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: 'paymentOrderNewly/init' });
    this.fetchOrderList();
  }

  /**
   * 获取订单列表
   * @param {object} params
   */
  @Bind()
  fetchOrderList(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = this.form.getFieldsValue();
    fieldValues.paymentDatetimeFrom =
      fieldValues.paymentDatetimeFrom &&
      fieldValues.paymentDatetimeFrom.format(DEFAULT_DATETIME_FORMAT);
    fieldValues.paymentDatetimeTo =
      fieldValues.paymentDatetimeTo &&
      fieldValues.paymentDatetimeTo.format(DEFAULT_DATETIME_FORMAT);
    dispatch({
      type: 'paymentOrderNewly/fetchOrderList',
      payload: { ...fieldValues, ...params },
    });
  }

  /**
   * 查询列表
   */
  @Bind()
  handleSearch(fieldsValue) {
    this.fetchOrderList({ ...fieldsValue, page: {} });
  }

  /**
   * 退款申请
   */
  @Bind()
  handleRefund(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'paymentOrderNewly/refundOrder',
      payload: record,
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchOrderList();
      }
    });
  }

  /**
   * 分页
   */
  @Bind()
  handleTableChange(pagination) {
    this.fetchOrderList({
      page: pagination,
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag });
  }

  /**
   * 打开模态框
   */
  @Bind()
  showModal(record) {
    const { dispatch } = this.props;
    this.handleModalVisible(true);
    dispatch({
      type: 'paymentOrderNewly/updateState',
      payload: {
        orderDetail: {},
      },
    });
    dispatch({
      type: 'paymentOrderNewly/getOrderDetail',
      payload: { paymentOrderId: record.paymentOrderId },
    });
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      fetchOrderListLoading = false,
      getOrderDetailLoading = false,
      paymentOrderNewly: {
        channelList = [],
        statusList = [],
        paymentOrderList = [],
        orderDetail = [],
        pagination = [],
      },
    } = this.props;
    const { modalVisible } = this.state;
    const orderColumns = [
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.paymentOrderNum').d('支付订单号'),
        width: 180,
        dataIndex: 'paymentOrderNum',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.merchantOrderNum').d('商户订单号'),
        width: 120,
        dataIndex: 'merchantOrderNum',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.channelCode').d('支付渠道'),
        width: 90,
        dataIndex: 'channelMeaning',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.paymentSubject').d('订单标题'),
        dataIndex: 'paymentSubject',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.currencyCode').d('币种'),
        width: 60,
        dataIndex: 'currencyCode',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.paymentAmount').d('金额'),
        align: 'right',
        dataIndex: 'paymentAmount',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.status').d('状态'),
        width: 100,
        dataIndex: 'status',
        render: (val) => {
          const statusLists = [
            {
              status: 'PAID',
              color: 'green',
              text: intl.get('spct.paymentOrder.model.paymentOrder.paid').d('已支付'),
            },
            {
              status: 'UNPAID',
              color: 'red',
              text: intl.get('spct.paymentOrder.model.paymentOrder.unpaid').d('待支付'),
            },
            {
              status: 'CANCELLED',
              text: intl.get('spct.paymentOrder.model.paymentOrder.canceled').d('取消'),
            },
          ];
          return TagRender(val, statusLists);
        },
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.channelTradeNo').d('支付流水号'),
        width: 220,
        dataIndex: 'channelTradeNo',
      },
      {
        title: intl.get('spct.paymentOrder.model.paymentOrder.paymentDatetime').d('支付成功时间'),
        width: 150,
        dataIndex: 'paymentDatetime',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 130,
        fixed: 'right',
        key: 'action',
        render: (_, record) => {
          const operators = [];
          operators.push({
            key: 'detail',
            ele: (
              <a
                onClick={() => {
                  this.showModal(record);
                }}
              >
                {intl.get('hzero.common.button.detail').d('详情')}
              </a>
            ),
            len: 2,
            title: intl.get('hzero.common.button.detail').d('详情'),
          });
          if (record.status === 'PAID') {
            operators.push({
              key: 'refund',
              ele: (
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.refund').d('是否确认退款？')}
                  onConfirm={() => {
                    this.handleRefund(record);
                  }}
                >
                  <a>{intl.get('hzero.common.button.refund').d('退款')}</a>
                </Popconfirm>
              ),
              len: 2,
              title: intl.get('hzero.common.button.refund').d('退款'),
            });
          }
          return operatorRender(operators, record, { limit: 3 });
        },
      },
    ];
    const scroll = {
      x: tableScrollWidth(orderColumns, 240),
    };
    // util的方法
    return (
      <>
        <Header title={intl.get('spct.paymentOrder.view.message.title').d('支付订单')} />
        <Content>
          <FilterForm
            channelList={channelList}
            statusList={statusList}
            onSearch={this.handleSearch}
            onRef={this.handleBindRef}
          />
          <Table
            bordered
            columns={orderColumns}
            dataSource={paymentOrderList}
            scroll={scroll}
            loading={fetchOrderListLoading}
            pagination={pagination}
            onChange={this.handleTableChange}
          />
          <PaymentOrderDrawer
            modalVisible={modalVisible}
            title={intl.get('hzero.common.button.detail').d('详情')}
            initLoading={getOrderDetailLoading}
            onCancel={this.hideModal}
            onOk={this.hideModal}
            initData={orderDetail}
          />
        </Content>
      </>
    );
  }
}
