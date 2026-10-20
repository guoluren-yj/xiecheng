/**
 * 我发起的8D - 明细
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */ 
import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Icon, Tabs, Modal } from 'hzero-ui';
import classNames from 'classnames';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import { Button as PermissionButton } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isEmpty, throttle, omit } from 'lodash';
import uuidv4 from 'uuid/v4';
import { Bind, Throttle } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { getCurrentOrganizationId, getResponse, getEditTableData } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import querystring from 'querystring';
import moment from 'moment';
import { queryApprovalMethod } from '@/services/create8DService';
import { validate8D, save8D } from '@/services/initiated8DService';
import CustomForm from '@/routes/components/CustomForm';
import PrintProButton from '_components/PrintProButton';
import { SRM_SQAM } from '_utils/config';
import remote from 'hzero-front/lib/utils/remote';
import { getFileNumByUUID } from '@/utils/utils';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import QuestionPanel from '../../components/QuestionPanel';
import GroupMemberPanel from '../../components/GroupMemberPanel';
import CongratulationPanel from '../../components/CongratulationPanel';
import AttachmentModal from '../../components/AttachmentC7nModal';
import styles from './index.less';

import PromiseMaintainProvide from '../../components/PorvisionalMeasure/PromiseMaintainProvide';
import FollowUpProduce from '../../components/PorvisionalMeasure/FollowUpProduce';
import RootReasonAnalyze from '../../components/rootReasonAnalyze';
import ForeverDealSolution from '../../components/ForeverDealSolution';
import RelateStandard from '../../components/RelateStandard';
import IsSuitUnderItem from '../../components/IsSuitUnderItem';
import SourceInfo from '../../components/SourceInfoPanel';
import Correlation from '../../components/CorrelationPanel';
import PurchaseOrderPanel from '../../components/PurchaseOrderPanel';
import EffectTrackPanel from '../../components/EffectTrackPanel';
import OperatorRecord from '../../components/QualityRectificationRecord';
import TrxQuoteList from '../../components/TrxQuoteList';
import SiteInvestigate from '../../components/SiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';

const prefix = `sqam.common.view.message.title`;
const { TabPane } = Tabs;
const rejProblemStatus = ['NEW', 'ICA_SUBMITTED', 'PCA_SUBMITTED', 'COMPLETED', 'VALIDATED'];
const rejApprovalProblemStatus = [
  'PUBULISH APPROVAE REJECT',
  'CANCEL FINISH APPROVAL REJECT',
  'TRACK APPROVAL REJECT',
];
const customCode = [
  'SQAM.INITIATED_8D.DETAIL.BASIC',
  'SQAM.INITIATED_8D.DETAIL.GROUPMEMBER',
  'SQAM.INITIATED_8D.DETAIL.SHORTMEASURES',
  'SQAM.INITIATED_8D.DETAIL.PERMANENTACTION',
  'SQAM.INITIATED_8D.DETAIL.STANDARDIZATION',
  'SQAM.INITIATED_8D.DETAIL.OTHERAPPLICABLE',
  'SQAM.INITIATED_8D.DETAIL.TEAMCONGRATULATIONS',
  'SQAM.INITIATED_8D.DETAIL.TEMPMEASURE',
  'SQAM.INITIATED_8D.DETAIL.ROOTCAUSE',
  'SQAM.INITIATED_8D.DETAIL.RESULTSTRACKING',
  'SQAM.INITIATED_8D.DETAIL.COLLAPSE',
  'SQAM.INITIATED_8D.DETAIL.INSPECT',
  'SQAM.INITIATED_8D.DETAIL.OTHERINFO',
  'SQAM.INITIATED_8D.DETAIL.PROBLEM',
  'SQAM.INITIATED_8D.DETAIL.HEAD_BTNS',
  'SQAM.INITIATED_8D.DETAIL.TRX',
  'SQAM.INITIATED_8D.DETAIL.CUSZ_FORM',
  'SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_B',
  'SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_C',
  'SQAM.INITIATED_8D.DETAIL.CORRELATION_8D_LIST',
  'SQAM.INITIATED_8D.DETAIL.OTHER_BTNS',
  'SQAM.INITIATED_8D.DETAIL.BASIC_TABS',
  'SQAM.INITIATED_8D.DETAIL.OTHERINFO_A',
];
@remote({
  code: 'SQAM_INITIATED8D_DETAIL',
  name: 'remote',
})
@withCustomize({
  unitCode: customCode,
})
@connect(
  ({
    initiated8D,
    loading,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    create8D,
  }) => ({
    create8D,
    initiated8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    evalLoading: loading.effects['create8D/fetchList'],
    copyLoading: loading.effects['initiated8D/copyQualityRectification'],
    recallLoading: loading.effects['initiated8D/recall'],
    loading: {
      detail: loading.effects['initiated8D/fetch8DBasicInfo'],
      operator: loading.effects['initiated8D/fetchOperatorRecord'],
      version: loading.effects['initiated8D/fetchHistoryVersion'],
      attachment: loading.effects['audit8D/fetchAttachment'],
    },
    promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
    followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
    rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
    foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
    isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
    standardizingLoading: loading.effects['standardizing/fetchData'],
    fetchSourceInfoLoading: loading.effects['initiated8D/fetchSourceInfoLoading'],
    fetchCorrelationLoading: loading.effects['initiated8D/relation8D'],
    fetchOrderLoading: loading.effects['initiated8D/fetchPurchaseOrder'],
    printLoading: loading.effects['initiated8D/print'],
    tenantId: getCurrentOrganizationId(),
  })
)
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'sslm.evaluationQuery',
  ],
})
export default class Detail extends PureComponent {
  form = {};

  constructor(props) {
    super(props);
    const {
      history: {
        location: { search },
      },
    } = this.props;
    // editAll 工作流可编辑基本信息标准字段其他个性化字段 ，editFlag工作流可编辑基本信息问题描述个性化字段
    const { editFlag, editAll } = querystring.parse(search.substr(1));
    this.state = {
      attachmentVisible: false,
      operatorRecordVisible: false,
      selectedRowKeys: [],
      selectedRowsMember: [],
      collapseKeys: [
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'customA',
        'customB',
        'customC',
        'otherA',
      ],
      activeKey: 'basicInfo',
      isApprovalShow: false,
      nextId: null,
      evalHeaderIds: [],
      editFlag: editFlag === '1' || editAll === 'true',
      editAll: editAll === 'true',
      fileNum: 0,
    };
  }

