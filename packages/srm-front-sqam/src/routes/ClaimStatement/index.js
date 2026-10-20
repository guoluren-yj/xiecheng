/**
 * 索赔单申述
 * @date: 2019-11-4
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import remotes from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

const customizeUnitCodes = ['SQAM.CLAIM_STATEMENT.FILTER', 'SQAM.CLAIM_STATEMENT.GRID'].join();

/**
 * 索赔单申述入口
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@remotes({
  code:"SSLM_CLAIM_STATEMENT_LIST"
})
@connect(({ claimStatement, loading }) => ({
  claimStatement,
  loading: {
    fetch: loading.effects['claimStatement/StatementFetchDataList'],
    release: loading.effects['claimStatement/releaseClaimStatement'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.business',
    'entity.organization',
    'entity.company',
    'entity.roles',
  ],
})
export default class ClaimDeduction extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      selectedRows:[],
      selectedRowKeys:[],
    };
  }

  form;

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleSelectRow(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  clearSelectRow(){
    this.setState({ selectedRowKeys:[], selectedRows:[] });
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    let filterValues = {};
    if (!isUndefined(this.form)) {
      const formValue = this.form.getFieldsValue();
      const { supplierCompanyIdStash, ...vals } = formValue;
      const values = {
        ...vals,
        supplierCompanyId: supplierCompanyIdStash,
        feedbackDateFrom:
          formValue.feedbackDateFrom && formValue.feedbackDateFrom.format(DATETIME_MIN),
        feedbackDateTo: formValue.feedbackDateTo && formValue.feedbackDateTo.format(DATETIME_MAX),
        appealedDateFrom:
          formValue.appealedDateFrom && formValue.appealedDateFrom.format(DATETIME_MIN),
        appealedDateAfter:
          formValue.appealedDateAfter && formValue.appealedDateAfter.format(DATETIME_MAX),
      };
      filterValues = filterNullValueObject(values);
    }
    dispatch({
      type: 'claimStatement/StatementFetchDataList',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
        customizeUnitCode: customizeUnitCodes,
      },
    });
  }

  /**
   * 明细维护
   * @param {!object} record
   */
  @Bind()
  handleDirectToDetail(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/claimStatement/detail/${record.formHeaderId}`,
      })
    );
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterForm = this.form;
    const filterValues = isUndefined(filterForm)
      ? {}
      : filterNullValueObject(filterForm.getFieldsValue());
    return filterValues;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {remote, claimStatement = {}, loading, tenantId } = this.props;
    const {selectedRows, selectedRowKeys} = this.state;
    const { indexListDatas, pagination } = claimStatement;
    const filterProps = {
      tenantId,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const listProps = {
      remote,
      pagination,
      selectedRows,
      selectedRowKeys,
      parentThis: this,
      loading: loading.fetch,
      dataSource: indexListDatas,
      onChange: this.handleSearch,
      onDetail: this.handleDirectToDetail,
      onSelectRow: this.handleSelectRow,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sqam.common.view.claimStatementDeal').d('索赔单申诉处理')} >
          {remote.render("SSLM_CLAIM_STATEMENT_LIST_HEADER_BTNS",null,{_this:this})}
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
