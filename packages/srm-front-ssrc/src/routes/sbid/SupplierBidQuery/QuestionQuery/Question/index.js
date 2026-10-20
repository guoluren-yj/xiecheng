/**
 * Question - 查看问题
 * @date: 2019-6-19
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';
import { filterNullValueObject } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import QuestionForm from './QuestionForm';
import QuestionTable from './QuestionTable';

@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  code: supplierBidQuery.code,
  questionLoading: loading.effects['supplierBidQuery/fetchQuestionsubmitted'],
  questionsubmittedList: supplierBidQuery.questionsubmittedList,
  questionsubmittedPagination: supplierBidQuery.questionsubmittedPagination,
}))
export default class Question extends React.Component {
  componentDidMount() {
    const { questionsubmittedPagination, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    if (routerParam.flag === '1') {
      if (!isUndefined(this.form)) {
        this.form.resetFields();
      }
    }
    this.handleQuestionList(questionsubmittedPagination);
    this.fetchStatusvalues();
  }

  /**
   * 查询状态值集
   */
  @Bind()
  fetchStatusvalues() {
    const { dispatch } = this.props;
    const lovCodes = {
      issueLineStatus: 'SSRC.ISSUE_LINE_STATUS',
      clarifyType: 'SSRC.CLARIFY_TYPE',
    };
    dispatch({
      type: 'supplierBidQuery/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查看问题
   */
  @Bind()
  handleQuestionList(page = {}) {
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
      type: 'supplierBidQuery/fetchQuestionsubmitted',
      payload: {
        page,
        sourceType: 'BID',
        sourceId: routerParam.bidHeaderId,
        ...searchData,
      },
    });
  }

  /**
   * 跳转问题详情
   */
  @Bind()
  handleQuestionDetails(record) {
    const { history, match, routerParam } = this.props;
    history.push(
      `/ssrc/supplier-bid-query/question-details/${record.issueHeaderId}?quotationHeaderId=${match.params.quotationHeaderId}&bidNum=${routerParam.bidNum}&bidTitle=${routerParam.bidTitle}&bidHeaderId=${routerParam.bidHeaderId}`
    );
  }

  /**
   * 跳转澄清函详情
   */
  @Bind()
  handleClarificationDetails(record) {
    const { history, match, routerParam } = this.props;
    history.push(
      `/ssrc/supplier-bid-query/clarification-details/${record.clarifyId}?quotationHeaderId=${match.params.quotationHeaderId}&bidNum=${routerParam.bidNum}&bidTitle=${routerParam.bidTitle}&bidHeaderId=${routerParam.bidHeaderId}`
    );
  }

  render() {
    const {
      code,
      questionLoading,
      questionsubmittedList = {},
      questionsubmittedPagination = {},
    } = this.props;
    const questionFormProps = {
      onRef: this.handleBindRef,
      onSearch: this.handleQuestionList,
      questionStatus: code.issueLineStatus,
    };
    const questionTableProps = {
      code,
      rowKey: 'questionId',
      loading: questionLoading,
      dataSource: questionsubmittedList.content,
      pagination: questionsubmittedPagination,
      onChange: this.handleQuestionList,
      handleQuestionDetails: this.handleQuestionDetails,
      handleClarificationDetails: this.handleClarificationDetails,
    };
    return (
      <React.Fragment>
        <div className="table-list-search">
          <QuestionForm {...questionFormProps} />
        </div>
        <QuestionTable {...questionTableProps} />
      </React.Fragment>
    );
  }
}
