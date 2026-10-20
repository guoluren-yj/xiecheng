/**
 * Question - 供应商问题维护
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Tabs, Button } from 'hzero-ui';
import queryString from 'querystring';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { DATETIME_MAX, DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getClarifyHeaderInfo } from '@/services/inquiryHallService';
import styles from './index.less';
import MaintainForm from './Maintain/MaintainForm';
import MaintainTable from './Maintain/MaintainTable';
import ClarificationForm from './Clarification/ClarificationForm';
import ClarificationTable from './Clarification/ClarificationTable';
import ReviewForm from './ReviewClarification/ReviewForm';
import ReviewTable from './ReviewClarification/ReviewTable';

const { TabPane } = Tabs;

const promptCode = 'ssrc.supplierBid';
@formatterCollections({
  code: ['ssrc.supplierBid', 'ssrc.common'],
})
@connect(({ supplierBid, loading }) => ({
  supplierBid,
  code: supplierBid.code,
  reviewList: supplierBid.reviewList,
  reviewPagination: supplierBid.reviewPagination,
  questionMaintainList: supplierBid.questionMaintainList,
  questionMaintainPagination: supplierBid.questionMaintainPagination,
  maintainLoading: loading.effects['supplierBid/fetchQuestionMaintain'],
  clarificationList: supplierBid.clarificationList,
  clarificationPagination: supplierBid.clarificationPagination,
  clarificationLoading: loading.effects['supplierBid/fetchClarificationList'],
  reviewLoading: loading.effects['supplierBid/fetchReviewList'],
}))
@cacheComponent({ cacheKey: '/ssrc/supplier-bid-hall/questissson-list/:quotationHeaderId' })
export default class Question extends React.Component {
  constructor(props) {
    super(props);

    const routerParam = queryString.parse(props.location.search.substr(1));
    const { supplierCompanyId = null } = routerParam || {};

    this.state = {
      activeKey: 'question',
      bidHeaderId: null, // 招标头id
      supplierCompanyId: supplierCompanyId || null, // 供应商公司id
      headerInfo: {},
    };
  }

  maintainForm; // 问题维护的查询form

  clarificationForm; // 澄清函的查询form

  componentDidMount() {
    const routerParam = queryString.parse(this.props.location.search.substr(1));
    if (routerParam.flag === '1') {
      // this.setState({
      //   activeKey: 'question',
      // });
      if (!isUndefined(this.maintainForm)) {
        this.maintainForm.resetFields();
      }
      if (!isUndefined(this.clarificationForm)) {
        this.clarificationForm.resetFields();
      }
      if (!isUndefined(this.reviewForm)) {
        this.reviewForm.resetFields();
      }
    }
    this.setState({
      bidHeaderId: routerParam.bidHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
    });
    this.fetchHeaderInfo();
    const { questionMaintainPagination, clarificationPagination, reviewPagination } = this.props;
    this.handleQuestionMaintain(questionMaintainPagination);
    this.handleClarificationList(clarificationPagination);
    this.handleReviewList(reviewPagination);
    this.fetchStatusvalues();
  }

  // 查询头信息
  @Bind()
  async fetchHeaderInfo() {
    const { bidHeaderId, sourceHeaderId, tenantId } = this.getLocationSearchData();

    const data = {
      sourceHeaderId: bidHeaderId || sourceHeaderId,
      tenantId,
      sourceFrom: 'BID',
    };

    try {
      let result = await getClarifyHeaderInfo(data);
      result = getResponse(result);
      if (!result) {
        return;
      }

      this.setState({
        headerInfo: result,
      });
    } catch (e) {
      throw e;
    }
  }

  // get location search obj
  getLocationSearchData = () => {
    const { location } = this.props;
    const { search } = location || {};
    const routerParam = queryString.parse(search.substr(1));
    return routerParam || {};
  };

  /**
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate(record) {
    const { history } = this.props;
    const { supplierCompanyId, quotationHeaderId } = this.state;
    const { bidHeaderId, tenantId, bidNum } = this.getLocationSearchData();
    // 修复路由参数包含特殊字符 `#`
    const search = queryString.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      tenantId,
      bidNum,
    });
    history.push({
      pathname: '/ssrc/supplier-bid-hall/question-create',
      search,
    });
  }

  /**
   * 新建
   */
  @Bind()
  jumpPendingReplay(record) {
    const {
      history,
      location: { pathname, search },
    } = this.props;
    const { clarifyNotifyId, quotationHeaderId, sourceHeaderId } = record;
    const { tenantId, bidNum } = this.getLocationSearchData();
    const searchString = queryString.stringify({
      clarifyNotifyId,
      quotationHeaderId,
      tenantId,
      bidHeaderId: sourceHeaderId,
      backPath: `${pathname}${search}`,
      bidNum,
    });
    history.push({
      pathname: `/ssrc/supplier-bid-hall/clarification-replay`,
      search: searchString,
    });
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
      replayStatus: 'SSRC.REPLY_STATUS', // 回复状态
    };
    dispatch({
      type: 'supplierBid/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 绑定Maintain form
   */
  @Bind()
  handleMaintainRef(ref = {}) {
    this.maintainForm = (ref.props || {}).form;
  }

  /**
   * 绑定Clarification form
   */
  @Bind()
  handleClarificationRef(ref = {}) {
    this.clarificationForm = (ref.props || {}).form;
  }

  /**
   * 绑定Review form
   */
  @Bind()
  handleReviewRef(ref = {}) {
    this.reviewForm = (ref.props || {}).form;
  }

  /**
   * 问题维护查询
   */
  @Bind()
  handleQuestionMaintain(page = {}) {
    const { dispatch, match, location } = this.props;
    const routerParam = queryString.parse(location.search.substr(1));
    const { supplierCompanyId = null } = routerParam || {};
    const filterValues = isUndefined(this.maintainForm)
      ? {}
      : filterNullValueObject(this.maintainForm.getFieldsValue());
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
      type: 'supplierBid/fetchQuestionMaintain',
      payload: {
        page,
        sourceType: 'BID',
        sourceId: match.params.quotationHeaderId,
        supplierCompanyId: supplierCompanyId || null, // 供应商公司id
        ...searchData,
      },
    });
  }

  /**
   * 查看澄清函
   */
  @Bind()
  handleClarificationList(page = {}) {
    const { dispatch, location } = this.props;
    const { quotationEndFlag } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const filterValues = isUndefined(this.clarificationForm)
      ? {}
      : filterNullValueObject(this.clarificationForm.getFieldsValue());
    const searchData = {
      ...filterValues,
      submittedDateFrom: filterValues.submittedDateFrom
        ? filterValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: filterValues.submittedDateTo
        ? filterValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
      quotationEndFlag,
    };
    dispatch({
      type: 'supplierBid/fetchClarificationList',
      payload: {
        page,
        sourceType: 'BID',
        sourceId: routerParam.bidHeaderId,
        // supplierCompanyId: routerParam.supplierCompanyId,
        ...searchData,
      },
    });
  }

  /**
   * 评审澄清维护
   */
  @Bind()
  handleReviewList(page = {}) {
    const { dispatch, location } = this.props;
    const { quotationEndFlag } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const filterValues = isUndefined(this.reviewForm)
      ? {}
      : filterNullValueObject(this.reviewForm.getFieldsValue());
    const searchData = {
      ...filterValues,
      submittedDateFrom: filterValues.submittedDateFrom
        ? filterValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: filterValues.submittedDateTo
        ? filterValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
      replyEndDateFrom: filterValues.replyEndDateFrom
        ? filterValues.replyEndDateFrom.format(DATETIME_MIN)
        : undefined,
      replyEndDateTo: filterValues.replyEndDateTo
        ? filterValues.replyEndDateTo.format(DATETIME_MAX)
        : undefined,
      quotationEndFlag,
    };
    dispatch({
      type: 'supplierBid/fetchReviewList',
      payload: {
        page,
        sourceFrom: 'BID',
        issueFrom: 'EXPERT',
        bidHeaderId: routerParam.bidHeaderId,
        quotationHeaderId: routerParam.quotationHeaderId,
        ...searchData,
      },
    });
  }

  /**
   * 跳转问题详情
   */
  @Bind()
  handleQuestionDetails(record) {
    const { history, match } = this.props;
    const { supplierCompanyId } = this.state;
    const { tenantId, bidHeaderId, bidNum } = this.getLocationSearchData();
    // 修复路由参数包含特殊字符 `#`
    const search = queryString.stringify({
      quotationHeaderId: match.params.quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      tenantId,
      bidNum,
    });
    history.push({
      pathname: `/ssrc/supplier-bid-hall/question-details/${record.issueHeaderId}`,
      search,
    });
  }

  /**
   * 跳转澄清函详情
   */
  @Bind()
  handleMaintainDetails(record) {
    const { history } = this.props;
    const { supplierCompanyId, quotationHeaderId } = this.state;
    const { tenantId, bidHeaderId, bidNum } = this.getLocationSearchData();
    // 修复路由参数包含特殊字符 `#`
    const search = queryString.stringify({
      quotationHeaderId,
      supplierCompanyId,
      bidHeaderId,
      tenantId,
      bidNum,
    });
    history.push({
      pathname: `/ssrc/supplier-bid-hall/clarification-details/${record.clarifyId}`,
      search,
    });
  }

  /**
   * 评审澄清通知详情
   */
  @Bind()
  jumpPendingReplayDetails(record) {
    const {
      history,
      location: { pathname, search: datas = '' },
    } = this.props;
    const { bidHeaderId, quotationHeaderId } = this.state;
    const { clarifyNotifyId } = record;
    const { tenantId, bidNum } = this.getLocationSearchData();

    const searchString = queryString.stringify({
      quotationHeaderId,
      sourceHeaderId: bidHeaderId,
      clarifyNotifyId,
      tenantId,
      bidNum,
      backPath: `${pathname}${datas}`,
    });
    history.push({
      pathname: `/ssrc/supplier-bid-hall/supplier-review-clarification-detail`,
      search: searchString,
    });
  }

  /**
   * 评审澄清通知详情
   */
  @Bind()
  jumpReplied(record) {
    const {
      history,
      location: { pathname, search: datas = '' },
    } = this.props;
    const { sourceHeaderId, clarifyNotifyId } = record;
    const { tenantId, bidNum } = this.getLocationSearchData();

    const searchString = queryString.stringify({
      sourceHeaderId,
      clarifyNotifyId,
      tenantId,
      backPath: `${pathname}${datas}`,
      bidNum,
    });
    history.push({
      pathname: '/ssrc/supplier-bid-hall/supplier-review-clarification-replay-detail',
      search: searchString,
    });
  }

  tranDate(time) {
    return new Date(time.replace(/-/g, '/')).getTime();
  }

  render() {
    const {
      maintainLoading,
      reviewLoading,
      clarificationLoading,
      reviewList = [],
      reviewPagination = {},
      questionMaintainList = {},
      clarificationList = {},
      questionMaintainPagination = {},
      clarificationPagination = {},
      code = {},
      location,
    } = this.props;
    const { activeKey, headerInfo } = this.state;
    const routerParam = queryString.parse(location.search.substr(1));
    const { quotationEndFlag } = routerParam;
    const maintainFormProps = {
      onRef: this.handleMaintainRef,
      onSearch: this.handleQuestionMaintain,
      questionStatus: code.issueLineStatus,
    };
    const maintainTableProps = {
      code,
      rowKey: 'maintainId',
      loading: maintainLoading,
      dataSource: questionMaintainList.content,
      pagination: questionMaintainPagination,
      onChange: this.handleQuestionMaintain,
      handleDetails: this.handleQuestionDetails,
      handleCreate: this.handleCreate,
      handleMaintainDetails: this.handleMaintainDetails,
    };
    const clarificationFormProps = {
      onRef: this.handleClarificationRef,
      onSearch: this.handleClarificationList,
    };
    const clarificationTableProps = {
      rowKey: 'clarificationId',
      loading: clarificationLoading,
      dataSource: clarificationList.content,
      pagination: clarificationPagination,
      onChange: this.handleClarificationList,
      onClick: this.handleMaintainDetails,
    };
    const reviewFormProps = {
      code,
      onRef: this.handleReviewRef,
      onSearch: this.handleReviewList,
    };
    const reviewTableProps = {
      loading: reviewLoading,
      dataSource: reviewList,
      pagination: reviewPagination,
      onChange: this.handleReviewList,
      onJumpPendingReplay: this.jumpPendingReplay,
      onClickNum: this.jumpPendingReplayDetails,
      onJumpReplied: this.jumpReplied,
    };
    const clarifyEndTime = this.props.location.state && this.props.location.state.clarifyEndTime;
    const currentTime = moment(new Date()).format(DEFAULT_DATETIME_FORMAT);
    const tanCurrentTime = this.tranDate(currentTime);
    const tranClarifyEndTime = clarifyEndTime && this.tranDate(clarifyEndTime);
    const btnNew = tanCurrentTime > tranClarifyEndTime;
    const btnNewShow = isEmpty(clarifyEndTime)
      ? Number(quotationEndFlag) !== 1
      : Number(quotationEndFlag) !== 1 && !btnNew;
    const { sourceTitle = '', sourceNum } = headerInfo || {};

    return (
      <React.Fragment>
        <Header
          title={intl.get(`${promptCode}.view.message.title.questionMaintenance`).d('澄清答疑')}
          backPath="/ssrc/supplier-bid-hall/list"
        />
        <Content style={{ paddingTop: 0 }}>
          <div className={styles['question-title']}>
            {intl.get(`${promptCode}.model.supplierBid.rfxNum`).d('寻源编号')}:{sourceNum}{' '}
            {intl.get(`${promptCode}.model.supplierBid.rfxTitle`).d('寻源标题')}:{sourceTitle}
          </div>
          <Tabs
            activeKey={activeKey}
            animated={false}
            onChange={this.handleTabsChange}
            className={styles['question-tab']}
          >
            <TabPane
              key="question"
              tab={intl.get(`${promptCode}.view.message.tab.questionMaintenance`).d('问题维护')}
            >
              {/* <div className={styles['question-title']}>
                     {`寻源编号:${bidNum} 寻源标题:${bidTitle}`}
                   </div> */}
              <div className="table-list-search">
                <MaintainForm {...maintainFormProps} />
              </div>
              <div className={styles['question-create']}>
                {btnNewShow && (
                  <Button type="primary" onClick={this.handleCreate}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                )}
              </div>
              <MaintainTable {...maintainTableProps} />
            </TabPane>
            <TabPane
              key="clarification"
              tab={intl.get(`${promptCode}.view.message.tab.clarification`).d('查看澄清函')}
            >
              {/* <div className={styles['question-title']}>
                     {`寻源编号:${bidNum} 寻源标题:${bidTitle}`}
                   </div> */}
              <div className="table-list-search">
                <ClarificationForm {...clarificationFormProps} />
              </div>
              <ClarificationTable {...clarificationTableProps} />
            </TabPane>
            <TabPane
              key="clarificationMaintain"
              tab={intl
                .get(`${promptCode}.view.message.tab.clarificationMaintain`)
                .d('评审澄清回复')}
            >
              <div className="table-list-search">
                <ReviewForm {...reviewFormProps} />
              </div>
              <ReviewTable {...reviewTableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
