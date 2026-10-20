/*
 * Order - 我发出的订单列表查询
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
// import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';
import { stringify } from 'querystring';

import Search from './Search';
import List from './List';

/**
 * 我发出的订单列表查询页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
// const messagePrompt = 'sslm.investigationReceived.view.message';
export default class Order extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    const { onSearch = (e) => e, pagination, setUrlParams } = this.props;
    setUrlParams();
    onSearch(pagination);
  }

  /**
   * 跳转到列表的详情页
   * @param {String} poHeaderId
   */
  @Bind()
  redirectToDetail(poHeaderId, poSourcePlatform) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/send-order/detail/${poHeaderId}`,
        search: poSourcePlatform ? stringify({ poSourcePlatform }) : stringify({}),
      })
    );
  }

  render() {
    const {
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleReset,
      onSearchPaging,
      enumMap,
      customizeFilterForm,
      customizeTable,
      remote,
    } = this.props;
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      handleToDetail: this.redirectToDetail,
      editLine: this.editLine,
      searchPaging: onSearchPaging,
    };
    const searchProps = {
      enumMap,
      handleReset,
      customizeFilterForm,
      handleSearch: onSearchPaging,
      onRef: (node) => {
        this.searchForm = node;
      },
      remote,
    };
    return (
      <React.Fragment>
        <Search {...searchProps} />
        <List {...listProps} />
      </React.Fragment>
    );
  }
}
