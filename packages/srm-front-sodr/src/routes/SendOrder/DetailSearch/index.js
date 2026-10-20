/*
 * index - 按明细查询
 * @date: 2018/08/08 14:07:49
 * @author: liu zhaohui <zhaohui.liu@hand-china.com>, KIRIN <qilin.feng@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { stringify } from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import { formatAumont } from '@/routes/components/utils';

import Search from './Search';
import ListTable from './ListTable';

/**
 * 按明细查询页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} dataSource - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} handleSearch 查询
 * @reactProps {Function} handleStandardTableChange 分页查询
 * @reactProps {Function} handleDetailUrgent 明细加急
 * @reactProps {Function} handleCancelDetailUrgent 明细取消加急
 * @return React.element
 */
@formatterCollections({
  code: [
    'sodr.sendOrder',
    'entity.company',
    'entity.business',
    'entity.supplier',
    'entity.order',
    'entity.item',
    'entity.roles',
    'sodr.common',
  ],
})
export default class DetailSearch extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    const { onSearch = (e) => e, pagination } = this.props;
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

  /**
   * 调整金额精度
   * @param {Object} record
   * @param {number} amount
   */
  @Bind()
  amountFinancialPrecision(record, amount) {
    const { priceSensitiveFlag, financialPrecision, poSourcePlatform } = record;
    if (priceSensitiveFlag === 1) {
      return '****';
    } else {
      return ['SRM', 'CATALOGUE', 'SHOP'].includes(poSourcePlatform)
        ? formatAumont(amount, financialPrecision, true)
        : amount;
    }
  }

  render() {
    const {
      handleReset,
      onSearch,
      loading,
      pagination,
      dataSource,
      dispatch,
      rowSelection,
      enumMap = {},
      customizeFilterForm,
      customizeTable,
      doubleUnitEnabled,
      openBOMModal,
      remote,
    } = this.props;
    const tableProps = {
      dispatch,
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      openBOMModal,
      doubleUnitEnabled,
      searchPaging: onSearch,
      handleToDetail: this.redirectToDetail,
      amountFinancialPrecision: this.amountFinancialPrecision,
    };
    const searchDrawerProps = {
      enumMap,
      handleReset,
      onSearch,
      customizeFilterForm,
      onRef: (node) => {
        this.searchForm = node;
      },
      remote,
    };
    return (
      <React.Fragment>
        <Search {...searchDrawerProps} />
        <ListTable {...tableProps} />
      </React.Fragment>
    );
  }
}
