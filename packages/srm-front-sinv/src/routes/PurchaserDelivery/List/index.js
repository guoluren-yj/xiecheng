/**
 * DeliveryList - 采购方送货单列表
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

// import OperationRecord from './OperationRecord';
import OperationRecord from '../../components/DeliveryOeration';
import Search from './Search';
import List from './List';
import ExectModal from './ExectModal';

/**
 * 采购方送货单列表页面
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
      exectRecordVisible: false,
      asnHeaderId: null,
      recordList: {},
    };
  }

  // componentDidMount() {
  //   const {
  //     location: { state: { _back } = {} },
  //     pagination,
  //   } = this.props;
  //   if (_back !== -1) {
  //     this.handleSearch();
  //   } else {
  //     this.handleSearch(pagination);
  //   }
  // }

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
   * @param {*} asnHeaderId
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
   * @param {Boolean} flag
   */
  @Bind()
  handleOperationVisible(flag) {
    this.setState({ operationRecordVisible: !!flag });
  }

  /**
   * 打开导入
   * @param {*} asnHeaderId
   */

  @Bind()
  handleExectRecord(recordList) {
    this.setState(
      {
        recordList,
      },
      () => this.handleExectVisible(true)
    );
  }

  /**
   * 修改导入visible
   * @param {Boolean} flag
   */
  @Bind()
  handleExectVisible(flag) {
    this.setState({ exectRecordVisible: !!flag });
  }

  /**
   * 跳转详情
   * @param {*} asnHeaderId
   */

  @Bind()
  handleToDetail(asnHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sinv/purchaser-delivery/detail/${asnHeaderId}`,
      })
    );
  }

  render() {
    const {
      enumMap,
      loading,
      syncAlign,
      dataSource,
      pagination,
      handleReset,
      exectRecordList,
      onFetchOperation,
      loadingExect,
      loadingAsync,
      onFetchExect,
      loadingOperation,
      rowSelection,
      customizeTable,
      customizeFilterForm,
      onSearch = (e) => e,
    } = this.props;
    const { asnHeaderId, operationRecordVisible, exectRecordVisible, recordList } = this.state;
    const filterProps = {
      enumMap,
      handleReset,
      customizeFilterForm,
      onFilterChange: onSearch,
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
      handleExectRecord: this.handleExectRecord,
      onToDetail: this.handleToDetail,
      editLine: this.editLine,
      searchPaging: onSearch,
    };
    const operationRecordProps = {
      asnHeaderId,
      onFetchOperation,
      loading: loadingOperation,
      visible: operationRecordVisible,
      hideModal: () => this.handleOperationVisible(false),
    };

    const exectRecordProps = {
      asnHeaderId: recordList.asnHeaderId,
      recordList,
      onFetchExect,
      syncAlign,
      // onRef: (node) => {
      //   this.exectRecordList = node;
      // },
      dataSource: exectRecordList,
      loading: loadingExect || loadingAsync,
      visible: exectRecordVisible,
      hideModal: () => this.handleExectVisible(false),
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
        {operationRecordVisible && <OperationRecord {...operationRecordProps} />}
        {exectRecordVisible && <ExectModal {...exectRecordProps} />}
      </React.Fragment>
    );
  }
}