  async componentDidMount() {
    const { dispatch, onLoad, onFormLoaded } = this.props;
    const { editFlag } = this.state;
    const res = await this.handleSearch();
    this.fetchSettingValue();
    dispatch({ type: 'initiated8D/fetchLov' });
    if (onLoad && editFlag) {
      onLoad({
        submit: this.workFlowSubmit,
      });
    }
    if (onFormLoaded && editFlag && res) onFormLoaded(true);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'initiated8D/updateState',
      payload: {
        basicInfo: {},
        operatorRecords: [],
        historyVersion: [],
        correlationList: [],
        sourceInfolist: [],
        purchaseOrderList: [],
      },
    });
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      match: { params = {} },
    } = this.props;
    const {
      match: { params: nextParams = {} },
    } = nextProps;
    const id = params.id || params.problemHeaderId;
    const nextId = nextParams.id || nextParams.problemHeaderId;
    if (nextId && id !== nextId) {
      this.setState({ nextId });
      this.handleSearch(nextId);
    }
  }

  /**
   * 查询
   */
  @Bind()
  async handleSearch(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id, problemHeaderId: problemHId } = match.params;
    const res = await dispatch({
      type: 'initiated8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: nextId || id || problemHId,
        customizeUnitCode:
          'SQAM.INITIATED_8D.DETAIL.BASIC,SQAM.INITIATED_8D.DETAIL.PROBLEM,SQAM.INITIATED_8D.DETAIL.GROUPMEMBER,SQAM.INITIATED_8D.DETAIL.TEAMCONGRATULATIONS,SQAM.INITIATED_8D.DETAIL.RESULTSTRACKING,SQAM.INITIATED_8D.DETAIL.OTHERINFO,SQAM.INITIATED_8D.DETAIL.CUSZ_FORM,SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_B,SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_C,SQAM.INITIATED_8D.DETAIL.OTHERINFO_A',
        menuEntryPoint: 'CUSTOMER_OWNED',
      },
    }).then((result) => {
      const {
        initiated8D: {
          basicInfo: {
            sourceCode,
            rcvTrxLineIds,
            evalHeaderIds,
            problemHeaderId,
            attachmentUuid,
            attachmentInterUuid,
            supplierAttachmentUuid,
          },
        },
      } = this.props;
      if (sourceCode === 'INCOMING_INSPECTION') this.fetchSourceInfo(nextId);
      if (rcvTrxLineIds) {
        this.fetchItemTrx(rcvTrxLineIds);
      }
      if (sourceCode === 'SITE_EVAL') {
        this.siteInvestigateReport(evalHeaderIds);
      }
      if (sourceCode === 'REPORT_EVAL') {
        this.setState({ evalHeaderIds }, () => {
          this.siteEvalReportHeader();
        });
      }
      if (sourceCode === 'KPI_EVAL') {
        this.handleEvaluationSearch(problemHeaderId);
      }
      this.getAttachmentNum([attachmentUuid, attachmentInterUuid, supplierAttachmentUuid]);
      return result;
    });
    this.fetchCorrelation(nextId);
    this.fetchPurchaseOrder(nextId);
    return res;
  }

  @Bind()
  async getAttachmentNum(uuids) {
    const num = await getFileNumByUUID(uuids);
    this.setState({ fileNum: num });
  }

  // 查询物料事务行号
  @Bind()
  async fetchItemTrx(rcvTrxLineIds) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/fetchTrxHeader',
      payload: {
        tenantId,
        query: {
          // decisionResults: decisionResult ? [decisionResult] : decisionResults,
          // assessmentResults,
          withOutAuthFlag: 1,
          rcvTrxLineIds,
          customizeUnitCode: 'SQAM.INITIATED_8D.DETAIL.TRX',
        },
      },
    });
  }

  // 现场考察结果
  @Bind()
  async siteInvestigateReport(evalHeaderIds) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/siteInvestigateReport',
      payload: {
        tenantId,
        query: {
          evalHeaderIds,
        },
      },
    });
  }

  // 评估报告
  @Bind()
  async siteEvalReportHeader(page = {}) {
    const { tenantId, dispatch } = this.props;
    const { evalHeaderIds } = this.state;
    if (isEmpty(evalHeaderIds)) return;
    dispatch({
      type: 'initiated8D/siteEvalReportHeader',
      payload: {
        tenantId,
        query: {
          evalHeaderIds,
          page,
        },
      },
    });
  }

  // 查询配置中心是否开启无需审批
  @Bind()
  async fetchSettingValue() {
    const { tenantId, match } = this.props;
    const { id, problemHeaderId } = match.params;
    const res010706 = getResponse(
      await queryApprovalMethod({
        tenantId,
        problemHeaderId: id || problemHeaderId,
        // settingCode: '010706',
      })
    );
    if (res010706) {
      const isApprovalShow = res010706.settingValue === '1';
      this.setState({ isApprovalShow });
    }
  }

  // 查询关联8D
  @Bind()
  fetchCorrelation(nextId, page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type: 'initiated8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId: nextId || id || problemHeaderId,
        customizeUnitCode: 'SQAM.INITIATED_8D.DETAIL.CORRELATION_8D_LIST',
        page,
      },
    });
  }

  @Bind()
  fectchCorrelationPage(page = {}) {
    this.fetchCorrelation(this.state.nextId, page);
  }

  @Bind()
  fetchSourceInfo(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type: 'initiated8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: nextId || id || problemHeaderId,
        customizeUnitCode: 'SQAM.INITIATED_8D.DETAIL.INSPECT',
      },
    });
  }

  @Bind()
  fetchPurchaseOrder(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type: 'initiated8D/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: nextId || id || problemHeaderId,
      },
    });
  }

  /**
   * 附件查看
   */
  @Bind()
  handleAttachmentOption() {
    this.setState({ attachmentVisible: true });
  }

  @Bind()
  handleModal(visible, flag) {
    this.setState({ [visible]: flag });
  }

  /**
   * 隐藏附件Modal
   */
  @Bind()
  handleAttachmentModalHidden() {
    this.setState({
      attachmentVisible: false,
    });
  }

  /**
   * 历史版本详细信息跳转
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleVersionDetail(record = {}) {
    const {
      dispatch,
      initiated8D: {
        basicInfo: { problemHeaderId },
      },
    } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/initiated8D/history/${record.problemHeaderHisId}/${problemHeaderId}`,
      })
    );
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 关联8d查询
   */
  @Bind()
  fetchAssociation() {
    const { dispatch, match } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type: 'initiated8D/fetchAssociation',
      payload: { problemHeaderId: id || problemHeaderId },
    });
  }

  /**
   * 查询详情页的Table
   */
  @Bind()
  fetchReadOnlyTable(type, page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type,
      payload: { edProblemHeaderId: id || problemHeaderId, tenantId, ...page },
    });
  }

  @Bind()
  tabChange(activeKey) {
    this.setState({
      activeKey,
    });
  }

  /**
   * getAffixContainer-获取给 Affix 组件使用的元素
   * @return {HTMLElement}
   */
  @Bind()
  getAffixContainer() {
    const parent = this.getParent(
      document.getElementById('sqam-initiated8D-detail-content-inner-wrapper')
    );
    return parent || document.body;
  }

  /**
   * getParent-获取 dom 的parent
   * @param {HTMLElement} dom
   * @return {HTMLElement}
   */
  @Bind()
  getParent(dom) {
    const parent = dom && dom.parentNode.parentNode;
    return parent && parent.nodeType !== 11 ? parent : null;
  }

  @Bind()
  tabTextRender(type) {
    const { initiated8D = {}, create8D = {} } = this.props;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      relatioPagination,
      siteEvalReportPage,
    } = initiated8D;
    const { quoteTrxList = [], siteInvestigateReportList = [], evalDataSource = [] } = create8D;
    const textObj = {
      rectification: {
        tab: intl.get(`${prefix}.tab.relatedRectification`).d(`关联整改报告`),
        count: relatioPagination?.total || correlationList?.length,
      },
      inspect: {
        count: sourceInfolist?.length,
        tab: intl.get(`${prefix}.tab.qualityInspect`).d(`关联质检单`),
      },
      purchaseOrder: {
        count: purchaseOrderList?.length,
        tab: intl.get(`${prefix}.tab.relatedPurchaseOrder`).d(`关联采购订单`),
      },
      trxInspect: {
        count: quoteTrxList?.length,
        tab: intl.get(`${prefix}.tab.trxRcvLine`).d(`关联质检事务`),
        content: null,
      },
      siteInvestigateReport: {
        count: siteInvestigateReportList?.length,
        tab: intl.get(`${prefix}.tab.siteInvestigateReport`).d(`现场考察结果`),
        content: null,
      },
      siteEval: {
        count: siteEvalReportPage?.total,
        tab: intl.get(`${prefix}.tab.siteEval`).d(`评估报告`),
        content: null,
      },
      supEvaluationFile: {
        count: evalDataSource?.length,
        tab: intl.get(`${prefix}.tab.supEvaluationFile`).d(`供应商考评档案`),
        content: null,
      },
    };
    const { count, tab } = textObj[type] || {};
    const tabHtml = (
      <span style={{ color: '#4c4c4c' }}>
        {tab}
        <strong style={{ padding: '5px', color: '#29BECE' }}>{count}</strong>
      </span>
    );
    return tabHtml;
  }

  @Bind()
  handlePrint(key) {
    const { dispatch, tenantId, match } = this.props;
    const { id, problemHeaderId } = match.params;
    dispatch({
      type: 'initiated8D/print',
      payload: {
        tenantId,
        problemHeaderId: id || problemHeaderId,
        outputType: key,
      },
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const type =
            key === 'PDF'
              ? 'application/pdf'
              : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          const file = new Blob([res], { type });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
    });
  }

  @Bind()
  handleEvaluationSearch(problemHeaderId) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/fetchList',
      payload: {
        tenantId,
        // page: isEmpty(fields) ? {} : fields,
        // pageEntryPoint: 'CUSTOMER_OWNED',
        // customizeUnitCode:
        //   'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER,SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
        problemHeaderId,
        // source: 'purchase',
      },
    });
  }

  @Bind()
  getAnchorLinkList() {
    const { remote: remoteProps } = this.props;
    const linkList = [
      {
        code: 'b',
        key: 'sqam-initiated8D-panel-basic',
        title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
      },
      {
        code: 'c',
        key: 'sqam-initiated8D-panel-question',
        title: intl.get(`${prefix}.panel.question`).d('问题描述'),
      },
      {
        code: 'd',
        key: 'sqam-initiated8D-panel-groupMember',
        title: intl.get(`${prefix}.panel.groupMember`).d('小组成员'),
      },
      {
        code: 'e',
        key: 'sqam-initiated8D-panel-promiseMaintainProvide',
        title: intl.get(`${prefix}.panel.promiseMaintainProvide`).d('临时围堵措施—保证持续供货'),
      },
      {
        code: 'f',
        key: 'sqam-initiated8D-panel-shortMeature',
        title: intl.get(`${prefix}.panel.shortMeature`).d('短期措施'),
      },
      {
        code: 'g',
        key: 'sqam-initiated8D-panel-analyzeReason',
        title: intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析'),
      },
      {
        code: 'h',
        key: 'sqam-initiated8D-panel-foreverDealSolution',
        title: intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施'),
      },
      {
        code: 'i',
        key: 'sqam-initiated8D-panel-standard',
        title: intl.get(`${prefix}.panel.standard`).d('相关标准化'),
      },
      {
        code: 'j',
        key: 'sqam-initiated8D-panel-congratulation',
        title: intl.get(`${prefix}.panel.congratulation`).d('小组祝贺'),
      },
      {
        code: 'k',
        key: 'sqam-initiated8D-panel-applyItem',
        title: intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目'),
      },
      {
        code: 'l',
        key: 'sqam-initiated8D-panel-effectTrack',
        title: intl.get(`${prefix}.panel.effectTrack`).d('成效追踪'),
      },
      {
        code: 'm',
        key: 'sqam-initiated8D-panel-otherInfo',
        title: intl.get(`${prefix}.panel.otherInfo`).d('其他信息'),
      },
      {
        code: 'customA',
        key: `sqam-initiated8D-panel-custom`,
        title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
      },
      {
        code: 'customB',
        key: `sqam-initiated8D-panel-custom-b`,
        title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
      },
      {
        code: 'customC',
        key: `sqam-initiated8D-panel-custom-c`,
        title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
      },
      {
        code: 'otherA',
        key: `sqam-initiated8D-panel-otherInfo-A`,
        title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM.INITIATED_8D_DETAIL.COLLAPSE_FIELDS', linkList)
      : linkList;
  }

  @Bind()
  async handleCopy() {
    const {
      dispatch,
      history,
      initiated8D: { basicInfo = {} },
    } = this.props;
    const res = await dispatch({
      type: 'initiated8D/copyQualityRectification',
      payload: basicInfo,
    });
    if (res && res.problemHeaderId) {
      history.push({
        pathname: `/sqam/create8D/detail/${res.problemHeaderId}`,
      });
    }
  }

  @Bind()
  async validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return dataSource;
    }
    const hasFormFlag = dataSource.some((v) => v?.$form);
    if (!hasFormFlag) return dataSource;
    return new Promise((resolve) => {
      const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      if (validateDataSource.length !== 0) {
        resolve(validateDataSource);
      }
      resolve(false);
    }).catch();
  }

  workFlowSubmit = (param) => {
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        const { editAll } = this.state;
        const {
          initiated8D,
          promiseMaintainProvide = {},
          followUpProduce = {},
          rootReasonAnalyze = {},
          foreverDealSolution = {},
          isSuitUnderItem = {},
          relateStandard = {},
        } = this.props;
        const { basicInfo } = initiated8D || {};
        const { edProblemTeamList = [], edProblemAction = {} } = basicInfo || {};
        let formError;
        // eslint-disable-next-line
        if (this.form.c?.validateFieldsAndScroll) {
          await this.form.c.validateFieldsAndScroll((err) => {
            if (err) formError = err;
          });
        }
        // eslint-disable-next-line
        if (this.form.basicInfo?.validateFieldsAndScroll) {
          await this.form.basicInfo.validateFieldsAndScroll((err) => {
            if (err) formError = err;
          });
        }
        if (editAll) {
          // eslint-disable-next-line
          if (this.form?.j?.validateFieldsAndScroll) {
            await this.form.j.validateFieldsAndScroll((err) => {
              if (err) formError = err;
            });
          }
          // eslint-disable-next-line
          if (this.form?.customeA?.validateFieldsAndScroll) {
            await this.form.customeA.validateFieldsAndScroll((err) => {
              if (err) formError = true;
            });
          }
          // eslint-disable-next-line
          if (this.form?.customB?.validateFieldsAndScroll) {
            await this.form.customB.validateFieldsAndScroll((err) => {
              if (err) formError = true;
            });
          }
          // eslint-disable-next-line
          if (this.form?.customC?.validateFieldsAndScroll) {
            await this.form.customC.validateFieldsAndScroll((err) => {
              if (err) formError = true;
            });
          }
        }
        if (formError) return reject();
        let data = {};
        const formBasic = this.form.basicInfo?.getFieldsValue
          ? this.form.basicInfo.getFieldsValue()
          : {};
        const { initiated8DProvide = {} } = promiseMaintainProvide;
        const { initiated8DFollowUp = {} } = followUpProduce;
        const { initiated8DReason = {} } = rootReasonAnalyze;
        const { initiated8DSolution = {} } = foreverDealSolution;
        const { initiated8DSuit = {} } = isSuitUnderItem;
        const { initiated8DStandard = {} } = relateStandard;

        const { promiseMaintainProvideList = [] } = initiated8DProvide;
        const { followUpProduceList = [] } = initiated8DFollowUp;
        const { rootReasonAnalyzeList = [] } = initiated8DReason;
        const { foreverDealSolutionList = [] } = initiated8DSolution;
        const { relateStandardList = [] } = initiated8DStandard;
        const { isSuitUnderItemList = [] } = initiated8DSuit;

        // 小组成员
        const newGroupMemberList = this.handleDataTypes(edProblemTeamList, 'getEditedData');
        const editedGroupMemberList = this.handleDataTypes(newGroupMemberList, 'getEditedData');
        const validateMember = await this.validateEditTableDataSource(
          editedGroupMemberList,
          [],
          {}
        );
        if (!validateMember) return reject();
        // 小组成员
        const newGroupMemberDataList = this.handleData(editedGroupMemberList, 'problemTeamId');
        if (editAll) {
          // 临时围堵措施—保证持续供货
          const newContinueDataSource = this.handleDataTypes(
            promiseMaintainProvideList,
            'filterNotDelete'
          );
          const editedContinueDataSource = this.handleDataTypes(
            newContinueDataSource,
            'getEditedData'
          );

          // 临时围堵措施—针对后续生产
          const newFollowUpProduceList = this.handleDataTypes(
            followUpProduceList,
            'filterNotDelete'
          );
          const editedFollowUpProduceList = this.handleDataTypes(
            newFollowUpProduceList,
            'getEditedData'
          );
          // 根本原因分析
          const newRootReasonAnalyzeList = this.handleDataTypes(
            rootReasonAnalyzeList,
            'filterNotDelete'
          );
          const editedRootReasonAnalyzeList = this.handleDataTypes(
            newRootReasonAnalyzeList,
            'getEditedData'
          );

          // 永久纠正措施
          const newForeverDealSolutionList = this.handleDataTypes(
            foreverDealSolutionList,
            'filterNotDelete'
          );
          const editedForeverDealSolutionList = this.handleDataTypes(
            newForeverDealSolutionList,
            'getEditedData'
          );
          // 是否适用以下项目
          const newIsSuitUnderItemList = this.handleDataTypes(
            isSuitUnderItemList,
            'filterNotDelete'
          );
          const editedIsSuitUnderItemList = this.handleDataTypes(
            newIsSuitUnderItemList,
            'getEditedData'
          );

          // 相关标准化
          const newRelateStandardList = this.handleDataTypes(relateStandardList, 'filterNotDelete');
          const editedRelateStandardList = this.handleDataTypes(
            newRelateStandardList,
            'getEditedData'
          );

          // 其他信息（如果配置了个性化）
          const newlineListSource = this.handleDataTypes(
            basicInfo.lineList || [],
            'filterNotDelete'
          );
          const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');

          const newlineListSourceA = this.handleDataTypes(
            basicInfo.otherDetailList || [],
            'filterNotDelete'
          );
          const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');

          const validateCon = await this.validateEditTableDataSource(
            editedContinueDataSource,
            [],
            {}
          );
          const validateFollow = await this.validateEditTableDataSource(
            editedFollowUpProduceList,
            [],
            {}
          );
          const validateReason = await this.validateEditTableDataSource(
            editedRootReasonAnalyzeList,
            [],
            {}
          );
          const validateForever = await this.validateEditTableDataSource(
            editedForeverDealSolutionList,
            [],
            {}
          );
          const validateSuit = await this.validateEditTableDataSource(
            editedIsSuitUnderItemList,
            [],
            {}
          );
          const validateRelate = await this.validateEditTableDataSource(
            editedRelateStandardList,
            [],
            {}
          );
          const validateOther = await this.validateEditTableDataSource(editlineList, [], {});
          const validateOtherA = await this.validateEditTableDataSource(editlineListA, [], {});
          if (
            !validateCon ||
            !validateFollow ||
            !validateReason ||
            !validateForever ||
            !validateSuit ||
            !validateRelate ||
            !validateOther ||
            !validateOtherA
          ) {
            return reject();
          }
          const formCustomA = this.form?.customA?.getFieldsValue
            ? this.form.customA.getFieldsValue()
            : {};
          const formCustomB = this.form?.customB?.getFieldsValue
            ? this.form.customB.getFieldsValue()
            : {};
          const formCustomC = this.form?.customB?.getFieldsValue
            ? this.form.customC.getFieldsValue()
            : {};
          const formJ = this.form?.j?.getFieldsValue ? this.form.j.getFieldsValue() : {};
          // 临时围堵措施—保证持续供货
          let newPromiseMaintainProvideList = this.handleData(
            promiseMaintainProvideList,
            'edProblemTeamId'
          );
          newPromiseMaintainProvideList = newPromiseMaintainProvideList.map((item) => {
            const effectFlag = item.badQuantity === 0 ? 0 : 1;
            const suppliyEndDate =
              item.suppliyEndDate && moment(item.suppliyEndDate).format(DATETIME_MIN);
            return {
              ...item,
              effectFlag,
              suppliyEndDate,
            };
          });
          // 临时围堵措施—针对后续生产
          let FinallyFollowUpProduceList = this.handleData(followUpProduceList, 'produceActionId');
          FinallyFollowUpProduceList = FinallyFollowUpProduceList.map((item) => {
            const produceEndDate =
              item.produceEndDate && moment(item.produceEndDate).format(DATETIME_MIN);
            return {
              ...item,
              produceEndDate,
            };
          });

          // 根本原因分析
          const finallyRootReasonAnalyzeList = this.handleData(
            rootReasonAnalyzeList,
            'rootCauseId'
          );
          // 永久纠正措施
          let finallyForeverDealSolutionList = this.handleData(
            foreverDealSolutionList,
            'pcaActionId'
          );
          finallyForeverDealSolutionList = finallyForeverDealSolutionList.map((item) => {
            const pcaActionEndDate =
              item.pcaActionEndDate && moment(item.pcaActionEndDate).format(DATETIME_MIN);
            return {
              ...item,
              pcaActionEndDate,
            };
          });
          // 是否适用以下项目
          let finallyIsSuitUnderItemSolutionList = this.handleData(
            isSuitUnderItemList,
            'applicableItemsId'
          );
          finallyIsSuitUnderItemSolutionList = finallyIsSuitUnderItemSolutionList.map((item) => {
            const handleFlag = item.handleFlag ? 1 : 0;
            return {
              ...item,
              handleFlag,
            };
          });
          // 相关标准化
          let finallyRelateStandardSolutionList = this.handleData(
            relateStandardList,
            'relevantStandardId'
          );
          finallyRelateStandardSolutionList = finallyRelateStandardSolutionList.map((item) => {
            const handleFlag = item.handleFlag ? 1 : 0;
            return {
              ...item,
              handleFlag,
            };
          });
          // 其他信息
          const finallylineList = this.handleData(basicInfo.lineList, 'otherInfoId');
          const finallylineListA = this.handleData(basicInfo.otherDetailList, 'otherDetailId');
          data = {
            ...data,
            ...formCustomA,
            ...formCustomB,
            ...formCustomC,
            edProblemSupplyActionList: newPromiseMaintainProvideList,
            edProblemProduceActionList: FinallyFollowUpProduceList,
            edProblemRootCauseList: finallyRootReasonAnalyzeList,
            edProblemPcaActionList: finallyForeverDealSolutionList,
            edProblemApplicableItemsList: finallyIsSuitUnderItemSolutionList,
            edProblemRelevantStandardList: finallyRelateStandardSolutionList,
            lineList: finallylineList,
            otherDetailList: finallylineListA,
            edProblemAction: {
              ...edProblemAction,
              ...formJ,
            },
          };
        }

        const formC = this.form?.c?.getFieldsValue ? this.form.c.getFieldsValue() : {};

        data = {
          ...basicInfo,
          ...formBasic,
          ...data,
          ...formC,
          edProblemTeamList: newGroupMemberDataList.map((item) => ({
            ...item,
            optcamp: 'PURCHASER',
          })),
          customizeUnitCode: customCode.join(),
        };
        const validateOk = async () => {
          const res = getResponse(await save8D(data));
          return res ? resolve() : reject();
        };
        const validateRes = getResponse(await validate8D(data));
        const { validatedCode, msg } = validateRes || {};
        if (!validateRes) return reject();
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            children: msg,
            onOk: validateOk,
            onCancel: () => reject(),
          });
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: msg,
          });
          return reject();
        } else if (validateRes) {
          return validateOk();
        }
      } else {
        return resolve();
      }
    });
  };

  @Bind()
  handleData(originData = [], rowKey) {
    if (!originData || originData?.length === 0) return [];
    const activeMem = originData.filter((i) => i.deleteFlag !== 1);
    if (Array.isArray(activeMem) && !isEmpty(activeMem)) {
      const editMemList = activeMem.filter((i) => ['update', 'create'].includes(i._status));
      // 区分： 有无进行过小组成员的数据修改(新增、编辑)
      let validateFlag = false;
      let params = [];
      let memList = [];
      if (editMemList.length === 0) {
        // 无新增/编辑状态数据
        validateFlag = true;
        memList = activeMem;
      } else {
        params = getEditTableData(editMemList, [rowKey]);
        if (Array.isArray(params) && params.length !== 0) {
          validateFlag = true;
          memList = activeMem.filter((i) => !['update', 'create'].includes(i._status));
        }
      }
      if (validateFlag) {
        const deleteMem = originData.filter((i) => i.deleteFlag === 1);
        const allGroupMembers = [...params, ...memList].map((rec) => {
          const { _status, edProblemHeaderId, ...info } = rec;
          return info;
        });
        return [...allGroupMembers, ...deleteMem];
      }
    }
    return [];
  }

  @Bind()
  handleDataTypes(dataSource, typeCode) {
    switch (typeCode) {
      case 'filterDelete':
        return dataSource?.filter((i) => i.deleteFlag === 1) || [];
      case 'filterNotDelete':
        return dataSource?.filter((i) => i.deleteFlag !== 1) || [];
      case 'getEditedData':
        return dataSource?.filter((i) => ['update', 'create'].includes(i._status)) || [];
      default:
        return dataSource;
    }
  }

  // 点击撤回
  handleWithdraw = () => {
    Modal.confirm({
      title: intl.get('sqam.common.view.message.confirmRecall').d('是否确认撤回?'),
      onOk: () => {
        const {
          dispatch,
          initiated8D: { basicInfo = {} },
        } = this.props;
        dispatch({
          type: 'initiated8D/recall',
          payload: {
            basicInfo,
            customizeUnitCode: customCode.join(),
          },
        }).then((result) => {
          if (result) {
            notification.success();
            this.handleSearch();
          }
        });
      },
      onCancel() {},
    });
  };

  @Bind()
  headerBtnsRender() {
    const { isApprovalShow, fileNum } = this.state;
    const {
      match,
      loading,
      copyLoading,
      initiated8D: { basicInfo = {} },
      printLoading = false,
      tenantId,
      remote: remoteProps,
      recallLoading,
    } = this.props;
    const { onlyReadOperation } = match.params;
    const { detail: detailLoading } = loading;
    const { problemHeaderId, problemStatus } = basicInfo;
    const btnLoading = detailLoading || printLoading || copyLoading || recallLoading;
    const otherProps = {
      handleSearch: this.handleSearch,
      form: this.form,
      basicInfo,
      loading: btnLoading,
    };
    const onlyReadOperationFlag = Number(onlyReadOperation) === 1;
    const btns = [
      !onlyReadOperationFlag &&
        ['PUBLISHED', 'PUBLISH APPROVING'].includes(problemStatus) && {
          name: 'withdraw',
          child: intl.get('hzero.common.button.callBack').d('撤回'),
          btnComp: PermissionButton,
          btnProps: {
            onClick: throttle(() => this.handleWithdraw(), 1500, { trailing: false }),
            loading: btnLoading,
            permissionList: [
              {
                code: `srm.sqam.business.problem.manage.initiated.button.recall`,
                type: 'button',
              },
            ],
          },
        },
      !onlyReadOperationFlag && {
        name: 'copy',
        btnComp: PermissionButton,
        child: intl.get('hzero.common.button.copy').d('复制'),
        btnProps: {
          icon: 'copy',
          type: 'primary',
          loading: btnLoading,
          disabled: !problemHeaderId,
          onClick: throttle(this.handleCopy, 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.initiated.button.copy`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'operation',
        child: isApprovalShow
          ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
          : intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          loading: btnLoading,
          disabled: !problemHeaderId,
          onClick: () => this.handleModal('operatorRecordVisible', true),
        },
      },
      {
        name: 'attachment',
        child: `${intl.get('entity.attachment.view').d('附件查看')}(${fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          loading: btnLoading,
          disabled: !problemHeaderId,
          onClick: this.handleAttachmentOption,
        },
      },
      {
        name: 'print',
        group: true,
        child: (
          <PermissionButton
            icon="printer"
            loading={btnLoading}
            permissionList={[
              {
                code: `srm.sqam.business.problem.manage.initiated.button.print`,
                type: 'button',
              },
            ]}
          >
            {intl.get(`hzero.common.button.print`).d('打印')}
            <Icon type="down" />
          </PermissionButton>
        ),
        children: [
          {
            name: 'printPdf',
            child: 'PDF',
            btnProps: {
              loading: btnLoading,
              onClick: () => Throttle(this.handlePrint('PDF'), 2000),
            },
          },
          {
            name: 'printXlsx',
            child: 'XLSX',
            btnProps: {
              loading: btnLoading,
              onClick: () => Throttle(this.handlePrint('XLSX'), 2000),
            },
          },
        ],
      },
      {
        name: 'newprint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('sqam.common.view.button.printNew').d('新打印'),
          buttonProps: {
            disabled: !problemHeaderId,
            permissionList: [
              {
                code: 'srm.sqam.business.problem.manage.initiated.button.printnew',
                type: 'button',
              },
            ],
          },
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/problem-headers/list-print-new`,
          method: 'PUT',
          data: { edProblemHeaderIdList: [problemHeaderId] },
          successCallBack: () => this.handleSearch(),
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_INITIATED_8D_DETAIL_BTNS', btns, otherProps)
      : btns;
  }

  @Bind()
  handleBindJRef(ref = {}, key = '') {
    this.form[key] = (ref.props || {}).form;
  }

  /**
   * 新增
   * 小组成员数据列表新增行数据
   */
  @Bind()
  handleAddMem() {
    const { dispatch, tenantId, initiated8D } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = initiated8D;
    dispatch({
      type: 'initiated8D/updateState',
      payload: {
        basicInfo: {
          ...initiated8D.basicInfo,
          edProblemTeamList: [
            {
              problemTeamId: uuidv4(),
              tenantId,
              leaderFlag: 0, // 默认值
              visibleFlag: 0,
              _status: 'create', // 新建标记位
            },
            ...edProblemTeamList,
          ],
        },
      },
    });
  }

  /**
   *小组成员移除
   */
  @Bind()
  handleDeleteMem() {
    const { dispatch, initiated8D, tenantId } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = initiated8D;
    const { selectedRowKeys } = this.state;
    // 删除的成员列表
    const deleteMem = [];
    // 未删除的成员列表
    const newMem = [];
    edProblemTeamList.forEach((i) => {
      if (selectedRowKeys.includes(i.problemTeamId) && i._status !== 'create') {
        const deleteItem = omit(i, ['$form', 'rowKey', '_status']);
        deleteMem.push({ ...deleteItem, deleteFlag: 1, optcamp: 'PURCHASER' }); // 重置更新状态的成员的deleteFlag
      } else if (!selectedRowKeys.includes(i.problemTeamId)) {
        newMem.push({ ...i });
      }
    });
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据'),
      onOk: () => {
        if (isEmpty(deleteMem)) {
          notification.success();
          this.updateMemberList(newMem);
        } else {
          dispatch({
            type: 'initiated8D/deleteTeamMembers',
            payload: {
              tenantId,
              deleteLines: deleteMem,
              optcamp: 'PURCHASER',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.updateMemberList(newMem);
            }
          });
        }
      },
    });
  }

  @Bind()
  updateMemberList(list, flag) {
    const { dispatch, initiated8D } = this.props;
    dispatch({
      type: 'initiated8D/updateState',
      payload: {
        basicInfo: {
          ...initiated8D.basicInfo,
          edProblemTeamList: [...list],
        },
      },
    });
    if (!flag) this.setState({ selectedRowKeys: [] });
  }

  /**
   *
   * @param {array<String>} selectedRowKeys - 小组成员选中行Row
   */
  @Bind()
  handleSelectMem(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRowsMember: selectedRows });
  }

  @Bind()
  handleLeaderChange(record, flag) {
    const {
      initiated8D: { basicInfo },
    } = this.props;
    const { edProblemTeamList } = basicInfo;
    if (flag) {
      record.$form.setFieldsValue({ visibleFlag: 0 });
      edProblemTeamList.forEach((item) => {
        item.$form.setFieldsValue({
          leaderFlag: item.problemTeamId === record.problemTeamId ? 1 : 0,
        });
      });
    } else {
      edProblemTeamList.map((i) => {
        return { ...i, leaderFlag: i.problemTeamId === record.problemTeamId ? 0 : i.leaderFlag };
      });
    }
    this.updateMemberList(edProblemTeamList, true);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { match } = this.props;
    const { id, problemHeaderId } = match.params;

    const {
      attachmentVisible = false,
      operatorRecordVisible = false,
      selectedRowKeys = [],
      selectedRowsMember = [],
      collapseKeys,
      activeKey,
      isApprovalShow,
      editFlag,
      fileNum,
      editAll,
    } = this.state;
    const {
      tenantId,
      loading,
      dispatch,
      initiated8D: {
        basicInfo = {},
        correlationList = [],
        sourceInfolist = [],
        purchaseOrderList = [],
        relatioPagination,
        siteEvalReportList = [],
        siteEvalReportPage = {},
        participateNode,
        camp,
        idd,
      },
      create8D: { quoteTrxList, siteInvestigateReportList = [], evalDataSource = [] },
      promiseMaintainProvide = {},
      promiseMaintainProvideLoading,
      followUpProduce = {},
      followUpProduceLoading,
      rootReasonAnalyze = {},
      rootAnalyzeLoading,
      foreverDealSolution = {},
      foreverSolutionLoading,
      relateStandard = {},
      standardizingLoading,
      isSuitUnderItem = {},
      isSuitUnderItemLoading,
      fetchCorrelationLoading,
      fetchSourceInfoLoading,
      location: { pathname, state = {} },
      fetchOrderLoading,
      customizeTable,
      customizeForm,
      customizeTabPane,
      custLoading,
      customizeCollapse,
      evalLoading,
      history,
      customizeBtnGroup,
      custConfig,
      remote: remoteProps,
    } = this.props;
    const pubType = match.path.indexOf('pub/') > -1;

    const { initiated8DProvide = {} } = promiseMaintainProvide;
    const { initiated8DFollowUp = {} } = followUpProduce;
    const { initiated8DReason = {} } = rootReasonAnalyze;
    const { initiated8DSolution = {} } = foreverDealSolution;
    const { initiated8DSuit = {} } = isSuitUnderItem;
    const { initiated8DStandard = {} } = relateStandard;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = initiated8DProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = initiated8DFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = initiated8DReason;
    const {
      foreverDealSolutionList = [],
      foreverDealSolutionPagination = {},
    } = initiated8DSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = initiated8DStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = initiated8DSuit;
    const { edProblemAction = {}, edProblemTeamList = [], ...basic } = basicInfo;
    const basicInfoProps = {
      basicInfo: basic,
      loading: loading.detail,
      code: 'SQAM.INITIATED_8D.DETAIL.BASIC',
      customizeForm,
      onRef: this.handleBindJRef,
      remoteProps,
      exposeCode: 'SQAM_INITIATED8D_DETAIL_CUX__BASIC',
      editFlag: editAll,
    };
    const edProblemInfo = edProblemAction || {};
    const groupMemberProps = {
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.GROUPMEMBER',
      custLoading,
      selectedRowKeys,
      selectedRowsMember,
      groupMember: edProblemTeamList,
      hideLeaderContentWhenText: true,
      onChangeFlag: (e) => e,
      readOnly: !editFlag,
      basicInfo,
      participateNode,
      camp,
      idd,
      onAdd: this.handleAddMem,
      onRemove: this.handleDeleteMem,
      onSelectRow: this.handleSelectMem,
      onChangeLeader: this.handleLeaderChange,
      match,
    };
    const continueSupplyProps = {
      readOnly: true,
      required: false,
      loading: promiseMaintainProvideLoading,
      edProblemHeaderId: id || problemHeaderId,
      pagination: promiseMaintainProvidePagination,
      dataSource: promiseMaintainProvideList,
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.TEMPMEASURE',
      custLoading,
      remote:remoteProps,
      stateKey: 'initiated8DProvide',
    };

    const followUpProduceProps = {
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.SHORTMEASURES',
      custLoading,
      loading: followUpProduceLoading,
      readOnly: true,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id || problemHeaderId,
      dataSource: followUpProduceList,
      stateKey: 'initiated8DFollowUp',
      remote:remoteProps,
    };
    const rootAnalyzeProps = {
      remote:remoteProps,
      loading: rootAnalyzeLoading,
      edProblemHeaderId: id || problemHeaderId,
      readOnly: true,
      required: false,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'initiated8DReason',
    };
    const remedialActionProps = {
      remote:remoteProps,
      code: 'SQAM.INITIATED_8D.DETAIL.PERMANENTACTION',
      customizeTable,
      custLoading,
      loading: foreverSolutionLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id || problemHeaderId,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      stateKey: 'initiated8DSolution',
    };
    const standardizingProps = {
      remote:remoteProps,
      code: 'SQAM.INITIATED_8D.DETAIL.STANDARDIZATION',
      customizeTable,
      custLoading,
      loading: standardizingLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id || problemHeaderId,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      stateKey: 'initiated8DStandard',
    };
    const isSuitUnderItemProps = {
      code: 'SQAM.INITIATED_8D.DETAIL.OTHERAPPLICABLE',
      customizeTable,
      custLoading,
      remote:remoteProps,
      loading: isSuitUnderItemLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id || problemHeaderId,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      stateKey: 'initiated8DSuit',
    };
    const congratulationProps = {
      customizeForm,
      code: 'SQAM.INITIATED_8D.DETAIL.TEAMCONGRATULATIONS',
      custLoading,
      congratulations: edProblemInfo,
      onRef: this.handleBindJRef,
      readOnly: true,
    };
    const attachmentProps = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: loading.attachment,
      visible: attachmentVisible,
      onCancel: this.handleAttachmentModalHidden,
      supplierAttachmentUuid: basicInfo.supplierAttachmentUuid,
      attachmentInterUuid: basicInfo.attachmentInterUuid,
      attachmentUuid: basicInfo.attachmentUuid,
      supplierReadOnly: true,
      purchaseReadOnly: true,
      showSupplier: true,
    };

    const OtherInfoProps = {
      readOnly: true,
      required: false,
      remote:remoteProps,
      loading: loading.detail,
      pagination: basicInfo.otherInfoPagination,
      dataSource: basicInfo.lineList,
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.OTHERINFO',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.INITIATED_8D.DETAIL.OTHER_BTNS',
    };
    const OtherInfoAProps = {
      readOnly: true,
      required: false,
      remote:remoteProps,
      loading: loading.detail,
      pagination: basicInfo.otherInfoAPagination,
      dataSource: basicInfo.otherDetailList,
      customizeTable,
      code: 'SQAM.INITIATED_8D.DETAIL.OTHERINFO_A',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
    };

    const correlationProps = {
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      backPath: pathname,
      customizeTable,
      customCode: 'SQAM.INITIATED_8D.DETAIL.CORRELATION_8D_LIST',
      fetchCorrelation: this.fectchCorrelationPage,
      pagination: relatioPagination,
    };
    const sourceInfoProps = {
      tenantId,
      dispatch,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      backPath: pathname,
      prefixToPath: '/initiated8D',
      code: 'SQAM.INITIATED_8D.DETAIL.INSPECT',
      customizeTable,
    };
    const purchaseOrderProps = {
      loading: fetchOrderLoading,
      dataSource: purchaseOrderList,
      backPath: pathname,
      prefixToPath: '/initiated8D',
      history,
    };
    const effectTrackProps = {
      dataSource: basicInfo,
      code: 'SQAM.INITIATED_8D.DETAIL.RESULTSTRACKING',
      customizeForm,
    };
    const questionProps = {
      problemDesc: basic,
      onRef: this.handleBindJRef,
      code: 'SQAM.INITIATED_8D.DETAIL.PROBLEM',
      customizeForm,
      noMeanFlag: true,
      isPubEdit: pubType && editFlag,
    };
    const operatorRecordProps = {
      isApprovalShow,
      remoteProps,
      visible: operatorRecordVisible,
      businessKey: basicInfo.businessKey,
      problemHeaderId: basicInfo.problemHeaderId,
      hideModal: () => this.handleModal('operatorRecordVisible', false),
      isExport: true,
    };
    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      code: 'SQAM.INITIATED_8D.DETAIL.TRX',
      customizeTable,
    };
    const siteInvestigateReport = {
      dispatch,
      dataSource: siteInvestigateReportList,
      backPath: pathname,
    };
    const siteEvalReport = {
      dispatch,
      dataSource: siteEvalReportList,
      dataPage: siteEvalReportPage,
      backPath: pathname,
      prefixToPath: '/initiated8D',
      onSearch: this.siteEvalReportHeader,
    };

    // 发布的表单仅展示基础信息、问题描述、小组成员
    const isThreePanels =
      basicInfo.collaborativeMode === 'SINGLE'
        ? false
        : pubType && ['PUBLISH APPROVING', 'PUBLISH_APPRVING'].includes(basicInfo.problemStatus);

    const isReject =
      rejProblemStatus.includes(basicInfo.problemStatus) &&
      rejApprovalProblemStatus.includes(basicInfo.approvalProblemStatus);
    const isEffectTrackShow =
      (['VALIDATED', 'TRACK_APPROVING'].includes(basicInfo.problemStatus) || isReject) &&
      !isThreePanels;
    const notOnlyBasic = !(
      isEmpty(correlationList) &&
      isEmpty(sourceInfolist) &&
      isEmpty(purchaseOrderList) &&
      isEmpty(quoteTrxList) &&
      isEmpty(evalDataSource) &&
      isEmpty(siteEvalReportPage) &&
      basicInfo.sourceCode !== 'REPORT_EVAL' &&
      basicInfo.sourceCode !== 'SITE_EVAL' &&
      basicInfo.sourceCode !== 'KPI_EVAL'
    );
    const listProps = {
      // customizeTable,
      // custLoading,
      evalLoading,
      // evalPagination,
      evalDataSource,
      history,
      // onChange: page => this.handleEvaluationSearch(page),
    };
    return (
      <React.Fragment>
        {!pubType && (
          <Header
            title={intl
              .get(`${prefix}.qualityRectification.initiated.detailed`)
              .d('我发起的质量整改')}
            backPath={state.backPath || '/sqam/initiated8D/list'}
          >
            {customizeBtnGroup(
              { code: 'SQAM.INITIATED_8D.DETAIL.HEAD_BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        )}
        <div className="sqam-detail-content" id="sqam-initiated8D-detail-content-inner-wrapper">
          <Content className={classNames(styles['page-content'])}>
            {pubType && (
              <Button
                icon="paper-clip"
                onClick={this.handleAttachmentOption}
                style={{ marginBottom: '10px' }}
              >
                {intl.get('entity.attachment.view').d('附件查看')}({fileNum})
              </Button>
            )}
            <Spin spinning={loading.detail} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {customizeCollapse(
                {
                  code: 'SQAM.INITIATED_8D.DETAIL.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-basic"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix}.panel.basic`).d('基本信息')}</h3>
                        <a>
                          {collapseKeys.includes('b')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('b') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="b"
                  >
                    {notOnlyBasic ? (
                      customizeTabPane(
                        { code: 'SQAM.INITIATED_8D.DETAIL.BASIC_TABS' },
                        <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
                          <TabPane
                            tab={
                              <span style={{ color: '#4c4c4c' }}>
                                {intl.get(`${prefix}.tab.basicInfo`).d('基础信息')}
                              </span>
                            }
                            key="basicInfo"
                          >
                            <BasicInfoPanel {...basicInfoProps} />
                          </TabPane>
                          {correlationList.length > 0 && (
                            <TabPane tab={this.tabTextRender('rectification')} key="rectification">
                              <Correlation {...correlationProps} />
                            </TabPane>
                          )}
                          {purchaseOrderList.length > 0 && (
                            <TabPane tab={this.tabTextRender('purchaseOrder')} key="purchaseOrder">
                              <PurchaseOrderPanel {...purchaseOrderProps} />
                            </TabPane>
                          )}
                          {basicInfo.sourceCode === 'INCOMING_INSPECTION' && (
                            <TabPane tab={this.tabTextRender('inspect')} key="inspect">
                              <SourceInfo {...sourceInfoProps} />
                            </TabPane>
                          )}
                          {basicInfo.sourceCode === 'TRX_RCV_LINE' && (
                            <TabPane tab={this.tabTextRender('trxInspect')} key="trxInspect">
                              <TrxQuoteList {...trxRcvProps} />
                            </TabPane>
                          )}
                          {basicInfo.sourceCode === 'SITE_EVAL' && (
                            <TabPane
                              tab={this.tabTextRender('siteInvestigateReport')}
                              key="siteInvestigateReport"
                            >
                              <SiteInvestigate {...siteInvestigateReport} />
                            </TabPane>
                          )}
                          {basicInfo.sourceCode === 'REPORT_EVAL' && (
                            <TabPane tab={this.tabTextRender('siteEval')} key="siteEval">
                              <SiteEval {...siteEvalReport} />
                            </TabPane>
                          )}
                          {basicInfo.sourceCode === 'KPI_EVAL' && (
                            <TabPane
                              tab={this.tabTextRender('supEvaluationFile')}
                              key="supEvaluationFile"
                            >
                              <EvaluationList {...listProps} />
                            </TabPane>
                          )}
                        </Tabs>
                      )
                    ) : (
                      <BasicInfoPanel {...basicInfoProps} />
                    )}
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-question"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix}.panel.question`).d('问题描述')}</h3>
                        <a>
                          {collapseKeys.includes('c')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('c') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="c"
                  >
                    <QuestionPanel {...questionProps} />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-groupMember"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix}.panel.groupMember`).d('小组成员')}</h3>
                        <a>
                          {collapseKeys.includes('d')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('d') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="d"
                  >
                    <GroupMemberPanel {...groupMemberProps} />
                  </Collapse.Panel>
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-promiseMaintainProvide"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>
                            {intl
                              .get(`${prefix}.panel.promiseMaintainProvide`)
                              .d('临时围堵措施—保证持续供货')}
                          </h3>
                          <a>
                            {collapseKeys.includes('e')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('e') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="e"
                    >
                      <PromiseMaintainProvide {...continueSupplyProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-shortMeature"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.shortMeature`).d('短期措施')}</h3>
                          <a>
                            {collapseKeys.includes('f')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('f') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="f"
                    >
                      <FollowUpProduce {...followUpProduceProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-analyzeReason"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析')}</h3>
                          <a>
                            {collapseKeys.includes('g')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('g') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="g"
                    >
                      <RootReasonAnalyze {...rootAnalyzeProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-foreverDealSolution"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>
                            {intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施')}
                          </h3>
                          <a>
                            {collapseKeys.includes('h')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('h') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="h"
                    >
                      <ForeverDealSolution {...remedialActionProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-applyItem"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目')}</h3>
                          <a>
                            {collapseKeys.includes('k')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('k') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="k"
                    >
                      <IsSuitUnderItem {...isSuitUnderItemProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-standard"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.standard`).d('相关标准化')}</h3>
                          <a>
                            {collapseKeys.includes('i')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('i') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="i"
                    >
                      <RelateStandard {...standardizingProps} />
                    </Collapse.Panel>
                  )}
                  {!isThreePanels && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-congratulation"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.congratulation`).d('小组祝贺')}</h3>
                          <a>
                            {collapseKeys.includes('j')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('j') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="j"
                    >
                      <CongratulationPanel {...congratulationProps} />
                    </Collapse.Panel>
                  )}
                  {isEffectTrackShow && (
                    <Collapse.Panel
                      id="sqam-initiated8D-panel-effectTrack"
                      showArrow={false}
                      forceRender
                      header={
                        <Fragment>
                          <h3>{intl.get(`${prefix}.panel.effectTrack`).d('成效追踪')}</h3>
                          <a>
                            {collapseKeys.includes('l')
                              ? intl.get(`hzero.common.button.up`).d('收起')
                              : intl.get(`hzero.common.button.expand`).d('展开')}
                          </a>
                          <Icon type={collapseKeys.includes('l') ? 'up' : 'down'} />
                        </Fragment>
                      }
                      key="l"
                    >
                      <EffectTrackPanel {...effectTrackProps} />
                    </Collapse.Panel>
                  )}
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-otherInfo"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix}.panel.otherInfo`).d('其他信息')}</h3>
                        <a>
                          {collapseKeys.includes('m')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('m') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="m"
                  >
                    <OtherInfo {...OtherInfoProps} />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-otherInfo-A"
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A')}</h3>
                        <a>
                          {collapseKeys.includes('otherA')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('otherA') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="otherA"
                  >
                    <OtherInfoA {...OtherInfoAProps} />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-custom"
                    showArrow={false}
                    forceRender
                    key="customA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.INITIATED_8D.DETAIL.CUSZ_FORM"
                      onRef={this.handleBindJRef}
                      refField="customA"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-custom-b"
                    showArrow={false}
                    forceRender
                    key="customB"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_B"
                      onRef={this.handleBindJRef}
                      refField="customB"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-initiated8D-panel-custom-c"
                    showArrow={false}
                    forceRender
                    key="customC"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.INITIATED_8D.DETAIL.CUSZ_FORM_C"
                      onRef={this.handleBindJRef}
                      refField="customC"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_INITIATED8D_DETAIL_CUX_EXTAR_PANEL",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            {!isThreePanels && (
              <FixedAnchor
                linkList={this.getAnchorLinkList()}
                customizeCollapse={customizeCollapse}
                code="SQAM.INITIATED_8D.DETAIL.COLLAPSE"
                className="sqam-initiated8D-detail-content-inner-wrapper"
                unitConfig={custConfig['SQAM.INITIATED_8D.DETAIL.COLLAPSE']}
              />
            )}
          </Content>
        </div>
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
        {operatorRecordVisible && <OperatorRecord {...operatorRecordProps} />}
      </React.Fragment>
    );
  }
}
