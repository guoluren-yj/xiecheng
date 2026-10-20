/**
 * 澄清通知入口页面
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { isUndefined, compose } from 'lodash';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import remote from 'hzero-front/lib/utils/remote';

import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { getActiveTabKey } from 'utils/menuTab';

import { fetchSupplierInfo } from '@/services/expertScoringService';

import styles from './index.less';
import TableList from './TableList';
import FilterForm from './FilterForm';
import MyQuestion from './MyQuestion';

/**
 *  SSRC.REPLY_STATUS 值集相关
 */
const promptCode = 'ssrc.expertScoring';
const organizationId = getCurrentOrganizationId();
class ReviewClarification extends Component {
  constructor(props) {
    super(props);

    const routerParams = querystring.parse(props.location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParams;

    this.state = {
      sourceFrom,
      sourceHeaderId,
      display: false,
      selectedRows: [],
      quotationHeaderId,
      selectedRowKeys: [],
      showMyQuestion: false,
      supplierInfoObj: {}, // 评审澄清供应商信息
    };
  }

  static getDerivedStateFromProps(nextProps, preState) {
    const routerParam = querystring.parse(nextProps.location.search.substr(1));
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = routerParam || {};
    if (
      sourceFrom !== preState.sourceFrom ||
      sourceHeaderId !== preState.sourceHeaderId ||
      quotationHeaderId !== preState.quotationHeaderId
      // title !== preState.title
    ) {
      return {
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
        // title,
      };
    }
    return null;
  }

  componentDidMount() {
    this.batchCode();
    this.handleSearch();
    this.queryMyQuestionList();
    this.fetchSupplierInfo();
  }

  /**
   * 查询头接口
   */
  @Bind()
  fetchSupplierInfo() {
    const { quotationHeaderId, sourceFrom } = this.state;
    if (!quotationHeaderId) return;
    fetchSupplierInfo({
      quotationHeaderId,
      clarifyIssueSourceFrom: sourceFrom,
    }).then((res) => {
      if (getResponse(res)) {
        this.setState({
          supplierInfoObj: res,
        });
      }
    });
  }

  /**
   * 获取值集
   */
  @Bind()
  batchCode() {
    const { dispatch, modelName = 'expertScoring' } = this.props;

    const lovCodes = {
      replayStatus: 'SSRC.REPLY_STATUS', // 回复状态
      questionStatus: 'SSRC.CLARIFY_ISSUE_STATUS',
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: { lovCodes },
    });
  }

  /**
   * 侧滑表格的显示与隐藏
   */

