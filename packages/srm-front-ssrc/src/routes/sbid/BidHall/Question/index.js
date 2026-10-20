/**
 * Question - 采购方澄清问题维护
 * @date: 2019-6-16
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import { Tabs, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { isUndefined } from 'lodash';

import { getClarifyHeaderInfo } from '@/services/inquiryHallService';

import styles from './index.less';

import MaintainForm from './Maintain/MaintainForm';
import MaintainTable from './Maintain/MaintainTable';
import ClarificationForm from './Clarification/ClarificationForm';
import ClarificationTable from './Clarification/ClarificationTable';

const { TabPane } = Tabs;

@formatterCollections({
  code: ['ssrc.bidHall'],
})
@connect(({ bidHall, loading }) => ({
  bidHall,
  Loading: loading.effects['bidHall/fetchMaintainList'],
  clarLoading: loading.effects['bidHall/fetchClarList'],
  organizationId: getCurrentOrganizationId(),
}))
@cacheComponent({ cacheKey: '/ssrc/bid-hall/inter-question/:sourceHeaId/:bidNum' })
export default class Question extends React.Component {
  constructor(props) {
    super(props);

    const {
      location: { search = {} },
    } = props;
    const { quotationEndDateFlag = null } = querystring.parse(search.substr(1));

    this.state = {
      activeKey: 'clarification',
      clarifySelectedRows: [], // 引用问题选中行
      clarifySelectedRowKeys: [], // 引用选中id
      quotationEndDateFlag, // 招标大厅列表带参数
      headerInfo: {},
    };
  }

  clarifForm;

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    if (params.flag === '1') {
      this.setState({
        activeKey: 'clarification',
      });
      if (!isUndefined(this.maintainform)) {
        this.maintainform.resetFields();
      }
      if (!isUndefined(this.clarifForm)) {
        this.clarifForm.resetFields();
      }
    }
    this.setState({
      clarifySelectedRows: [],
      clarifySelectedRowKeys: [],
    });
    const {
      bidHall: { fetchClarListPagination = {} },
    } = this.props;
    this.queryList();
    this.queryLov();
    this.fetchHeaderInfo();
    this.handleClariSearch(fetchClarListPagination);
  }

  // 查询头信息
  @Bind()
  async fetchHeaderInfo() {
    const { match: { params = {} } = {} } = this.props;
    // const type = querystring.parse(search)?.sourceCategory;
    const { sourceId } = params || {};
    const data = {
      sourceHeaderId: sourceId,
      sourceFrom: 'BID',
      // sourceFrom: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
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
   * 值集查询
   */
  @Bind()
  queryLov() {
    const { dispatch } = this.props;
    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: 'bidHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 设置Form
   * @param {object} ref - MaintainForm组件引用
   */
  @Bind()
  handleMaintainRef(ref = {}) {
    this.maintainform = (ref.props || {}).form;
  }

  /**
   * 设置Form
   * @param {object} ref - ClarificationForm组件引用
   */
  @Bind()
  handleClarifRef(ref = {}) {
    this.clarifForm = (ref.props || {}).form;
  }

  /**
   * 澄清维护列表查询
   */
  @Bind()
  queryList() {
    const {
      bidHall: { maintainListPagination = {} },
    } = this.props;
    this.handleSearch(maintainListPagination);
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const fieldValues = isUndefined(this.maintainform)
      ? {}
      : filterNullValueObject(this.maintainform.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      submittedDateFrom: fieldValues.submittedDateFrom
        ? fieldValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: fieldValues.submittedDateTo
        ? fieldValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'bidHall/fetchMaintainList',
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        sourceId: params.sourceId,
        sourceType: 'BID',
      },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleClariSearch(page = {}) {
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    const fieldValues = isUndefined(this.clarifForm)
      ? {}
      : filterNullValueObject(this.clarifForm.getFieldsValue());
    let values = { ...fieldValues };
    values = {
      submittedDateFrom: fieldValues.submittedDateFrom
        ? fieldValues.submittedDateFrom.format(DATETIME_MIN)
        : undefined,
      submittedDateTo: fieldValues.submittedDateTo
        ? fieldValues.submittedDateTo.format(DATETIME_MAX)
        : undefined,
    };
    dispatch({
      type: 'bidHall/fetchClarList',
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        sourceId: params.sourceId,
        sourceType: 'BID',
      },
    });
  }

  /**
   *  改变tab页
   */
  @Bind()
  changeTabs(key) {
    this.setState({ activeKey: key });
  }

  /**
   *  跳转澄清函页面
   */
  @Bind()
  clarficationDetail(record) {
    const { match = {}, location = {}, history } = this.props;
    const quotationEndDateFlag = this.state.quotationEndDateFlag || null;
    const routerParams = querystring.parse(location.search.substr(1));
    const { createFlag, isClarificationFlag } = routerParams;
    const search = querystring.stringify({
      quotationEndDateFlag,
      createFlag,
      isClarificationFlag,
    });
    if (record.clarifyStatus === 'NEW') {
      history.push({
        pathname: `/ssrc/bid-hall/clarify-update/${match.params.sourceId}/${match.params.bidNum}/${match.params.bidTitle}/${match.params.companyId}/${record.clarifyId}`,
        search,
      });
    } else {
      history.push({
        pathname: `/ssrc/bid-hall/clarify-detail/${match.params.sourceId}/${match.params.bidNum}/${match.params.bidTitle}/${match.params.companyId}/${record.clarifyId}`,
        search,
      });
    }
  }

  /**
   *  跳转问题详情页面
   */
  @Bind()
  jumpIssueDetail(record) {
    const {
      location,
      match: { params },
      history,
    } = this.props;
    const quotationEndDateFlag = this.state.quotationEndDateFlag || null;
    const routerParams = querystring.parse(location.search.substr(1));
    const { createFlag, isClarificationFlag } = routerParams;
    const search = querystring.stringify({
      quotationEndDateFlag,
      createFlag,
      isClarificationFlag,
    });

    history.push({
      pathname: `/ssrc/bid-hall/question-details/${record.issueHeaderId}/${params.bidNum}/${params.bidTitle}/${params.companyId}`,
      search,
    });
  }

  /**
   *  新建跳转澄清函页面
   */
  @Bind()
  createClarification() {
    const {
      match,
      dispatch,
      location: { search = {} },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { createFlag, isClarificationFlag, quotationEndDateFlag } = routerParams;
    const query = querystring.stringify({
      createFlag,
      isClarificationFlag,
      quotationEndDateFlag,
    });
    dispatch(
      routerRedux.push({
        pathname: `/ssrc/bid-hall/clarify-create/${match.params.sourceId}/${match.params.bidTitle}/${match.params.bidNum}/${match.params.companyId}`,
        search: query,
      })
    );
  }

  /**
   *  引入问题新建跳转澄清函创建页面
   */
  @Bind()
  createIssue() {
    const {
      match,
      location: { search = {} },
      history,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { createFlag, isClarificationFlag, quotationEndDateFlag } = routerParams;
    const { clarifySelectedRows, clarifySelectedRowKeys } = this.state;
    const locationSearch = querystring.stringify({
      createFlag,
      isClarificationFlag,
      quotationEndDateFlag,
    });
    // 过滤出勾选数据
    if (clarifySelectedRows.length === 0) {
      notification.warning({
        message: intl.get(`ssrc.bidHall.model.bidHall.noSelectedRows`).d('请勾选需要关联行!'),
      });
    } else {
      this.setState(
        {
          clarifySelectedRows: [],
          clarifySelectedRowKeys: [],
        },
        () => {
          history.push({
            pathname: `/ssrc/bid-hall/issue-create/${match.params.sourceId}/${match.params.bidTitle}/${match.params.bidNum}/${match.params.companyId}/${clarifySelectedRowKeys}`,
            search: locationSearch,
          });
        }
      );
    }
  }

  /**
   * 物品明细-获取选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleClarifyRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      clarifySelectedRowKeys: selectedRowKeys,
      clarifySelectedRows: selectedRows,
    });
  }

  /**
   *  退回至父页面
   */
  @Bind()
  renderParent() {
    return '/ssrc/bid-hall/list';
  }

  render() {
    const {
      match,
      Loading,
      clarLoading,
      organizationId,
      location,
      bidHall: {
        code = {},
        fetchMaintainList = [],
        maintainListPagination = {},
        fetchClarList = [],
        fetchClarListPagination = {},
      },
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { quotationEndDateFlag, isClarificationFlag, createFlag } = routerParam;
    const { clarifySelectedRows = {}, headerInfo } = this.state;
    const { sourceTitle } = headerInfo || {};
    const rowSelection = {
      selectedRowKeys: clarifySelectedRows.map((item) => item.issueLineId),
      onChange: this.handleClarifyRowSelectChange,
    };
    // 澄清函维护
    const maintainFormProps = {
      match,
      clarifyStatus: code.clarifyStatus,
      onSearch: this.handleSearch,
      onRef: this.handleMaintainRef,
    };
    const maintainTableProps = {
      match,
      Loading,
      clarifyStatus: code.clarifyStatus,
      onClarfDetail: this.clarficationDetail,
      fetchMaintainList,
      maintainListPagination,
      onChange: this.handleSearch,
      // clarifyStatus: code.clarifyStatus,
    };
    // 引用问题
    const clarificationFormProps = {
      code,
      match,
      organizationId,
      onSearch: this.handleClariSearch,
      onRef: this.handleClarifRef,
    };
    const clarificationTableProps = {
      match,
      rowSelection,
      organizationId,
      Loading: clarLoading,
      fetchClarList,
      fetchClarListPagination,
      clarifyType: code.clarifyType,
      onIssueDetail: this.jumpIssueDetail,
      onChange: this.handleClariSearch,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`ssrc.bidHall.view.title.clarificationMaintenance`).d('澄清函维护')}
          backPath={this.renderParent()}
        />
        <Content style={{ paddingTop: 0 }}>
          <div className={styles['question-title']}>
            <span>
              {intl.get(`ssrc.bidHall.view.message.button.bidNum`).d('寻源编号')}:
              {match.params.bidNum}
            </span>
            <span>
              {intl.get(`ssrc.bidHall.view.message.button.bidTitle`).d('寻源标题')}:{sourceTitle}
            </span>
          </div>
          <Tabs
            activeKey={this.state.activeKey}
            animated={false}
            className={styles['question-tab']}
            onChange={this.changeTabs}
          >
            <TabPane
              key="clarification"
              tab={intl.get(`ssrc.bidHall.view.title.clarificationMaintenance`).d('澄清函维护')}
            >
              {/* <div className={styles['question-title']}>
              {`寻源编号:${match.params.bidNum} 寻源标题:${match.params.bidTitle}`}
            </div> */}
              <div className="table-list-search">
                <MaintainForm {...maintainFormProps} />
              </div>
              <div className={styles['question-create']}>
                {Number(quotationEndDateFlag) !== 1 &&
                  (Number(isClarificationFlag) === 1 || Number(createFlag) === 1) && (
                    <Button type="primary" onClick={this.createClarification}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  )}
              </div>
              <MaintainTable {...maintainTableProps} />
            </TabPane>
            <TabPane
              key="question"
              tab={intl.get(`ssrc.bidHall.view.title.lineQuestion`).d('关联问题')}
            >
              {/* <div className={styles['question-title']}>
              {`寻源编号:${match.params.bidNum} 寻源标题:${match.params.bidTitle}`}
            </div> */}
              <div className="table-list-search">
                <ClarificationForm {...clarificationFormProps} />
              </div>
              <div className={styles['question-create']}>
                {Number(quotationEndDateFlag) !== 1 &&
                  (Number(isClarificationFlag) === 1 || Number(createFlag) === 1) && (
                    <Button type="primary" onClick={this.createIssue}>
                      {intl.get('hzero.common.button.create').d('新建')}
                    </Button>
                  )}
              </div>
              <ClarificationTable {...clarificationTableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
