/*
 * WholeOrderQuotation - 整单引用
 * @date: 2019-02-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { isFunction } from 'lodash';

import Search from './Search';
import List from './List';

// sodr 语言国际化
// const commonPrefix = 'sodr.quotePurchaseRequisition.view.message';

/**
 * WholeOrderQuotation - 整单引用
 * @export {Component} React.Component
 * @reactProps {object} form - 表单对象
 */
export default class WholeOrderQuotation extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
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
      onRedirectToDetail,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const listProps = {
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      handleToDetail: onRedirectToDetail,
      editLine: this.editLine,
      searchPaging: onSearchPaging,
    };
    const searchProps = {
      enumMap,
      handleReset,
      customizeFilterForm,
      onFilterChange: onSearchPaging,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    return (
      <React.Fragment>
        <Search {...searchProps} />
        <List {...listProps} />
      </React.Fragment>
    );
  }
}
