/*
 * InvestigationWrite - 调查表填写
 * @date: 2018/08/28 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';
import querystring from 'querystring';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import { DATETIME_MIN } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 调查表填写页面
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
@connect(({ loading, investigationWrite }) => ({
  loading: loading.effects['investigationWrite/fetchWriteList'],
  investigationWrite,
}))
@formatterCollections({
  code: ['sslm.investigCorrelat', 'entity.customer', 'entity.company', 'sslm.common'],
})
export default class InvestigationWrite extends Component {
  constructor(props) {
    super(props);
    const isPub = props.location.pathname.match('/pub/');
    const routerParams = querystring.parse(props.location.search.substr(1));
    this.state = {
      isPub,
      routerParams,
    };
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      investigationWrite: { pagination = {} },
    } = this.props;
    this.props.dispatch({
      type: 'investigationWrite/init',
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
    const { beginDate, endDate } = filterValues;
    dispatch({
      type: 'investigationWrite/fetchWriteList',
      payload: {
        page,
        ...filterValues,
        beginDate: beginDate ? beginDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
      },
    });
  }

  @Bind()
  onHandleToDetail(investgHeaderId, investigateTemplateId, tenantId, tenantNum) {
    const { isPub, routerParams } = this.state;
    const pathname = `${isPub ? '/pub' : ''}/sslm/investigation-write/detail`;
    const historyBack = `${
      isPub ? '/pub' : ''
    }/sslm/investigation-write/list?${querystring.stringify(routerParams)}`;
    this.props.history.push({
      pathname,
      search: querystring.stringify({
        tenantNum,
        investgHeaderId,
        investigateTemplateId,
        organizationId: tenantId,
        ...routerParams,
      }),
      state: { historyBack },
    });
  }

  render() {
    const {
      investigationWrite: { pagination, investigationList, inviteType, processStatusList },
      loading,
    } = this.props;
    const filterProps = {
      loading,
      inviteType,
      processStatusList,
      onFilterChange: this.handleSearch,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      pagination,
      loading,
      dataSource: investigationList,
      editLine: this.editLine,
      searchPaging: this.handleSearch,
      handleToDetail: this.onHandleToDetail,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.investigCorrelat.view.message.title.investWrite`).d('调查表填写')}
        />
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
