/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isArray, isEmpty } from 'lodash';

import { Content, Header } from 'components/Page';
import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
// import querystring from 'querystring';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import Search from './Search';
import List from './List';

@connect(({ loading = {}, optionToPayInvoice = {} }) => ({
  optionToPayInvoice,
  searchLoading: loading.effects['optionToPayInvoice/onFetchList'],
  newLoading: loading.effects['optionToPayInvoice/newDetailList'],
}))
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  componentDidMount() {
    this.onFetchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'optionToPayInvoice/init',
    });
  }

  /**
   * searchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  onFetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'optionToPayInvoice/onFetchList',
      payload: {
        page,
        ...filterValues,
        taxInvoiceDateIssuedFrom:
          filterValues.taxInvoiceDateIssuedFrom &&
          filterValues.taxInvoiceDateIssuedFrom.format(DEFAULT_DATETIME_FORMAT),
        taxInvoiceDateIssuedTo:
          filterValues.taxInvoiceDateIssuedTo &&
          filterValues.taxInvoiceDateIssuedTo.format(DEFAULT_DATETIME_FORMAT),
        creationDateFrom:
          filterValues.creationDateFrom &&
          filterValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT),
        creationDateTo:
          filterValues.creationDateTo &&
          filterValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    });
  }

  /**
   * searchList - 新建跳转
   * @param {object} params - selectedRows
   */
  @Bind()
  newDetailList() {
    const { dispatch, history } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'optionToPayInvoice/newDetailList',
      payload: selectedRows,
    }).then(res => {
      if (res) {
        const { paymentHeaderId } = res;
        history.push({
          pathname: `/sfin/create-payment-request/detail/${paymentHeaderId}`,
          // search: querystring.stringify({ status: 'create' }),
        });
      }
    });
  }

  // 选择的数据
  @Bind()
  onSelectedRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  render() {
    const {
      optionToPayInvoice,
      searchLoading,
      newLoading,
      optionToPayInvoice: { enumMap = {} },
    } = this.props;
    const { selectedRows = [] } = this.state;
    const selectedRowKeys = selectedRows.map(n => n.invoiceHeaderId);
    const { dataSource = [], pagination = {} } = optionToPayInvoice;
    const searchProps = {
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.onFetchList,
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRows,
      loading: searchLoading,
      onSearch: this.onFetchList,
      onSelectedRowChange: this.onSelectedRowChange,
    };
    return (
      <React.Fragment>
        <Header
          backPath="/sfin/create-payment-request/list"
          title={intl
            .get('sfin.invoiceBill.view.message.optiontopayinvoice')
            .d('一般付款-选择发票')}
        >
          <Button
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
            icon="plus"
            type="primary"
            onClick={this.newDetailList}
            loading={newLoading}
          >
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
