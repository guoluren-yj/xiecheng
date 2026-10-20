/**
 * Clause -条目配置
 * @date: 2019-01-28
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Content, Header } from 'components/Page';
import ListTable from './ListTable';
import SearchForm from './SearchForm';

/**
 * 条目配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} dashboard - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const promptCode = 'hpfm.dashboardClause';
@connect(({ dashboardClause, loading }) => ({
  dashboardClause,
  loading: loading.effects['dashboardClause/queryClause'],
  saving: loading.effects['dashboardClause/addClause'],
  detailLoading: loading.effects['dashboardClause/queryClauseDetail'],
}))
@formatterCollections({ code: ['hpfm.dashboardClause', 'entity.tenant'] })
export default class DashboardClause extends Component {
  constructor(props) {
    super(props);
    this.searchForm = React.createRef();
  }

  componentDidMount() {
    const {
      dispatch,
      dashboardClause: { clausePagination = [] },
    } = this.props;
    dispatch({
      type: 'dashboardClause/init',
    });
    this.handleSearch({ page: clausePagination });
  }

  /**
   * 新建条目配置
   */
  @Bind()
  handleCreateHeader() {
    this.props.history.push(`/hpfm/dashboard-clause/create`);
  }

  /**
   * 查询条目配置列表
   * @param {Object} params
   */
  @Bind()
  handleSearch(params = {}) {
    const { dispatch } = this.props;
    const form =
      this.searchForm.current &&
      this.searchForm.current.props &&
      this.searchForm.current.props.form;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'dashboardClause/queryClause',
      payload: {
        ...params,
        ...filterValues,
      },
    });
  }

  @Bind()
  handleEdit(record) {
    this.props.history.push(`/hpfm/dashboard-clause/detail/${record.clauseId}`);
  }

  @Bind()
  handleTableChange(page) {
    this.handleSearch(page);
  }

  render() {
    const {
      loading,
      dashboardClause: { clauseList = [], clausePagination = {}, flags },
    } = this.props;
    const filterProps = {
      flags,
      onSearch: this.handleSearch,
      wrappedComponentRef: this.searchForm,
    };
    const listProps = {
      loading,
      dataSource: clauseList,
      showEditModal: this.handleEdit,
      pagination: clausePagination,
      onChange: this.handleTableChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.dashboardClause`).d('条目配置')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateHeader}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <SearchForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
