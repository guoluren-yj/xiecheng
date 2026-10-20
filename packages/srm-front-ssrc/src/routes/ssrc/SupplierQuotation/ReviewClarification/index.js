/**
 * 澄清通知入口页面
 * @date: 2019-08-14
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs, Button, Badge, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNil, compose } from 'lodash';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import remotes from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { isPubPage, getTabKey } from '@/utils/utils';

import { idValidation } from '@/routes/components/Widget/dataVerification';
import { getClarifyHeaderInfo } from '@/services/inquiryHallService';
import { fetchCreatePermission } from '@/services/supplierQutationService';
import { BID } from '@/utils/globalVariable';
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
class ReviewClarification extends Component {
  constructor(props) {
    super(props);
    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      // title = '',
      activeKey = 'question',
      sourceFrom = 'RFX',
      sourceHeaderId = 0,
      quotationHeaderId = 0,
      quotationEndFlag,
    } = routerParams;
    this.state = {
      // title,
      sourceFrom,
      activeKey: Array.isArray(activeKey) ? activeKey[activeKey.length - 1] : activeKey,
      sourceHeaderId,
      display: false,
      quotationHeaderId,
      quotationEndFlag,
      createPermission: true, // 是否有权限新建
      headerInfo: {},
    };
    this.activeTabKey = getTabKey();
    this.bidFlag = props.sourceKey === BID;
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
    this.fetchHeaderInfo();
    this.handleSearch();
    this.handleQuestionMaintain();
    this.handleClarificationList();
    this.handleCreatePermission();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = querystring.parse(
      nextProps.location.search.substr(1)
    );
    if (
      sourceFrom !== prevState.sourceFrom ||
      sourceHeaderId !== prevState.sourceHeaderId ||
      quotationHeaderId !== prevState.quotationHeaderId
    ) {
      return {
        sourceFrom,
        sourceHeaderId,
        quotationHeaderId,
      };
    }
    return null;
  }

  componentDidUpdate(_, preState) {
    const { sourceFrom, sourceHeaderId, quotationHeaderId } = this.state;
    const routerParam = querystring.parse(this.props.location.search.substr(1));
    if (
      sourceFrom !== preState.sourceFrom ||
      sourceHeaderId !== preState.sourceHeaderId ||
      quotationHeaderId !== preState.quotationHeaderId
    ) {
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
      this.fetchHeaderInfo();
      this.handleSearch();
      this.handleQuestionMaintain();
      this.handleClarificationList();
      this.handleCreatePermission();
    }
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

  // 查询头信息
  @Bind()
  async fetchHeaderInfo() {
    const { location: { search } = {} } = this.props;
    const routerParam = querystring.parse(search.substr(1));
    const { sourceHeaderId, sourceFrom, tenantId } = routerParam || {};
    idValidation(sourceHeaderId);

    const data = {
      sourceHeaderId,
      tenantId,
      sourceFrom: ['RFQ', 'RFA'].includes(sourceFrom) ? 'RFX' : sourceFrom,
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

  /**
   * 问题维护查询
   */
  @Bind()
  handleQuestionMaintain(page = {}) {
    const { dispatch, location, remote } = this.props;
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

    // 添加前端防御
    if (
      isNil(routerParam.sourceHeaderId) ||
      ['null', 'undefined'].includes(routerParam.sourceHeaderId)
    ) {
      return;
    }

    let queryParams = {};
    queryParams = remote
      ? remote.process(
          'SSRC_SUPPLIERQUOTATION_LIST_PROCESS_QUESTIONMAINTAIN_QUERYPARAMS',
          queryParams,
          {
            that: this,
          }
        )
      : queryParams;
    queryParams = queryParams || {};

    dispatch({
      type: 'supplierQuotation/fetchQuestionMaintain',
      payload: {
        page,
        sourceType: routerParam.sourceFrom,
        sourceId: routerParam.sourceHeaderId,
        supplierCompanyId: routerParam.supplierCompanyId || null,
        ...searchData,
        ...queryParams,
      },
    });
  }

  /**
   * 查看澄清函
   * @protected 绝味二开方法重写
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
    // 添加前端防御
    if (
      isNil(routerParam.sourceHeaderId) ||
      ['null', 'undefined'].includes(routerParam.sourceHeaderId)
    ) {
      return;
    }
    dispatch({
      type: 'supplierQuotation/fetchClarificationList',
      payload: {
        page,
        sourceType: routerParam.sourceFrom,
        sourceId: routerParam.sourceHeaderId,
        customizeUnitCode: `SSRC.${
          !this.bidFlag ? '' : 'BID_'
        }SUPPLIER_CLARIFICATION.CLARIFICATION_VIEW`,
        supplierCompanyId: routerParam?.supplierCompanyId || null,
        ...searchData,
      },
    });
  }

  /**
   * 获取澄清截止时间，是否显示问题维护页签的新建按钮
   */
  @Bind()
  handleCreatePermission() {
    const { quotationHeaderId, sourceFrom } = this.state;
    const params = {
      sourceFrom,
      quotationHeaderId,
    };
    fetchCreatePermission(params).then((res) => {
      const result = getResponse(res);
      if (result && !result.failed) {
        this.setState({
          createPermission: JSON.parse(result),
        });
      }
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

  getRelativeQuestionTableCode = () => {
    const code = this.bidFlag
      ? 'SSRC.BID_SUPPLIER_CLARIFICATION.LIST_RELATIVE_QUESTION'
      : 'SSRC.SUPPLIER_CLARIFICATION.LIST_RELATIVE_QUESTION';
    return code;
  };

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch, location } = this.props;
    const { quotationHeaderId, sourceFrom, sourceHeaderId } = this.state;
    const routerParam = querystring.parse(location.search.substr(1));
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);

    // 添加前端防御
    if (
      isNil(routerParam.sourceHeaderId) ||
      ['null', 'undefined'].includes(routerParam.sourceHeaderId)
    ) {
      return;
    }

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
        customizeUnitCode: this.getRelativeQuestionTableCode(),
      },
    });
  }

  /**
   * 新建
   */
  @Bind()
  async handleCreate(record) {
    const {
      history,
      location,
      match: { path = null },
      remote,
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { tenantId } = routerParam || {};

    let allowCreateFlag = true;

    if (remote?.event) {
      allowCreateFlag = await remote.event.fireEvent('remoteHandleCreate', {
        record,
        that: this,
      });
    }
    if (!allowCreateFlag) {
      return;
    }

    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
      rfxHeaderId: routerParam.sourceHeaderId,
      sourceFrom: routerParam.sourceFrom,
      tenantId,
    });
    history.push(isPubPage(path, `${this.activeTabKey}/question-create?${search}`));
  }

  /**
   * 跳转问题详情
   */
  @Bind()
  handleQuestionDetails(record) {
    const {
      history,
      location,
      match: { path = null },
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { tenantId } = routerParam || {};

    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
      rfxHeaderId: routerParam.sourceHeaderId,
      sourceFrom: routerParam.sourceFrom,
      tenantId,
    });
    history.push(isPubPage(path, `${this.activeTabKey}/question-details?${search}`));
  }

  /**
   * 跳转澄清答疑详情
   */
  @Bind()
  handleMaintainDetails(record) {
    const {
      history,
      location,
      match: { path = null },
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { tenantId } = routerParam || {};
    const { activeKey } = this.state;

    const search = querystring.stringify({
      issueHeaderId: record.issueHeaderId,
      quotationHeaderId: routerParam.quotationHeaderId,
      supplierCompanyId: routerParam.supplierCompanyId,
      rfxHeaderId: routerParam.sourceHeaderId,
      sourceFrom: routerParam.sourceFrom,
      activeKey,
      tenantId,
    });
    history.push(
      isPubPage(
        path,
        `${this.activeTabKey}/review-clarification-clarification/${record.clarifyId}?${search}`
      )
    );
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
      match: { path = null },
      customizeTabPane = () => {},
      customizeTable = null,
      remote,
    } = this.props;
    const {
      quotationHeaderId,
      sourceHeaderId,
      sourceFrom,
      activeKey,
      createPermission,
      headerInfo,
    } = this.state;
    const { sourceTitle = '', sourceNum } = headerInfo || {};

    const commonProps = {
      bidFlag: this.bidFlag,
      remote,
    };

    const maintainFormProps = {
      onRef: this.handleMaintainRef,
      onSearch: this.handleQuestionMaintain,
      questionStatus: issueLineStatus,
    };
    const maintainTableProps = {
      remote,
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
      ...commonProps,
      customizeTable,
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
      ...commonProps,
      path,
      search,
      history,
      pathname,
      activeKey,
      isLoading,
      sourceFrom,
      dataSource,
      sourceHeaderId,
      quotationHeaderId,
      onChange: this.handleSearch,
      pagination: reviewClarificationPagination,
      remote,
      customizeTable,
      getRelativeQuestionTableCode: this.getRelativeQuestionTableCode,
    };

    // const rfxArr = this.state.title.split('-');
    // const rfxNum = rfxArr && rfxArr[0];
    // const replaceStr = `${rfxArr[0]}-`;
    // const rfxTitle = this.state.title.replace(replaceStr, '');
    // const routerParams = querystring.parse(this.props.location.search.substr(1));
    // const { backPath = '' } = routerParams;

    return (
      <div>
        <Header
          title={intl.get(`ssrc.supplierQuotation.model.supQuo.clearAnswerList`).d('澄清答疑')}
          backPath={isPubPage(path, `${this.activeTabKey}/list`)}
        />
        <Content style={{ paddingTop: 0 }}>
          <div
            className={styles['question-title']}
            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            <span style={{ marginRight: '8px' }}>
              {intl.get(`ssrc.supplierQuotation.view.message.rfxNum`).d('寻源编号')}:{sourceNum}
            </span>
            <span>
              {intl.get(`ssrc.supplierQuotation.view.message.rfxTitle`).d('寻源标题')}:
              {
                <Tooltip title={`${sourceNum}-${sourceTitle}`} overlayStyle={{ minWidth: '300px' }}>
                  {sourceTitle}
                </Tooltip>
              }
            </span>
          </div>
          {/* <h3 className={styles.title}>{this.state.title}</h3> */}
          {customizeTabPane(
            {
              code: this.bidFlag
                ? 'SSRC.BID_SUPPLIER_CLARIFICATION.LIST_TABS'
                : 'SSRC.SUPPLIER_CLARIFICATION.LIST_TABS',
            },
            <Tabs
              // activeKey={activeKey}
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
                {createPermission && (
                  <div className={styles['question-create']}>
                    <Button type="primary" onClick={this.handleCreate}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  </div>
                )}
                <MaintainTable {...maintainTableProps} />
              </TabPane>
              <TabPane
                key="clarification"
                tab={
                  <>
                    {intl
                      .get(`ssrc.supplierQuotation.view.message.tab.clarification`)
                      .d('查看澄清函')}
                    <Badge
                      count={clarificationList[0]?.unreadIssueCount}
                      className={styles['badge-item']}
                    />
                  </>
                }
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
                tab={
                  <>
                    {intl
                      .get(`ssrc.supplierQuotation.view.message.tab.questionReply`)
                      .d('问题回复')}
                    <Badge
                      count={dataSource[0]?.clarifyNotifyCount}
                      className={styles['badge-item']}
                    />
                  </>
                }
              >
                <div className="table-list-search">
                  <FilterForm {...formProps} />
                </div>
                <TableList {...tableProps} />
              </TabPane>
            </Tabs>
          )}
        </Content>
      </div>
    );
  }
}

const hocComponent = (Comp) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.SUPPLIER_CLARIFICATION.LIST_TABS',
        'SSRC.SUPPLIER_CLARIFICATION.CLARIFICATION_VIEW', // 查看澄清涵-表格
        'SSRC.SUPPLIER_CLARIFICATION.LIST_RELATIVE_QUESTION', // 问题回复-表格
      ],
    }),
    formatterCollections({
      code: ['ssrc.supplierQuotation', 'ssrc.common'],
    }),
    remotes(
      // 二开对应的标准改造
      {
        code: 'SSRC_SUPPLIEREVIEWCLARIFICATION_LIST', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
        name: 'remote',
      },
      {
        events: {
          remoteHandleCreate() {},
        },
      }
    ),
    connect(({ supplierQuotation, loading }) => ({
      supplierQuotation,
      isLoading: loading.effects['supplierQuotation/fetchReviewClarificationList'],
      maintainLoading: loading.effects['supplierQuotation/fetchQuestionMaintain'],
      clarificationLoading: loading.effects['supplierQuotation/fetchClarificationList'],
    }))
  )(Comp);
};

export default hocComponent(ReviewClarification);
export { hocComponent, ReviewClarification };
