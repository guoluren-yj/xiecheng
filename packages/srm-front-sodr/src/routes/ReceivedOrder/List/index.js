/*
 * Order - 采购订单查询
 * @date: 2018/10/13 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';

import Search from './Search';
import List from './List';

/**
 * 采购订单查询页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
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
    const { onSearch, pagination } = this.props;
    onSearch(pagination);
  }

  /**
   * 跳转详情
   * @param {Number} poHeaderId
   */
  @Bind()
  redirectToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/received-order/detail/${poHeaderId}`,
      })
    );
  }

  render() {
    const {
      form,
      enumMap,
      loading,
      dataSource,
      pagination,
      rowSelection,
      handleReset,
      onSearch,
      customizeFilterForm,
      customizeTable,
    } = this.props;
    const filterProps = {
      form,
      handleReset,
      enumMap,
      customizeFilterForm,
      onSearch,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      editLine: this.editLine,
      searchPaging: onSearch,
      handleToDetail: this.redirectToDetail,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <List {...listProps} />
      </React.Fragment>
    );
  }
}
