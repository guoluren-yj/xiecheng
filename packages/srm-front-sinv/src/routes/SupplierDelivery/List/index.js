/**
 * DeliveryList - 供应商送货单列表
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { stringify } from 'querystring';
import { isFunction } from 'lodash';

// import OperationRecord from './OperationRecord';
import OperationRecord from '../../components/SupplierDelivery';
import Search from './Search';
import List from './List';

/**
 * 供应商送货单列表页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@withRouter
export default class DeliveryList extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      operationRecordVisible: false,
      asnHeaderId: null,
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      pagination,
    } = this.props;
    if (_back !== -1) {
      this.handleSearch();
    } else {
      this.handleSearch(pagination);
    }
  }

  /**
   * 查询送货单列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { onSearch } = this.props;
    if (isFunction(onSearch)) {
      onSearch(fields);
    }
  }

  /**
   * 打开操作记录
   * @param {*} asnHeaderId 送货单头id
   */
  @Bind()
  handleOperationRecord(asnHeaderId) {
    this.setState(
      {
        asnHeaderId,
      },
      () => this.handleOperationVisible(true)
    );
  }

  /**
   * 修改操作记录visible
   * @param {Boolean} flag //改变操作记录的显隐
   */
  @Bind()
  handleOperationVisible(flag) {
    this.setState({ operationRecordVisible: !!flag });
  }

  /**
   * 跳转详情
   * @param {*} asnHeaderId //送货单头id
   */
  @Bind()
  handleToDetail(asnHeaderId, printStatusFlag) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/supplier-delivery/detail/${asnHeaderId}`,
        search: printStatusFlag ? stringify({ printStatusFlag }) : stringify({}),
      })
    );
  }

  render() {
    const {
      loading,
      loadingOperation,
      dataSource,
      pagination,
      handleReset,
      enumMap,
      onFetchOperation,
      rowSelection,
      customizeFilterForm,
      customizeTable,
    } = this.props;
    const { asnHeaderId, operationRecordVisible } = this.state;
    const filterProps = {
      enumMap,
      handleReset,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node.props.form;
      },
    };
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      onOperationRecord: this.handleOperationRecord,
      onToDetail: this.handleToDetail,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
    };
    const operationRecordProps = {
      asnHeaderId,
      onFetchOperation,
      loading: loadingOperation,
      visible: operationRecordVisible,
      hideModal: () => this.handleOperationVisible(false),
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
        {operationRecordVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
