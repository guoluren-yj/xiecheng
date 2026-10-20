/**
 * index.js - 付款申请审批界面
 * @date: 2019-9-27
 * @author: napeng <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form, Button } from 'hzero-ui';
// import { stringify } from 'querystring';
import { Bind, Throttle } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
// import CacheComponent from 'components/CacheComponent';

import Search from './Search';
import List from './List';
import ActionHistory from './Compontent/ActionHistory';

@Form.create({ fieldNameProp: null })
@connect(({ payApprove, loading }) => ({
  payApprove,
  loading:
    loading.effects['payApprove/queryList'] ||
    loading.effects['payApprove/approve'] ||
    loading.effects['payApprove/reject'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['sfin.payment', 'sfin.advancePaymentRecord', 'entity.supplier', 'sfin.common'],
})
export default class PaymentApprove extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedRow: [], visible: false };
  }

  componentDidMount() {
    const {
      payApprove: { pagination },
    } = this.props;
    this.handleSearch(pagination);
    this.fetchEnum();
  }

  /**
   * 查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const form = this.filterForm;
    form.validateFields((err, values) => {
      if (!err) {
        const params = form.getFieldsValue() || {};
        dispatch({
          type: 'payApprove/queryList',
          payload: {
            page,
            ...values,
            creationDateStart:
              params.creationDateStart && moment(params.creationDateStart).format(DATETIME_MIN),
            creationDateEnd:
              params.creationDateEnd && moment(params.creationDateEnd).format(DATETIME_MAX),
          },
        }).then((res) => {
          if (res) {
            this.setState({ selectedRow: [] });
          }
        });
      }
    });
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    const {
      payApprove: { expend = false },
      dispatch,
    } = this.props;
    dispatch({
      type: 'payApprove/updateState',
      payload: { expend: !expend },
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} selectedListRows
   * @param {Object} selectedRows
   */
  @Bind()
  handleRowSelectedChange(_, selectedRows) {
    this.setState({ selectedRow: selectedRows });
  }

  @Bind()
  toDetail(record) {
    const { history } = this.props;
    if (record.paymentTypeCode === 'GENERAL_PAYMENT') {
      history.push(`/sfin/pay-approve/detail/${record.paymentHeaderId}`);
    } else {
      history.push(`/sfin/pay-approve/advance/detail/${record.paymentHeaderId}`);
    }
  }

  @Bind()
  openActionHistory(record) {
    this.setState({
      visible: true,
      data: record,
    });
  }

  @Bind()
  hideModal(type, status) {
    this.setState({ [type]: status });
  }

  @Bind()
  @Throttle(1000)
  approve(type) {
    const { selectedRow } = this.state;
    const { dispatch } = this.props;
    if (type === 'reject') {
      dispatch({
        type: 'payApprove/reject',
        payload: { paymentHeaderList: selectedRow, approvedRemark: '' },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    } else {
      dispatch({
        type: 'payApprove/approve',
        payload: { paymentHeaderList: selectedRow, approvedRemark: '' },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    }
  }

  //  * 查询值集
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'payApprove/init',
    });
  }

  render() {
    const {
      form,
      loading,
      payApprove: {
        list,
        pagination,
        expend,
        code: { sourceList = [] },
      },
    } = this.props;
    const { selectedRow, visible, data } = this.state;
    const searchProps = {
      form,
      status,
      expend,
      onToggle: this.toggle,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      sourceList,
    };
    const listProps = {
      dataSource: list,
      pagination,
      onChange: this.handleSearch,
      loading,
      rowSelection: {
        selectedRowKeys: selectedRow.map((n) => n.paymentHeaderId),
        onChange: this.handleRowSelectedChange,
      },
      onToDetail: this.toDetail,
      openActionHistory: this.openActionHistory,
    };
    const actionHistory = {
      data, // 传入的数据,打开操作记录的行
      visible,
      hideModal: this.hideModal,
    };

    // const params = form.getFieldsValue() || {};
    return (
      <React.Fragment>
        <Header title={intl.get(`sfin.payment.common.payApprove`).d('付款申请审批')}>
          <Button
            onClick={() => this.approve('approve')}
            type="primary"
            disabled={selectedRow.length === 0}
            loading={loading}
          >
            {intl.get(`sfin.payment.common.approved`).d('审批通过')}
          </Button>
          <Button
            onClick={() => this.approve('reject')}
            disabled={selectedRow.length === 0}
            loading={loading}
          >
            {intl.get(`sfin.payment.common.unApproved`).d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          {visible && <ActionHistory {...actionHistory} />}
        </Content>
      </React.Fragment>
    );
  }
}
