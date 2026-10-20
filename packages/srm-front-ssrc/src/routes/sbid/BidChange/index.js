/**
 * routes - 招标变更/数据列表
 * @date: 2020-02-06
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { routerRedux } from 'dva/router';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import FilterForm from './FilterForm';
import TableList from './TableList';

@formatterCollections({ code: ['ssrc.bidHall', 'ssrc.bidChange', 'ssrc.bidTask', 'ssrc.common'] })
@connect(({ bidChange, commonModel, loading }) => ({
  bidChange,
  commonModel,
  fetchDataLoading: loading.effects['bidChange/fetchDataList'],
  organizationId: getCurrentOrganizationId(),
}))
export default class BidChange extends Component {
  form;

  componentDidMount() {
    const {
      bidChange: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
  }

  @Bind()
  handleSearch(page) {
    const { dispatch, organizationId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    dispatch({
      type: 'bidChange/fetchDataList',
      payload: {
        page,
        organizationId,
        ...fieldValues,
      },
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  resetFields() {
    this.form.resetFields();
  }

  @Bind()
  navigateDetail(record = {}) {
    const { dispatch } = this.props;
    const search = querystring.stringify({
      isAlterFlag: record.isAlterFlag,
      subjectMatterRule: record.subjectMatterRule,
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-change/detail/${record.bidHeaderId}`,
        search,
      })
    );
  }

  render() {
    const {
      dispatch,
      fetchDataLoading,
      bidChange: { dataList = [], pagination = {} },
      match: { path = null },
    } = this.props;

    const formProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };

    const tableProps = {
      path,
      dispatch,
      pagination,
      dataSource: dataList,
      loading: fetchDataLoading,
      onChange: this.handleSearch,
      navigateDetail: this.navigateDetail,
    };

    return (
      <React.Fragment>
        <Header title={intl.get(`ssrc.bidChange.view.message.title.bidChange`).d('招标变更')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
      </React.Fragment>
    );
  }
}
