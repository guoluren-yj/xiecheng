/**
 * index.js - 收款申请审批界面
 * @date: 2019-9-27
 * @author: napeng <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { isEmpty } from 'lodash';
// import { stringify } from 'querystring';
import { Bind } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';

import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { SRM_FINANCE } from '_utils/config';
// import CacheComponent from 'components/CacheComponent';

import Search from './Search';
import List from './List';
import ActionHistory from './../PaymentApprove/Compontent/ActionHistory';

const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
@connect(({ receivedPayQuery, loading }) => ({
  receivedPayQuery,
  loading: loading.effects['receivedPayQuery/queryList'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sfin.payment',
    'sfin.advancePaymentRecord',
    'sfin.paymentRecord',
    'entity.supplier',
    'sfin.invoiceBill',
    'sfin.paymentQuery',
    'sfin.common',
  ],
})
export default class PaymentApprove extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false, data: {}, selectedRowKeys: [] };
  }

  componentDidMount() {
    const {
      receivedPayQuery: { pagination },
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
        const {
          creationDateStart,
          creationDateEnd,
          actualPaymentDateStart,
          actualPaymentDateEnd,
          paymentStatus,
        } = params;

        dispatch({
          type: 'receivedPayQuery/queryList',
          payload: {
            page,
            ...values,
            creationDateStart: creationDateStart && moment(creationDateStart).format(DATETIME_MIN),
            creationDateEnd: creationDateEnd && moment(creationDateEnd).format(DATETIME_MAX),
            actualPaymentDateStart:
              actualPaymentDateStart && moment(actualPaymentDateStart).format(DATETIME_MIN),
            actualPaymentDateEnd:
              actualPaymentDateEnd && moment(actualPaymentDateEnd).format(DATETIME_MAX),
            paymentHeaderStatus: paymentStatus ? [paymentStatus] : undefined,
            camp: 'SUPPLIER',
          },
        });
      }
    });
  }

  //  * 查询值集
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'receivedPayQuery/init',
    });
  }

  /**
   * 搜索条件展开收起
   */
  @Bind()
  toggle() {
    const {
      receivedPayQuery: { expend = false },
      dispatch,
    } = this.props;
    dispatch({
      type: 'receivedPayQuery/updateState',
      payload: { expend: !expend },
    });
  }

  @Bind()
  toDetail(record) {
    const { history } = this.props;
    if (record.paymentTypeCode === 'GENERAL_PAYMENT') {
      history.push(`/sfin/receive-pay-query/detail/${record.paymentHeaderId}`);
    } else {
      history.push(`/sfin/receive-pay-query/advance/detail/${record.paymentHeaderId}`);
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

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.filterForm;
    const params = form.getFieldsValue();
    const {
      creationDateStart,
      creationDateEnd,
      actualPaymentDateStart,
      actualPaymentDateEnd,
    } = params;
    return filterNullValueObject({
      ...params,
      creationDateStart: creationDateStart && moment(creationDateStart).format(DATETIME_MIN),
      creationDateEnd: creationDateEnd && moment(creationDateEnd).format(DATETIME_MAX),
      actualPaymentDateStart:
        actualPaymentDateStart && moment(actualPaymentDateStart).format(DATETIME_MIN),
      actualPaymentDateEnd:
        actualPaymentDateEnd && moment(actualPaymentDateEnd).format(DATETIME_MAX),
      camp: 'SUPPLIER',
    });
  }

  @Bind()
  handleSelectedChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      form,
      loading,
      receivedPayQuery: {
        list,
        pagination,
        expend,
        code: { sourceList = [], sourceStatus = [], exportStatus = [] },
      },
    } = this.props;
    const { visible, data, selectedRowKeys } = this.state;
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
      sourceStatus,
      exportStatus,
    };
    const listProps = {
      dataSource: list,
      pagination,
      loading,
      onToDetail: this.toDetail,
      openActionHistory: this.openActionHistory,
      onChange: this.handleSearch,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleSelectedChange,
      },
    };
    const actionHistory = {
      data, // 传入的数据,打开操作记录的行
      visible,
      hideModal: this.hideModal,
    };
    const queryParams = (this.filterForm && this.handleGetFormValue()) || {};
    return (
      <React.Fragment>
        <Header title={intl.get(`sfin.payment.common.receivedPayApprove`).d('收款申请查询')}>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/payment-headers/list/supplier-export`}
            queryParams={
              isEmpty(selectedRowKeys)
                ? queryParams
                : { ...queryParams, paymentHeaderIds: selectedRowKeys }
            }
            otherButtonProps={{
              type: 'primary',
            }}
          />
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
