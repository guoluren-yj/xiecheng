/*
 * orderEvaluation - 订单评价
 * @date: 2018/10/16 10:09:34
 * @author: MJQ <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { getCurrentUser, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN } from 'utils/constants';
import List from './List';
import Search from './Search';

// const messagePrompt = 'sodr.orderApproval.view.message';
// const buttonPrompt = 'sodr.view.button';
/**
 * 订单审批
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
@formatterCollections({
  code: [
    'sodr.orderApproval',
    'sodr.sendOrder',
    'sodr.common',
    'entity.order',
    'entity.business',
    'entity.company',
    'entity.supplier',
    'spfm.dashboard',
    'sinv.inventoryInquiry',
    'spfm.configServer',
    'sinv.acceptanceSheetCreate',
    'small.groupGoodsManage',
    'sodr.quotePurchaseRequisition',
    'sprm.purchaseReqCreation',
  ],
})
@withCustomize({
  unitCode: ['SODR.ORDER_EVALUATION.FILTER', 'SODR.ORDER_EVALUATION.GRID'],
})
@connect(({ loading, orderEvaluation }) => ({
  loadingList: loading.effects['orderEvaluation/queryList'],
  approving: loading.effects['orderEvaluation/passApprovalList'],
  rejecting: loading.effects['orderEvaluation/rejectApprovalList'],
  orderEvaluation,
  supplierTenantId: getCurrentUser().organizationId,
}))
export default class OrderEvaluation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      orderEvaluation: { listPagination = {} },
    } = this.props;
    this.props.dispatch({
      type: 'orderEvaluation/fetchEnum',
    });
    if (_back === -1) {
      this.handleSearch(listPagination);
    } else {
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
   * 查询邀约汇总列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}, isChangePage = false) {
    const {
      dispatch,
      orderEvaluation: {
        listPagination: { total },
      },
    } = this.props;
    const filterValues =
      (this.filterForm && filterNullValueObject(this.filterForm.getFieldsValue())) || {};
    const handleFormValues = this.handleFormQuery(filterValues);
    const payload = {
      page,
      evaluationFlag: 0,
      ...handleFormValues,
      customizeUnitCode: 'SODR.ORDER_EVALUATION.GRID,SODR.ORDER_EVALUATION.FILTER',
      asyncCountFlag: 'DEFAULT',
      ...(isChangePage ? { oldTotalElements: total } : null),
    };
    dispatch({
      type: 'orderEvaluation/queryList',
      payload,
    }).then((res) => {
      if (res && res.needCountFlag === 'Y') {
        dispatch({
          type: 'orderEvaluation/queryListPage',
          payload,
        });
      }
    });
  }

  // 跳转详情
  @Bind()
  onHandleToDetail(poHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sodr/order-evaluation/detail/${poHeaderId}`,
      })
    );
  }

  render() {
    const {
      loadingList,
      orderEvaluation: { listPagination, evaluationList, enumMap },
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const filterProps = {
      enumMap,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      pagination: listPagination,
      dataSource: evaluationList,
      loading: loadingList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      customizeTable,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sodr.common.model.common.poEvaluation`).d('订单评价')} />
        <Content>
          <Search {...filterProps} />
          <List {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
