/*
 * index - 我收到的订单按明细查询页面
 * @date: 2018/10/09 14:56:50
 * @author: LZH <zhaohui-liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
// import { connect } from 'dva';
import { Form } from 'hzero-ui';
import PropTypes from 'prop-types';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
// import FilterForm from './FilterForm';
import Search from './Search';
import ListTable from './ListTable';
import { formatAumont } from '@/routes/components/utils';

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
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sodr.receivedOrder',
    'entity.company',
    'entity.customer',
    'entity.business',
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
   * 查询
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}, otherParams = {}, clearFlag = false, radioTabParam, sorter) {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch(page, otherParams, clearFlag, radioTabParam, sorter);
    }
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
      form,
      handleReset,
      dataSource,
      loading,
      tenantId,
      dispatch,
      pagination,
      doubleUnitEnabled,
      customizeFilterForm,
      customizeTable,
      // supplierTenantId,
      // detailSelectedRowsList,
      rowSelection,
      enumMap = {},
      openBOMModal,
    } = this.props;
    const filterProps = {
      form,
      enumMap,
      tenantId,
      handleReset,
      customizeFilterForm,
      // supplierTenantId,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.searchForm = node;
      },
    };
    const listProps = {
      dispatch,
      loading,
      dataSource,
      pagination,
      rowSelection,
      customizeTable,
      doubleUnitEnabled,
      searchPaging: this.handleSearch,
      handleToDetail: this.redirectToDetail,
      amountFinancialPrecision: this.amountFinancialPrecision,
      openBOMModal,
    };
    return (
      <React.Fragment>
        <Search {...filterProps} />
        <ListTable {...listProps} />
      </React.Fragment>
    );
  }
}
