/*
 * InvestigationApproval - 调查表审批页面
 * @date: 2018/08/07 14:54:51
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import { DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Content, Header } from 'components/Page';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 调查表审批页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationApproval - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ loading, investigationApproval }) => ({
  loading: loading.effects['investigationApproval/fetchApprovalList'],
  investigationApproval,
}))
@formatterCollections({
  code: ['sslm.investigCorrelat', 'sslm.common'],
})
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_APPROVAL_LIST.TABLE_LIST',
    'SSLM.INVESTIGATION_APPROVAL_LIST.SEARCH_FORM',
  ],
})
export default class InvestigationApproval extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      investigationApproval: { pagination = {} },
    } = this.props;
    this.props.dispatch({
      type: 'investigationApproval/init',
    });
    if (_back === -1) {
      this.handleSearch(pagination);
    } else {
      this.handleSearch();
    }
  }

  /**
   * 查询邀约汇总列表
   * @param {Object} page 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { submitDateFrom, submitDateTo } = filterValues;
    dispatch({
      type: 'investigationApproval/fetchApprovalList',
      payload: {
        page,
        ...filterValues,
        submitDateFrom: submitDateFrom ? submitDateFrom.format(DATETIME_MIN) : undefined,
        submitDateTo: submitDateTo ? submitDateTo.format(DATETIME_MIN) : undefined,
        customizeUnitCode:
          'SSLM.INVESTIGATION_APPROVAL_LIST.TABLE_LIST,SSLM.INVESTIGATION_APPROVAL_LIST.SEARCH_FORM',
      },
    });
  }

  @Bind()
  onHandleToDetail(investgHeaderId, investigateTemplateId) {
    this.props.history.push(
      `/sslm/investigation-approval/detail?investgHeaderId=${investgHeaderId}&investigateTemplateId=${investigateTemplateId}`
    );
  }

  render() {
    const {
      investigationApproval: { pagination, approvalList, enumMap },
      loading,
      customizeFilterForm,
      custLoading,
      customizeTable,
    } = this.props;
    const filterProps = {
      enumMap,
      loading,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      customizeFilterForm,
      custLoading,
      code: 'SSLM.INVESTIGATION_APPROVAL_LIST.SEARCH_FORM',
    };
    const listProps = {
      pagination,
      dataSource: approvalList,
      loading,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
      code: 'SSLM.INVESTIGATION_APPROVAL_LIST.TABLE_LIST',
      custLoading,
      customizeTable,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.investigCorrelat.view.message.approval.title`).d('调查表审批')}
        />
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
