/**
 * Clarification - 查看问题
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { filterNullValueObject } from 'utils/utils';
import queryString from 'querystring';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import ClarificationForm from './ClarificationForm';
import ClarificationTable from './ClarificationTable';

@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  clarificationList: supplierBidQuery.clarificationList,
  clarificationPagination: supplierBidQuery.clarificationPagination,
  clarificationLoading: loading.effects['supplierBidQuery/fetchClarificationList'],
}))
export default class Clarification extends React.Component {
  componentDidMount() {
    const { clarificationPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    if (routerParam.flag === '1') {
      if (!isUndefined(this.form)) {
        this.form.resetFields();
      }
    }
    this.handleClarificationList(clarificationPagination);
  }

  /**
   * 绑定ref
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查看澄清函
   */
  @Bind()
  handleClarificationList(page = {}) {
    const { dispatch, routerParam } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const searchData = {
      ...filterValues,
      submittedDateFrom: filterValues.submittedDateFrom
        ? filterValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: filterValues.submittedDateTo
        ? filterValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'supplierBidQuery/fetchClarificationList',
      payload: {
        page,
        sourceType: 'BID',
        sourceId: routerParam.bidHeaderId,
        ...searchData,
      },
    });
  }

  /**
   * 跳转澄清函详情
   */
  @Bind()
  handleDetails(record) {
    const { history, match, routerParam } = this.props;
    history.push(
      `/ssrc/supplier-bid-query/clarification-details/${record.clarifyId}?quotationHeaderId=${match.params.quotationHeaderId}&bidNum=${routerParam.bidNum}&bidTitle=${routerParam.bidTitle}&bidHeaderId=${routerParam.bidHeaderId}`
    );
  }

  render() {
    const {
      clarificationLoading,
      clarificationList = {},
      clarificationPagination = {},
    } = this.props;
    const clarificationFormProps = {
      onRef: this.handleBindRef,
      onSearch: this.handleClarificationList,
    };
    const clarificationTableProps = {
      rowKey: 'clarificationId',
      loading: clarificationLoading,
      dataSource: clarificationList.content,
      pagination: clarificationPagination,
      onChange: this.handleClarificationList,
      onClick: this.handleDetails,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <ClarificationForm {...clarificationFormProps} />
        </div>
        <ClarificationTable {...clarificationTableProps} />
      </React.Fragment>
    );
  }
}
