/**
 * 澄清通知入口页面
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import intl from 'utils/intl';

import { getActiveTabKey } from 'utils/menuTab';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';

import MaintainForm from './Maintain/MaintainForm';
import MaintainTable from './Maintain/MaintainTable';
import ClarificationForm from './Clarification/ClarificationForm';
import ClarificationTable from './Clarification/ClarificationTable';
import styles from './index.less';
import FilterForm from './FilterForm';
import TableList from './TableList';

/**
 *  SSRC.REPLY_STATUS 值集相关
 */
const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
@formatterCollections({ code: ['ssrc.supplierQuotation', 'ssrc.common'] })
@connect(({ supplierQuotation, loading }) => ({
  supplierQuotation,
  isLoading: loading.effects['supplierQuotation/fetchReviewClarificationList'],
  maintainLoading: loading.effects['supplierQuotation/fetchQuestionMaintain'],
  clarificationLoading: loading.effects['supplierQuotation/fetchClarificationList'],
}))
export default class ReviewClarification extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      activeKey = 'question',
      title = '',
      sourceFrom = 'RFX',
      sourceHeaderId = 0,
      quotationHeaderId = 0,
      quotationEndFlag,
    } = routerParams;
    this.state = {
      title,
      sourceFrom,
      activeKey: Array.isArray(activeKey) ? activeKey[activeKey.length - 1] : activeKey,
      sourceHeaderId,
      display: false,
      quotationHeaderId,
      quotationEndFlag,
    };
    this.activeTabKey = getActiveTabKey();
  }

  componentDidMount() {
    const routerParam = querystring.parse(this.props.location.search.substr(1));
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
    this.batchCode();
    this.handleSearch();
    this.handleQuestionMaintain();
    this.handleClarificationList();
  }

  /**
   * 获取值集
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;

    const lovCodes = {
      issueLineStatus: 'SSRC.ISSUE_LINE_STATUS', // 问题行状态
      replayStatus: 'SSRC.REPLY_STATUS', // 回复状态
    };
    dispatch({
      type: 'supplierQuotation/batchCode',
      payload: { lovCodes },
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
   * 问题维护查询
   */
  @Bind()
  handleQuestionMaintain(page = {}) {
    const { dispatch, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
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
      type: 'supplierQuotation/fetchQuestionMaintain',
      payload: {
        page,
        sourceType: routerParam.sourceFrom,
        sourceId: routerParam.sourceHeaderId,
        supplierCompanyId: routerParam.supplierCompanyId || null,
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
    const routerParam = querystring.parse(location.search.substr(1));
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
      type: 'supplierQuotation/fetchClarificationList',
      payload: {
        page,
        sourceType: routerParam.sourceFrom,
        sourceId: routerParam.sourceHeaderId,
        // supplierCompanyId: routerParam.supplierCompanyId,
        ...searchData,
      },
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
   * tab切换的回调
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
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
    const { dispatch } = this.props;
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    dispatch({
      type: 'supplierQuotation/fetchReviewClarificationList',
      payload: {
        page,
        sourceFrom,
        sourceHeaderId,
        organizationId,
        quotationHeaderId,
        ...handleFormValues,
        issueFrom: 'EXPERT',
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate(record) {
    const { history, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { quotationHeaderId, supplierCompanyId, sourceHeaderId, sourceFrom } = routerParam || {};
    const { title } = this.state;
    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId,
      title,
      supplierCompanyId,
      rfxHeaderId: sourceHeaderId,
      sourceFrom,
    });
    history.push({
      pathname: `${this.activeTabKey}/question-create`,
      search,
    });
  }

  /**
   * 跳转问题详情
   */
  @Bind()
  handleQuestionDetails(record) {
    const { history, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { title } = this.state;
    const { quotationHeaderId, supplierCompanyId, sourceHeaderId, sourceFrom } = routerParam || {};
    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId,
      title,
      supplierCompanyId,
      rfxHeaderId: sourceHeaderId,
      sourceFrom,
    });
    history.push({
      pathname: `${this.activeTabKey}/question-details`,
      search,
    });
  }

  /**
   * 跳转澄清答疑详情
   */
  @Bind()
  handleMaintainDetails(record) {
    const { history, location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { title, activeKey } = this.state;
    const { quotationHeaderId, supplierCompanyId, sourceHeaderId, sourceFrom } = routerParam || {};
    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId,
      title,
      supplierCompanyId,
      rfxHeaderId: sourceHeaderId,
      sourceFrom,
      activeKey,
    });
    history.push({
      pathname: `${this.activeTabKey}/review-clarification-clarification/${record.clarifyId}`,
      search,
    });
  }

  render() {
    const {
      supplierQuotation: {
        code: { replayStatus = [], issueLineStatus = [] },
        reviewClarificationPagination = {},
        reviewClarificationList: dataSource = [],
        questionMaintainList = [], // 澄清答疑维护列表
        questionMaintainPagination = {}, // 澄清答疑维护列表分页
        clarificationList = [], // 澄清答疑查看澄清函列表
        clarificationPagination = {}, // 澄清答疑查看澄清函列表分页
      },
      history,
      maintainLoading,
      clarificationLoading,
      isLoading = true,
      sourceMethod = [],
      quotationType = [],
      auctionDirection = [],
      location: { pathname, search = '' },
    } = this.props;
    const { quotationHeaderId, sourceHeaderId, sourceFrom, activeKey } = this.state;
    const maintainFormProps = {
      onRef: this.handleMaintainRef,
      onSearch: this.handleQuestionMaintain,
      questionStatus: issueLineStatus,
    };
    const maintainTableProps = {
      sourceFrom,
      rowKey: 'maintainId',
      loading: maintainLoading,
      dataSource: questionMaintainList,
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
      dataSource: clarificationList,
      pagination: clarificationPagination,
      onChange: this.handleClarificationList,
      onClick: this.handleMaintainDetails,
    };
    const formProps = {
      sourceMethod,
      quotationType,
      auctionDirection,
      onRef: this.handleBindRef,
      onSearch: this.handleSearch,
      replayStatus,
    };
    const tableProps = {
      search,
      history,
      activeKey,
      pathname,
      isLoading,
      sourceFrom,
      dataSource,
      sourceHeaderId,
      quotationHeaderId,
      onChange: this.handleSearch,
      pagination: reviewClarificationPagination,
    };
    const rfxArr = this.state.title.split('-');
    const rfxNum = rfxArr && rfxArr[0];
    const replaceStr = `${rfxArr[0]}-`;
    const rfxTitle = this.state.title.replace(replaceStr, '');
    // const routerParams = querystring.parse(this.props.location.search.substr(1));
    // const { backPath = '' } = routerParams;

    return (
      <div>
        <Header
          title={intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswerList`).d('澄清答疑')}
          backPath={`${this.activeTabKey}/list`}
        />
        <Content style={{ paddingTop: 0 }}>
          <div className={styles['question-title']}>
            <span style={{ marginRight: '8px' }}>
              {intl.get(`ssrc.supplierQuotation.view.message.rfxNum`).d('寻源编号')}:{rfxNum}
            </span>
            <span>
              {intl.get(`ssrc.supplierQuotation.view.message.rfxTitle`).d('寻源标题')}:
              {decodeURIComponent(rfxTitle)}
            </span>
          </div>
          {/* <h3 className={styles.title}>{this.state.title}</h3> */}
          <Tabs
            activeKey={activeKey}
            animated={false}
            onChange={this.handleTabsChange}
            className={styles['question-tab']}
          >
            <TabPane
              key="question"
              tab={intl
                .get(`ssrc.supplierQuotation.view.message.tab.questionMaintenance`)
                .d('问题维护')}
            >
              {/* <div className={styles['question-title']}>
                    {`寻源编号:${rfxNum} 寻源标题:${rfxTitle}`}
                  </div> */}
              <div className="table-list-search">
                <MaintainForm {...maintainFormProps} />
              </div>
              <div className={styles['question-create']}>
                <Button type="primary" onClick={this.handleCreate}>
                  {intl.get('hzero.common.button.create').d('新建')}
                </Button>
              </div>
              <MaintainTable {...maintainTableProps} />
            </TabPane>
            <TabPane
              key="clarification"
              tab={intl
                .get(`ssrc.supplierQuotation.view.message.tab.clarification`)
                .d('查看澄清函')}
            >
              {/* <div className={styles['question-title']}>
                    {`寻源编号:${rfxNum} 寻源标题:${rfxTitle}`}
                  </div> */}
              <div className="table-list-search">
                <ClarificationForm {...clarificationFormProps} />
              </div>
              <ClarificationTable {...clarificationTableProps} />
            </TabPane>
            <TabPane
              key="clarificationMaintain"
              tab={intl.get(`ssrc.supplierQuotation.view.message.tab.questionReply`).d('问题回复')}
            >
              <div className="table-list-search">
                <FilterForm {...formProps} />
              </div>
              <TableList {...tableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </div>
    );
  }
}

// export default ReviewClarification;
