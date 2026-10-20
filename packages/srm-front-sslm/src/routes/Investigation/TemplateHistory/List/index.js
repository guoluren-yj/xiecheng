/*
 * 调查表模板历史版本查询
 * @date: 2018/08/07 15:12:06
 * @author: yunqiang.wu yunqiang.wu@hang-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import notification from 'utils/notification';

import { Content, Header } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 租户级调查模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemHistoryOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: 'sslm.investTemHisOrg' })
@Form.create({ fieldNameProp: null })
@connect(({ loading, investigationTemHistoryOrg }) => ({
  investigationTemHistoryOrg,
  loading: loading.effects['investigationTemHistoryOrg/queryInvestigateList'],
  add: loading.effects['investigationTemHistoryOrg/addInvestigate'],
  saving: loading.effects['investigationTemHistoryOrg/changeInvestigate'],
  effecting: loading.effects['investigationTemHistoryOrg/handleEffect'],
}))
@withRouter
@cacheComponent({ cacheKey: '/sslm/investigation-template-history/list' })
export default class InvestigationTemHistoryOrg extends Component {
  orgForm;

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: (e) => e,
  };

  state = {
    expandForm: false,
  };

  listRef;

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      investigationTemHistoryOrg: { pagination },
    } = this.props;
    if (_back === -1) {
      this.handleSearch({
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
    } else {
      this.props.dispatch({
        type: 'investigationTemHistoryOrg/init',
      });
      this.handleSearch();
    }
  }

  /**
   * 查询调查表模板列表
   * @param {obj} fields 查询字段
   */
  @Bind()
  handleSearch(pagination = {}) {
    const { dispatch } = this.props;
    const {
      form: { validateFields },
    } = this.props;
    validateFields((err, fieldsValue) => {
      const { startDate, endDate } = fieldsValue;
      dispatch({
        type: 'investigationTemHistoryOrg/queryInvestigateList',
        payload: {
          ...fieldsValue,
          ...pagination,
          startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
          endDate: endDate ? endDate.format(DATETIME_MAX) : undefined,
        },
      });
    });
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({ expandForm: !expandForm });
  }

  /**
   * 生效选中行
   */
  @Bind()
  handleEffect(selectedRowKeys) {
    const {
      dispatch,
      investigationTemHistoryOrg: { pagination },
    } = this.props;
    dispatch({
      type: 'investigationTemHistoryOrg/handleEffect',
      payload: selectedRowKeys,
    }).then((data) => {
      if (data) {
        notification.success();
        this.handleSearch({
          page: pagination.current - 1,
          size: pagination.pageSize,
        });
      }
    });
  }

  /**
   * 跳转到调查表明细页
   * @param {Number} investigateTemplateId
   */
  @Bind()
  onHandleToTemplateDetail(investigateTemplateId) {
    this.props.history.push(`/sslm/investigation-template-history/detail/${investigateTemplateId}`);
  }

  /**
   * 数据查询
   * @param {Object} pagination 查询参数
   * @param {String} [pagination.page] - 分页查询-页码
   * @param {String} [pagination.size] - 分页查询-分页大小
   */
  @Bind()
  handleStandardTableChange(pagination) {
    this.handleSearch({
      page: pagination.current - 1,
      size: pagination.pageSize,
    });
  }

  render() {
    const {
      loading,
      effecting,
      form,
      investigationTemHistoryOrg: { investigateList, pagination, investigateTypes },
    } = this.props;
    const { expandForm } = this.state;
    const filterProps = {
      form,
      loading,
      expandForm,
      investigateTypes,
      onFilterChange: this.handleSearch,
      onToggle: this.toggleForm,
    };
    const listProps = {
      pagination,
      investigateTypes,
      loading,
      effecting,
      dataSource: investigateList,
      onSearchPaging: this.handleStandardTableChange,
      onHandleChangeColumn: this.onHandleChangeColumn,
      onHandleToTemplateDetail: this.onHandleToTemplateDetail,
      onHandleAllocateToCompany: this.onHandleAllocateToCompany,
      onHandleReferenceTemplate: this.onHandleReferenceTemplate,
      onHandleLatest: this.handleEffect,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sslm.investTemHisOrg.view.versionQuery.title`)
            .d('调查表模板历史版本查询')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable
            onRef={(ref) => {
              this.listRef = ref;
            }}
            {...listProps}
          />
        </Content>
      </React.Fragment>
    );
  }
}
