/*
 * index - 订单发布
 * @date: 2018/11/19 18:56:39
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
import { getCurrentUser, filterNullValueObject } from 'utils/utils';
// import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import List from './List';
import Search from './Search';

/**
 * 订单发布
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

@withCustomize({
  unitCode: ['SODR.ORDER_SIGN.GRID', 'SODR.ORDER_SIGN.LIST.HEADER_BY_REQUEST'],
})
@formatterCollections({
  code: [
    'sodr.common',
    'entity.item',
    'entity.order',
    'entity.company',
    'entity.supplier',
    'entity.business',
    'sodr.orderSign',
    'sodr.orderRelease',
    'sodr.receivedOrder',
  ],
})
@connect(({ loading, orderSign }) => ({
  loadingList: loading.effects['orderSign/queryOrderReleaseList'],
  orderSign,
  supplierTenantId: getCurrentUser().organizationId,
}))
export default class ConfirmOrder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedListRows: [],
      // tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      orderSign: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.props.dispatch({
        type: 'orderSign/init',
      });
      this.handleSearch();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues = {}) {
    const dealTime = {};
    const timeArray = ['erpCreationDateStart', 'erpCreationDateEnd'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 查询订单发布列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, sorter, isChangePage = false) {
    const {
      dispatch,
      orderSign: {
        listPagination: { total },
      },
    } = this.props;
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    const payload = {
      page,
      ...handleFormValues,
      customizeUnitCode: 'SODR.ORDER_SIGN.GRID,SODR.ORDER_SIGN.LIST.HEADER_BY_REQUEST',
      sort: sorter,
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderSign/queryOrderReleaseList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderSign/queryOrderReleaseListPage',
          payload,
        });
      }
    });
    this.setState({ selectedListRows: [] });
  }

  /**
   * 跳转到订单发布详情页
   */
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-sign/detail/${poHeaderId}`,
      })
    );
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleListRowSelectChange(newSelectedRowKeys, newSelectedRows = []) {
    this.setState({ selectedListRows: newSelectedRows });
  }

  render() {
    const { selectedListRows } = this.state;
    const {
      loadingList,
      // publishing,
      customizeTable,
      customizeFilterForm,
      orderSign: { listPagination, orderList, enumMap } = {},
    } = this.props;
    const selectedRowKeys = selectedListRows.map((item) => item.poHeaderId);
    const listRowSelection = {
      selectedRowKeys,
      onChange: this.handleListRowSelectChange,
    };
    const filterProps = {
      enumMap,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      customizeTable,
      pagination: listPagination,
      dataSource: orderList,
      loading: loadingList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      rowSelection: listRowSelection,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sodr.orderSign.view.message.headerTitle`).d('订单签署')} />
        <Content>
          <Search {...filterProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
