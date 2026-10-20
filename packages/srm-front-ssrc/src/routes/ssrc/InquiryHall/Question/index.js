/**
 * Question - 采购方澄清函维护
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Tabs, Button, Popover, Badge } from 'hzero-ui';
import { isUndefined, compose, isFunction, map } from 'lodash';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import remote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { getActiveTabKey, openTab } from 'utils/menuTab';
import DynamicButtons from '_components/DynamicButtons';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { downloadFile } from 'services/api';
import { SRM_SSRC } from '_utils/config';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { BID, INQUIRY } from '@/utils/globalVariable';
import { idValidation } from '@/routes/components/Widget/dataVerification';

import { getClarifyHeaderInfo } from '@/services/inquiryHallService';
import MaintainForm from './Maintain/MaintainForm';
import MaintainTable from './Maintain/MaintainTable';
import ClarificationForm from './Clarification/ClarificationForm';
import ClarificationTable from './Clarification/ClarificationTable';
import styles from './index.less';

const { TabPane } = Tabs;

class Question extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'clarification',
      clarifySelectedRows: [], // 引用问题选中行
      clarifySelectedRowKeys: [], // 引用选中id
      headerInfo: {},
      downLoadLoading: false, // 导出关联问题loading
    };
    this.bidFlag = props.sourceKey === BID; //  招标标识
  }

  activeTabKey = getActiveTabKey();

  routerActiveTabKey = getActiveTabKey().includes('/pub')
    ? getActiveTabKey().split('/').slice(0, 4).join('/')
    : getActiveTabKey().split('/').slice(0, 3).join('/');

  clarifForm;

  componentDidMount() {
    const {
      match: { params },
      modelName = 'inquiryHall',
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
      [modelName]: { fetchClarListPagination = {}, maintainListPagination = {} },
    } = this.props;

    this.queryLov();
    this.fetchHeaderInfo();
    this.handleSearch(maintainListPagination);
    this.handleClariSearch(fetchClarListPagination);
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { match: { params: prevParams } = {} } = prevProps || {};
    const { match: { params = {} } = {} } = this.props;
    const prevId = prevParams?.sourceId || null;
    const id = params?.sourceId || null;
    const updateFlag = id && prevId !== id;
    return updateFlag;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchHeaderInfo();
      this.handleSearch();
      this.handleClariSearch();
    }
  }

  // 查询头信息
  @Bind()
  async fetchHeaderInfo() {
    const { match: { params = {} } = {}, location: { search } = {} } = this.props;
    const type = querystring.parse(search.substr(1))?.sourceCategory;
    const { sourceId } = params || {};
    idValidation(sourceId);

    const data = {
      sourceHeaderId: sourceId,
      sourceFrom: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
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
    const { modelName = 'inquiryHall', dispatch } = this.props;

    const lovCodes = {
      clarifyType: 'SSRC.CLARIFY_TYPE', // 澄清类型
      clarifyStatus: 'SSRC.CLARIFY_STATUS', // 澄清函状态值集
    };
    dispatch({
      type: `${modelName}/batchCode`,
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
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      match: { params },
      location: { search },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const type = querystring.parse(search.substr(1)).sourceCategory;
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
      type: `${modelName}/fetchMaintainList`,
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        sourceId: params.sourceId,
        sourceType: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
        customizeUnitCode: this.bidFlag
          ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_CLARIFICATION'
          : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION',
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
      location: { search },
      dispatch,
      organizationId,
      modelName = 'inquiryHall',
    } = this.props;
    const type = querystring.parse(search.substr(1)).sourceCategory;
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
      type: `${modelName}/fetchClarList`,
      payload: {
        page,
        ...fieldValues,
        ...values,
        organizationId,
        sourceId: params.sourceId,
        sourceType: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
        customizeUnitCode: this.getRelativeQuestionCustomize(),
      },
    });
  }

  getRelativeQuestionCustomize = () => {
    const code = this.bidFlag
      ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_RELATIVE_QUESTION'
      : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_RELATIVE_QUESTION';
    return code;
  };

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
  clarficationDetail(record = {}) {
    const {
      match,
      location: { search = {} },
    } = this.props;
    const { sourceId, rfxNum, companyId } = match.params;
    const {
      current,
      createFlag,
      sourceCategory,
      isReadOnly = '',
      externalBackPath = '',
    } = querystring.parse(search.substr(1));
    const { clarifyStatus = null } = record || {};
    const searchProps = querystring.stringify({
      current,
      createFlag,
      sourceCategory: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
      isReadOnly,
      externalBackPath,
    });
    // 新建、审批拒绝、撤销审批 - 可以进入编辑页面
    if (['NEW', 'REJECTED', 'REVOKED'].includes(clarifyStatus) && !isReadOnly) {
      this.props.history.push({
        pathname: `${this.routerActiveTabKey}/clarify-update/${sourceId}/${rfxNum}/sourceTitle/${companyId}/${record.clarifyId}`,
        search: searchProps,
      });
    } else if (getActiveTabKey().indexOf('clarification-letter') > -1) {
      openTab(
        {
          key: `${this.routerActiveTabKey}/clarify-detail/${sourceId}/${rfxNum}/sourceTitle/${companyId}/${record.clarifyId}`,
          path: `${this.routerActiveTabKey}/clarify-detail/${sourceId}/${rfxNum}/sourceTitle/${companyId}/${record.clarifyId}`,
          // title: intl.get(`ssrc.inquiryHall.view.message.button.clearAnswer`).d('澄清答疑'),
          title: 'srm.common.tab.title.ssrc.questionAnswer',
          closable: true,
          search: searchProps,
        },
        {
          closeCurrent: true,
        }
      );
    } else {
      this.props.history.push({
        pathname: `${this.routerActiveTabKey}/clarify-detail/${sourceId}/${rfxNum}/sourceTitle/${companyId}/${record.clarifyId}`,
        search: searchProps,
      });
    }
  }

  /**
   *  跳转问题详情页面
   */
  @Bind()
  jumpIssueDetail(record) {
    const {
      history,
      location,
      match: { params },
      questionRemote,
    } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { createFlag, current, sourceCategory, isReadOnly, externalBackPath = '' } =
      routerParam || {};

    let currentSearch = {};
    currentSearch = questionRemote
      ? questionRemote.process(
          'SSRC_INQUIRY_HALL_QUESTION_PROCESS_JUMPISSUEDETAIL_SEARCHOPTIONS',
          currentSearch,
          {
            record,
            that: this,
          }
        )
      : currentSearch;
    currentSearch = currentSearch || {};

    if (getActiveTabKey().indexOf('clarification-letter') > -1) {
      openTab(
        {
          key: `${this.routerActiveTabKey}/question-details/${record.issueHeaderId}/${params.rfxNum}/sourceTitle/${params.companyId}`,
          path: `${this.routerActiveTabKey}/question-details/${record.issueHeaderId}/${params.rfxNum}/sourceTitle/${params.companyId}`,
          // title: intl.get(`ssrc.inquiryHall.view.message.button.clearAnswer`).d('澄清答疑'),
          title: 'srm.common.tab.title.ssrc.questionAnswer',
          closable: true,
          search: querystring.stringify({
            createFlag,
            current,
            sourceCategory,
            isReadOnly,
            externalBackPath,
            ...currentSearch,
          }),
        },
        {
          closeCurrent: true,
        }
      );
    } else {
      history.push({
        pathname: `${this.routerActiveTabKey}/question-details/${record.issueHeaderId}/${params.rfxNum}/sourceTitle/${params.companyId}`,
        search: querystring.stringify({
          createFlag,
          current,
          sourceCategory,
          isReadOnly,
          externalBackPath,
          ...currentSearch,
        }),
      });
    }
  }

  /**
   *  新建跳转澄清函页面
   */
  @Bind()
  createClarification() {
    const { match, dispatch, location } = this.props;
    const { sourceId, rfxNum, companyId } = match.params;
    const routerParam = querystring.parse(location.search.substr(1));
    const { createFlag, current, externalBackPath = '' } = routerParam;
    const search = querystring.stringify({
      createFlag,
      current,
      externalBackPath,
    });
    dispatch(
      routerRedux.push({
        pathname: `${this.routerActiveTabKey}/clarify-create/${sourceId}/sourceTitle/${rfxNum}/${companyId}`,
        search,
      })
    );
  }

  /**
   *  引入问题新建跳转澄清函创建页面
   */
  @Bind()
  async createIssue(type) {
    const { match, location, questionRemote } = this.props;
    const { sourceId, rfxNum, companyId } = match.params;
    const { clarifySelectedRows, clarifySelectedRowKeys } = this.state;
    const { current, createFlag, sourceCategory, externalBackPath = '' } = querystring.parse(
      location.search.substr(1)
    );

    let allowCreateIssueFlag = true;

    if (questionRemote?.event) {
      allowCreateIssueFlag = await questionRemote.event.fireEvent('remoteCreateIssue', {
        type,
        that: this,
      });
    }
    if (!allowCreateIssueFlag) {
      return;
    }

    // 过滤出勾选数据
    // 关联问题新建时需要勾选关联行
    if (type === 'question' && clarifySelectedRows.length === 0) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.noSelectedRows`)
          .d('请勾选需要关联行!'),
      });
    } else {
      this.setState(
        {
          clarifySelectedRows: [],
          clarifySelectedRowKeys: [],
        },
        () => {
          this.props.history.push({
            pathname: `${
              this.routerActiveTabKey
            }/issue-create/${sourceId}/sourceTitle/${rfxNum}/${companyId}/${
              clarifySelectedRowKeys.length ? clarifySelectedRowKeys : false
            }`,
            search: querystring.stringify({
              current,
              createFlag,
              sourceCategory: ['RFQ', 'RFA'].includes(sourceCategory) ? 'RFX' : sourceCategory,
              externalBackPath,
            }),
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

  getBackPath() {
    const {
      match: { params },
      location: { search = {} },
    } = this.props;
    const { sourceCategory, backToPath = null, externalBackPath = '' } = querystring.parse(
      search.substr(1)
    );
    let back;

    // 外部链接
    if (externalBackPath) {
      return externalBackPath;
    }

    if (backToPath) {
      back = backToPath;
    } else {
      back = getActiveTabKey().includes('/pub')
        ? `/pub/ssrc/inquiry-hall/check-price-approval/${params.sourceId}?disabled=false&formCode=SSRC.RFX_CHECK_APPROVAL&processCode=SSRC.RFX_CHECK_APPROVAL`
        : `${this.activeTabKey}/list?sourceCategory=${sourceCategory}`;
    }
    if (this.routerActiveTabKey.indexOf('clarification-letter') > -1) back = null;
    return back;
  }

  tableCheckboxProps = (record) => {
    const { questionRemote, location } = this.props;
    const { headerInfo = {} } = this.state;
    const { sourceCategory } = querystring.parse(location.search.substr(1));
    const checkboxCommonProps = {};

    const checkboxProps = questionRemote
      ? questionRemote.process(
          'SSRC_INQUIRY_HALL_QUESTION_TABLE_ROW_CHECK_BOX_PROPS',
          checkboxCommonProps,
          {
            record,
            sourceKey: this.sourceKey,
            sourceCategory,
            headerInfo,
          }
        )
      : checkboxCommonProps;

    return checkboxProps;
  };

  // 关联问题附件下载
  @Bind()
  handleDownLoad() {
    const {
      match: { params },
      location: { search },
    } = this.props;
    const type = querystring.parse(search.substr(1))?.sourceCategory;

    const api = `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/clarify/purchaser-issue/attachment-download`;

    const param = this.handleGetFormValue() || {};
    const queryParams = map(param, (value, key) => {
      return { name: key, value };
    });

    this.setState({ downLoadLoading: true });

    downloadFile({
      requestUrl: api,
      queryParams: [
        ...(queryParams || []),
        { name: 'sourceId', value: params.sourceId },
        { name: 'sourceType', value: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type },
      ],
      method: 'GET',
    }).finally(() => this.setState({ downLoadLoading: false }));
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.clarifForm;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = {
      ...(formValues || {}),
    };
    return filterValues;
  }

  // 按钮组合
  @Bind()
  getButtons() {
    const { downLoadLoading = false, headerInfo = {} } = this.state;
    const {
      match: { params },
      location: { search },
      questionRemote,
    } = this.props;
    const type = querystring.parse(search.substr(1))?.sourceCategory;
    const buttons = [
      {
        name: 'exportRelatedQuestion',
        btnComp: ExcelExportPro,
        btnProps: {
          templateCode: 'SRM_C_SRM_SSRC_ISSUE_EXPORT',
          name: 'exportRelatedQuestion',
          method: 'GET',
          requestUrl: `/ssrc/v1/${getCurrentOrganizationId()}/clarify/purchaser-issue/export?sourceId=${
            params.sourceId
          }&sourceType=${['RFQ', 'RFA'].includes(type) ? 'RFX' : type}`,
          buttonText: intl.get(`ssrc.inquiryHall.button.export.relationQuestion`).d('导出关联问题'),
          queryParams: this.handleGetFormValue,
          otherButtonProps: {
            color: 'primary',
          },
        },
      },
      {
        name: 'relationQuestionDownLoad',
        btnType: 'c7n-pro',
        btnProps: { icon: 'get_app', onClick: this.handleDownLoad, loading: downLoadLoading },
        child: intl
          .get(`ssrc.inquiryHall.view.button.relationQuestion.download`)
          .d('关联问题附件下载'),
      },
    ];
    if (!questionRemote) return buttons;
    return questionRemote.process('SSRC_INQUIRY_HALL_QUESTION_PROCESS_HEADER_BUTTONS', buttons, {
      headerInfo,
      sourceId: params.sourceId,
      sourceType: ['RFQ', 'RFA'].includes(type) ? 'RFX' : type,
      handleClariSearch: this.handleClariSearch,
      handleSearch: this.handleSearch,
      handleClarifyRowSelectChange: this.handleClarifyRowSelectChange,
    });
  }

  render() {
    const { modelName = 'inquiryHall' } = this.props;
    const {
      match,
      Loading,
      location,
      history,
      location: { search },
      clarLoading,
      organizationId,
      [modelName]: {
        code = {},
        fetchMaintainList = [],
        maintainListPagination = {},
        fetchClarList = [],
        fetchClarListPagination = {},
      },
      questionRemote,
      customizeTable = null,
      sourceKey = INQUIRY,
      customizeBtnGroup,
      customizeFilterForm,
    } = this.props;
    const { sourceCategory: type, isReadOnly = '' } = querystring.parse(search.substr(1));
    const { sourceId } = match.params;
    const { clarifySelectedRows = {}, headerInfo } = this.state;
    const { sourceTitle, sourceNum } = headerInfo || {};
    // const routerParam = querystring.parse(this.props.location.search.substr(1));
    // const { createFlag } = routerParam;
    const rowSelection = {
      selectedRowKeys: clarifySelectedRows.map((item) => item.issueLineId),
      onChange: this.handleClarifyRowSelectChange,
      getCheckboxProps: (record) => this.tableCheckboxProps(record),
    };
    // 澄清函维护
    const maintainFormProps = {
      match,
      clarifyStatus: code.clarifyStatus,
      onSearch: this.handleSearch,
      onRef: this.handleMaintainRef,
      customizeFilterForm,
      bidFlag: this.bidFlag,
    };
    const maintainTableProps = {
      match,
      location,
      history,
      Loading,
      clarifyStatus: code.clarifyStatus,
      onClarfDetail: this.clarficationDetail,
      fetchMaintainList,
      maintainListPagination,
      onChange: this.handleSearch,
      isReadOnly,
      customizeTable,
      sourceKey,
      bidFlag: this.bidFlag,
    };
    // 引用问题
    const clarificationFormProps = {
      code,
      match,
      location,
      history,
      organizationId,
      onSearch: this.handleClariSearch,
      onRef: this.handleClarifRef,
    };
    const clarificationTableProps = {
      questionRemote,
      match,
      location,
      history,
      sourceCategory: type,
      rowSelection,
      organizationId,
      Loading: clarLoading,
      fetchClarList,
      fetchClarListPagination,
      clarifyType: code.clarifyType,
      isReadOnly,
      onIssueDetail: this.jumpIssueDetail,
      onChange: this.handleClariSearch,
      headerInfo,
      customizeTable,
      bidFlag: this.bidFlag,
    };
    // 二开埋点传入参数
    const renderProps = {
      rfxHeaderId: sourceId,
      organizationId,
      bidFlag: this.bidFlag,
    };
    const questionExportRenderProps = {
      rfxHeaderId: sourceId,
      bidFlag: this.bidFlag,
      disableFlag: fetchClarList.length === 0,
    };

    let lineQuestionCreate = !isReadOnly ? (
      <Button type="primary" onClick={() => this.createIssue('question')}>
        {intl.get('hzero.common.button.create').d('新建')}
      </Button>
    ) : (
      ''
    );

    lineQuestionCreate = questionRemote
      ? questionRemote.process(
          'SSRC_INQUIRY_HALL_QUESTION_PROCESS_LINEQUESTION_CREATE_BUTTONDOM',
          lineQuestionCreate,
          {
            that: this,
            isReadOnly,
          }
        )
      : lineQuestionCreate;

    return (
      <React.Fragment>
        <Header
          title={
            isReadOnly === 'Y'
              ? intl.get(`ssrc.inquiryHall.model.inquiryHall.questionAnswer`).d('澄清答疑')
              : intl.get(`ssrc.inquiryHall.view.title.clarificationMaintenance`).d('澄清函维护')
          }
          backPath={this.getBackPath()}
        >
          {isFunction(customizeBtnGroup)
            ? customizeBtnGroup(
                {
                  code: this.bidFlag
                    ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_HEADER_BUTTONS'
                    : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_HEADER_BUTTONS',
                  pro: true,
                },
              <DynamicButtons buttons={this.getButtons()} />
              )
            : null}
          {/* {this.state.activeKey === 'clarification' ? (
            <Button icon="plus" type="primary" onClick={this.createClarification}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          ) : (
            <Button icon="plus" type="primary" onClick={this.createIssue}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )} */}
          {questionRemote ? (
            questionRemote.render(
              'SSRC_INQUIRY_HALL_QUESTION_RENDER_EXPORT_BUTTON',
              <></>,
              renderProps
            )
          ) : (
            <></>
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <div className={styles['question-title']}>
            <span style={{ marginRight: '16px' }}>
              {intl.get(`ssrc.inquiryHall.view.message.button.bidNum`).d('寻源编号')}: {sourceNum}
            </span>
            <span>
              {intl.get(`ssrc.inquiryHall.view.message.button.bidTitle`).d('寻源标题')}:
              <Popover content={sourceTitle}>{sourceTitle}</Popover>
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
              tab={
                isReadOnly === 'Y'
                  ? intl.get(`ssrc.inquiryHall.view.message.title.viewClarifyDetail`).d('澄清函')
                  : intl.get(`ssrc.inquiryHall.view.title.clarificationMaintenance`).d('澄清函维护')
              }
            >
              <div className="table-list-search">
                <MaintainForm {...maintainFormProps} />
              </div>
              <div className={styles['question-create']}>
                {/* {Number(createFlag) === 1 && (
                  <Button type="primary" onClick={this.createClarification}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                )} */}
                {!isReadOnly && (
                  <Button type="primary" onClick={this.createIssue.bind(this, 'clarification')}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                )}
              </div>
              <MaintainTable {...maintainTableProps} />
            </TabPane>
            <TabPane
              key="question"
              tab={
                <>
                  {isReadOnly === 'Y'
                    ? intl
                        .get(`ssrc.inquiryHall.view.message.title.detail.viewLineQuestion`)
                        .d('供应商问题')
                    : intl.get(`ssrc.inquiryHall.view.title.lineQuestion`).d('关联问题')}
                  <Badge
                    count={fetchClarList[0]?.unreadIssueCount}
                    className={styles['badge-tab']}
                  />
                </>
              }
            >
              <div className="table-list-search">
                <ClarificationForm {...clarificationFormProps} />
              </div>
              <div className={styles['question-create']}>
                {/* {Number(createFlag) === 1 && (
                  <Button type="primary" onClick={this.createIssue}>
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                )} */}
                {questionRemote ? (
                  questionRemote.render(
                    'SSRC_INQUIRY_HALL_QUESTION_RENDER_QUESTIONEXPORT_BUTTON',
                    <></>,
                    questionExportRenderProps
                  )
                ) : (
                  <></>
                )}
                {lineQuestionCreate}
              </div>
              <ClarificationTable {...clarificationTableProps} />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}

const Hooc = (Com) => {
  return compose(
    // withCustomize({
    //   unitCode: [
    //     `SSRC.${pageSymbol}_HALL_QUESTION_LIST.CLARIFICATION`, // 澄清涵维护
    //   ],
    // }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common'],
    }),
    connect(({ inquiryHall, loading }) => ({
      modelName: 'inquiryHall',
      inquiryHall,
      Loading: loading.effects['inquiryHall/fetchMaintainList'],
      clarLoading: loading.effects['inquiryHall/fetchClarList'],
      organizationId: getCurrentOrganizationId(),
    })),
    cacheComponent({ cacheKey: '/ssrc/bid-hall/inter-question/:sourceHeaId/:bidNum' }),
    remote(
      {
        code: 'SSRC_INQUIRY_HALL_QUESTION',
        name: 'questionRemote',
      },
      {
        events: {
          remoteCreateIssue() {},
        },
      }
    )
  )(Com);
};

export default Hooc(Question);
export { Question, Hooc };