  @Bind()
  showAsideMsg() {
    const { showMyQuestion } = this.state;
    this.setState({
      showMyQuestion: !showMyQuestion,
    });
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 设置Form
   * @param {object} ref - MyQuestion组件引用
   */
  @Bind()
  onRef(ref = {}) {
    this.form1 = (ref.props || {}).form;
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealFromTime = {};
    const dealToTime = {};
    const timeFromArray = ['submittedDateFrom', 'replyEndDateFrom'];
    const timeToArray = ['submittedDateTo', 'replyEndDateTo'];
    timeFromArray.forEach((item) => {
      dealFromTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealToTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealFromTime,
      ...dealToTime,
    };
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    dispatch({
      type: `${modelName}/fetchClarifyNotifyDataList`,
      payload: {
        page,
        sourceFrom,
        organizationId,
        sourceHeaderId,
        quotationHeaderId,
        issueFrom: 'EXPERT',
        ...handleFormValues,
      },
    });
  }

  /**
   * 查询侧滑表格数据
   * @param {} page 侧滑表格分页数据
   */
  @Bind()
  queryMyQuestionList(page = {}) {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const fieldValues = isUndefined(this.form1)
      ? {}
      : filterNullValueObject(this.form1.getFieldsValue());
    const payload = {
      page,
      sourceFrom,
      sourceHeaderId,
      quotationHeaderId,
      ...fieldValues,
    };

    dispatch({
      type: `${modelName}/queryMyQuestionList`,
      payload,
    });
  }

  /**
   * 新建
   */
  @Bind()
  create(shuldLoad) {
    const {
      history,
      location: { pathname, search: datas = '' },
      dispatch,
      modelName = 'expertScoring',
    } = this.props;

    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        clarifyNotifyQuestionList: [],
        notifyQuestionListPagenation: {},
      },
    });
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const search = querystring.stringify({
      shuldLoad,
      sourceFrom,
      sourceHeaderId,
      quotationHeaderId,
      backPath: `${pathname}${datas}`,
    });
    history.push({
      pathname: `${getActiveTabKey()}/review-clarification-create`,
      search,
    });
  }

  /**
   * deleteRecords - 删除记录
   */
  @Bind()
  deleteRecords() {
    const { dispatch, modelName = 'expertScoring' } = this.props;
    const { selectedRowKeys } = this.state;
    dispatch({
      type: `${modelName}/deleteQuestionRows`,
      payload: {
        deleteIds: selectedRowKeys,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryMyQuestionList();
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  /**
   * 我提出的问题多选
   * @param {*} selectedRowKeys
   * @param {*} selectedRows
   */
  @Bind()
  onCheckedChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  render() {
    const { modelName = 'expertScoring' } = this.props;
    const {
      [modelName]: {
        myQuestionList = [],
        myQuestionListPagenation,
        code: { replayStatus = [], questionStatus = [] },
        clarifyNotifyDataListPagination,
        clarifyNotifyDataList: dataSource = [],
      },
      history,
      isLoading,
      dispatch,
      loadingDelete,
      bidStatus = [],
      loadingMyQuestion,
      sourceMethod = [],
      quotationType = [],
      auctionDirection = [],
      location: { pathname, search = '' },
      expertReviewClarification,
    } = this.props;
    const {
      showMyQuestion,
      selectedRows,
      selectedRowKeys,
      supplierInfoObj: { supplierCompanyNum, supplierCompanyName } = {},
    } = this.state;
    const formProps = {
      bidStatus,
      replayStatus: replayStatus.filter((item) => item.value !== 'NEW'),
      sourceMethod,
      quotationType,
      auctionDirection,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
    };
    const tableProps = {
      search,
      history,
      pathname,
      isLoading,
      dataSource,
      pagination: clarifyNotifyDataListPagination,
      onChange: this.handleSearch,
      remote: expertReviewClarification,
    };
    const myQuestionProps = {
      dispatch,
      modelName,
      selectedRows,
      questionStatus,
      loadingDelete,
      showMyQuestion,
      selectedRowKeys,
      onRef: this.onRef,
      loadingMyQuestion,
      jumpTo: this.create,
      dataSource: myQuestionList,
      onDelete: this.deleteRecords,
      showAsideMsg: this.showAsideMsg,
      pagination: myQuestionListPagenation,
      onCheckedChange: this.onCheckedChange,
      onSearchMyQuestion: this.queryMyQuestionList,
      onChange: (page) => this.queryMyQuestionList(page),
    };
    const routerParams = querystring.parse(search.substr(1));
    const { backPath = '' } = routerParams;
    return (
      <div>
        <Header
          title={intl.get('ssrc.expertScoring.view.message.title.reviewClarify').d('评审澄清')}
          backPath={backPath}
        >
          <Button type="primary" icon="plus" onClick={() => this.create(0)}>
            {intl.get(`${promptCode}.model.expertScoring.questionCreate`).d('问题创建')}
          </Button>
          <Button type="default" onClick={this.showAsideMsg}>
            {intl.get(`${promptCode}.model.expertScoring.askQuestion`).d('我提出的问题')}
          </Button>
        </Header>
        <Content>
          <h3 className={styles.title}>
            {supplierCompanyNum ? `${supplierCompanyNum}-` : ''}
            {supplierCompanyName ?? ''}
          </h3>

          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <MyQuestion {...myQuestionProps} />
      </div>
    );
  }
}

const HOCComponent = (Comp) => {
  return compose(
    connect(({ expertScoring, loading }) => ({
      expertScoring,
      isLoading: loading.effects['expertScoring/fetchClarifyNotifyDataList'],
      loadingMyQuestion: loading.effects['expertScoring/queryMyQuestionList'],
      loadingDelete: loading.effects['expertScoring/deleteQuestionRows'],
    })),
    formatterCollections({
      code: ['ssrc.expertScoring'],
    }),
    remote({
      code: 'SSRC_EXPERT_REVIEW_CLARIFICATION',
      name: 'expertReviewClarification',
    })
  )(Comp);
};

export default HOCComponent(ReviewClarification);

export { HOCComponent, ReviewClarification };
