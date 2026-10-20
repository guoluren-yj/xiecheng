/**
 * 质量整改成效追踪详情页
 * @date: 2020-5-14
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
 
import React, { Component, Fragment } from 'react';
import { Spin, Collapse, Icon, Tabs, Form } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty, throttle } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse, getEditTableData } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import moment from 'moment';
import { queryApprovalMethod } from '@/services/create8DService';
import CustomForm from '@/routes/components/CustomForm';
import { getFileNumByUUID } from '@/utils/utils';
import QuestionPanel from '../../components/QuestionPanel';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import GroupMemberPanel from '../../components/GroupMemberPanel';
import CongratulationPanel from '../../components/CongratulationPanel';
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
import AttachmentModal from '../../components/AttachmentC7nModal';
import TrxQuoteList from '../../components/TrxQuoteList';
import SiteInvestigate from '../../components/SiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';

const { TabPane } = Tabs;
const prefix = 'sqam.common.view.message.title';
const prefix3 = 'effectTrack';

@remote({
  code: 'SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SQAM.FEEDBACK_8D_DETAIL.BASIC',
    'SQAM.INITIATED_8D.DETAIL.BASIC',
    'SQAM.EFFECT_TRACK_DETAIL.GROUPMEMBER',
    'SQAM.EFFECT_TRACK_DETAIL.SHORTMEASURES',
    'SQAM.EFFECT_TRACK_DETAIL.PERMANENTACTION',
    'SQAM.EFFECT_TRACK_DETAIL.OTHERAPPLICABLE',
    'SQAM.EFFECT_TRACK_DETAIL.STANDARDIZATION',
    'SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.EFFECT_TRACK_DETAIL.TEMPMEASURE',
    'SQAM.EFFECT_TRACK_DETAIL.ROOTCAUSE',
    'SQAM.EFFECT_TRACK_DETAIL.RESULTSTRACKING',
    'SQAM.EFFECT_TRACK_DETAIL.COLLAPSE',
    'SQAM.EFFECT_TRACK_DETAIL.INSPECT',
    'SQAM.EFFECT_TRACK_DETAIL.OTHERINFO',
    'SQAM.EFFECT_TRACK_DETAIL.OTHERINFO_A',
    'SQAM.EFFECT_TRACK_DETAIL.PROBLEM',
    'SQAM.EFFECT_TRACK_DETAIL.BASIC',
    'SQAM.EFFECT_TRACK_DETAIL.TRX',
    'SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM',
    'SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_B',
    'SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_C',
    'SQAM.EFFECT_TRACK_DETAIL.CORRELATION_8D_LIST',
    'SQAM.EFFECT_TRACK_DETAIL.BTNS',
    'SQAM.EFFECT_TRACK_DETAIL.OTHER_BTNS',
    'SQAM.EFFECT_TRACK_DETAIL.BASIC_TABS',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
  ],
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sqam.common',
    'entity.roles',
    'entity.item',
    'entity.company',
    'entity.supplier',
    'entity.business',
    'entity.organization',
    'entity.attachment',
    'sslm.evaluationQuery',
  ],
})
@connect(
  ({
    rectificationEffectTrack,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    create8D,
    loading,
  }) => ({
    rectificationEffectTrack,
    create8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    tenantId: getCurrentOrganizationId(),
    evalLoading: loading.effects['create8D/fetchList'],
    promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
    followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
    rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
    foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
    isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
    standardizingLoading: loading.effects['standardizing/fetchData'],
    saveLoading: loading.effects['rectificationEffectTrack/update8D'],
    completeLoading: loading.effects['rectificationEffectTrack/completeTrack'],
    fetchBasicInfoLoading: loading.effects['rectificationEffectTrack/fetch8DBasicInfo'],
    fetchSourceInfoLoading: loading.effects['rectificationEffectTrack/fetchSourceInfoLoading'],
    fetchOrderLoading: loading.effects['feedback8D/fetchPurchaseOrder'],
    fetchCorrelationLoading: loading.effects['rectificationEffectTrack/relation8D'],
    operatorLoading: loading.effects['rectificationEffectTrack/fetchOperatorRecord'],
    attachmentLoading: loading.effects['rectificationEffectTrack/fetchAttachment'],
    create8DLoading: loading.effects['create8D/fetchTrxHeader'],
  })
)
export default class Detail extends Component {
  codeFields = [];

  form = {
    followUp: {}, // 短期措施
    forever: {}, // 永久纠正
  };

  constructor(props) {
    super(props);
    this.state = {
      activeKey: 'basicInfo',
      collapseKeys: [
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'k',
        'i',
        'j',
        'l',
        'm',
        'customA',
        'customB',
        'customC',
        'otherA',
      ],
      isEdit: false,
      attachmentVisible: false,
      isApprovalShow: false,
      evalHeaderIds: [],
      fileNum: 0,
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.fetchSettingValue();
    const { queryUnitConfig } = this.props;
    queryUnitConfig({}, (res) => {
      if (!getResponse(res)) return;
      const _newFields = [
        {
          code: 'b',
          key: `sqam-${prefix3}-panel-basic`,
          title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
        },
        {
          code: 'c',
          key: `sqam-${prefix3}-panel-question`,
          title: intl.get(`${prefix}.panel.question`).d('问题描述'),
        },
        {
          code: 'd',
          key: `sqam-${prefix3}-panel-groupMember`,
          title: intl.get(`${prefix}.panel.groupMember`).d('小组成员'),
        },
        {
          code: 'e',
          key: `sqam-${prefix3}-panel-promiseMaintainProvide`,
          title: intl.get(`${prefix}.panel.promiseMaintainProvide`).d('临时围堵措施—保证持续供货'),
        },
        {
          code: 'f',
          key: `sqam-${prefix3}-panel-shortMeature`,
          title: intl.get(`${prefix}.panel.shortMeature`).d('短期措施'),
        },
        {
          code: 'g',
          key: `sqam-${prefix3}-panel-analyzeReason`,
          title: intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析'),
        },
        {
          code: 'h',
          key: `sqam-${prefix3}-panel-foreverDealSolution`,
          title: intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施'),
        },
        {
          code: 'i',
          key: `sqam-${prefix3}-panel-standard`,
          title: intl.get(`${prefix}.panel.standard`).d('相关标准化'),
        },
        {
          code: 'j',
          key: `sqam-${prefix3}-panel-congratulation`,
          title: intl.get(`${prefix}.panel.congratulation`).d('小组祝贺'),
        },
        {
          code: 'k',
          key: `sqam-${prefix3}-panel-applyItem`,
          title: intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目'),
        },
        {
          code: 'l',
          key: `sqam-${prefix3}-panel-effectTrack`,
          title: intl.get(`${prefix}.panel.effectTrack`).d('成效追踪'),
        },
        {
          code: 'm',
          key: `sqam-${prefix3}-panel-otherInfo`,
          title: intl.get(`${prefix}.panel.otherInfo`).d('其他信息'),
        },
        {
          code: 'otherA',
          key: `sqam-${prefix3}-panel-otherInfo-A`,
          title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
        },
        {
          code: 'customA',
          key: `sqam-${prefix3}-panel-custom`,
          title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
        },
        {
          code: 'customB',
          key: `sqam-${prefix3}-panel-custom-b`,
          title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
        },
        {
          code: 'customC',
          key: `sqam-${prefix3}-panel-custom-c`,
          title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
        },
      ];
      let newFields = remoteProps
        ? remoteProps.process('SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL_COLLAPSE_FIELDS', _newFields)
        : _newFields;

      const unitConfig = res['SQAM.EFFECT_TRACK_DETAIL.COLLAPSE'];
      if (unitConfig) {
        const { fields } = unitConfig;
        fields.forEach((row) => {
          if (row.fieldName) {
            newFields = newFields.map((item) => {
              return {
                ...item,
                title: row.fieldCode === item.code ? row.fieldName : item.title,
              };
            });
          }
        });
        this.codeFields = newFields;
      }
    });
    const anchorElement = document.getElementById('sqam-effectTrack-panel-effectTrack');
    if (anchorElement) {
      // 解决微软系浏览器兼容问题
      anchorElement.scrollIntoView(false);
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rectificationEffectTrack/updateState',
      payload: {
        basicInfo: {},
        correlationList: [],
        sourceInfolist: [],
        operatorRecords: [],
        purchaseOrderList: [],
      },
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'rectificationEffectTrack/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode:
          'SQAM.INITIATED_8D.DETAIL.GROUPMEMBER,SQAM.INITIATED_8D.DETAIL.BASIC,SQAM.EFFECT_TRACK_DETAIL.BASIC,SQAM.EFFECT_TRACK_DETAIL.PROBLEM,SQAM.EFFECT_TRACK_DETAIL.GROUPMEMB,SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS,SQAM.EFFECT_TRACK_DETAIL.RESULTSTRACKING,SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM,SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_B,SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_C,SQAM.EFFECT_TRACK_DETAIL.GROUPMEMBER,SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO,SQAM.EFFECT_TRACK_DETAIL.OTHERINFO_A',
        menuEntryPoint: 'CUSTOMER_VALIDATED',
      },
    }).then(() => {
      const {
        rectificationEffectTrack: {
          basicInfo: {
            sourceCode,
            problemStatus,
            rcvTrxLineIds,
            evalHeaderIds,
            problemHeaderId,
            attachmentUuid,
            attachmentInterUuid,
            supplierAttachmentUuid,
          },
        },
      } = this.props;
      if (sourceCode === 'INCOMING_INSPECTION') this.fetchSourceInfo();
      this.setState({ isEdit: problemStatus === 'COMPLETED' });
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
    });
    this.fetchCorrelation();
    this.fetchPurchaseOrder();
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
          customizeUnitCode: 'SQAM.EFFECT_TRACK_DETAIL.TRX',
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
      type: 'rectificationEffectTrack/siteEvalReportHeader',
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
    const { id } = match.params;
    const res010706 = getResponse(
      await queryApprovalMethod({
        tenantId,
        problemHeaderId: id,
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
  fetchCorrelation(page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'rectificationEffectTrack/relation8D',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.EFFECT_TRACK_DETAIL.CORRELATION_8D_LIST',
        page,
      },
    });
  }

  @Bind()
  fetchSourceInfo() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'rectificationEffectTrack/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.EFFECT_TRACK_DETAIL.INSPECT',
      },
    });
  }

  @Bind()
  fetchPurchaseOrder() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'rectificationEffectTrack/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    });
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

  @Bind()
  handleSave() {
    const {
      dispatch,
      tenantId,
      match = {},
      form: { validateFieldsAndScroll },
      rectificationEffectTrack: { basicInfo },
      followUpProduce = {},
      foreverDealSolution = {},
    } = this.props;
    const {
      params: { id },
    } = match;
    validateFieldsAndScroll(async (errs, values) => {
      if (!errs) {
        const { rectificationFollowUp = {} } = followUpProduce;
        const { followUpProduceList = [] } = rectificationFollowUp;
        // 短期措施
        const followUpProduceData = await this.validateEditTableDataSource(followUpProduceList, [
          'edProblemHeaderId',
          '$form',
          '_status',
        ]);
        if (!followUpProduceData) return;
        const edProblemProduceActionList = followUpProduceData.map((item) => {
          const produceEndDate =
            item.produceEndDate && moment(item.produceEndDate).format(DATETIME_MIN);
          return {
            ...item,
            produceEndDate,
          };
        });
        const { rectificationSolution = {} } = foreverDealSolution;
        const { foreverDealSolutionList = [] } = rectificationSolution;
        // 永久措施
        const foreverDealSolutionData = await this.validateEditTableDataSource(
          foreverDealSolutionList,
          ['edProblemHeaderId', '$form', '_status']
        );
        if (!foreverDealSolutionData) return;
        const edProblemPcaActionList = foreverDealSolutionData.map((item) => {
          const pcaActionEndDate =
            item.pcaActionEndDate && moment(item.pcaActionEndDate).format(DATETIME_MIN);
          return {
            ...item,
            pcaActionEndDate,
          };
        });
        dispatch({
          type: 'rectificationEffectTrack/update8D',
          payload: {
            tenantId,
            problemHeaderId: id,
            data: {
              ...basicInfo,
              ...values,
              problemDetail: values?.problemDetail || basicInfo?.problemDetail,
              problemDiscoverBy: values?.problemDiscoverBy || basicInfo?.problemDiscoverBy,
              problemEmergencyAction:
                values?.problemEmergencyAction || basicInfo?.problemEmergencyAction,
              problemIdentification:
                values?.problemIdentification || basicInfo?.problemIdentification,
              problemIdentifyCauses:
                values?.problemIdentifyCauses || basicInfo?.problemIdentifyCauses,
              problemImportanceCode:
                values?.problemImportanceCode || basicInfo?.problemImportanceCode,
              problemOccurredDate: values?.problemOccurredDate || basicInfo?.problemOccurredDate,
              problemOccurredSite: values?.problemOccurredSite || basicInfo?.problemOccurredSite,
              problemTypeCode: values?.problemTypeCode || basicInfo?.problemTypeCode,
              problemUrgencyCode: values?.problemUrgencyCode || basicInfo?.problemUrgencyCode,
              edProblemProduceActionList,
              edProblemPcaActionList,
            },
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
            // 更新短期措施和临时围堵列表，编码个性化话字段更新了，再次修改版本号不对
            const { forever = {}, followUp = {} } = this.form || {};
            if (forever && forever?.handleSearch) forever.handleSearch();
            if (followUp && followUp?.handleSearch) followUp.handleSearch();
          }
        });
      }
    });
  }

  @Bind()
  handleBindRef(ref = {}, key = '') {
    this.form[key] = ref || {};
  }

  @Bind()
  handleComplete() {
    const {
      dispatch,
      tenantId,
      match = {},
      form: { validateFieldsAndScroll },
      rectificationEffectTrack: { basicInfo },
      followUpProduce = {},
      foreverDealSolution = {},
    } = this.props;
    const {
      params: { id },
    } = match;
    validateFieldsAndScroll(async (errs, values) => {
      if (!errs) {
        const { rectificationFollowUp = {} } = followUpProduce;
        const { followUpProduceList = [] } = rectificationFollowUp;
        // 短期措施
        const followUpProduceData = await this.validateEditTableDataSource(followUpProduceList, [
          'edProblemHeaderId',
          '$form',
          '_status',
        ]);
        if (!followUpProduceData) return;
        const edProblemProduceActionList = followUpProduceData.map((item) => {
          const produceEndDate =
            item.produceEndDate && moment(item.produceEndDate).format(DATETIME_MIN);
          return {
            ...item,
            produceEndDate,
          };
        });
        const { rectificationSolution = {} } = foreverDealSolution;
        const { foreverDealSolutionList = [] } = rectificationSolution;
        // 永久纠正措施
        const foreverDealSolutionData = await this.validateEditTableDataSource(
          foreverDealSolutionList,
          ['edProblemHeaderId', '$form', '_status']
        );
        if (!foreverDealSolutionData) return;
        const edProblemPcaActionList = foreverDealSolutionData.map((item) => {
          const pcaActionEndDate =
            item.pcaActionEndDate && moment(item.pcaActionEndDate).format(DATETIME_MIN);
          return {
            ...item,
            pcaActionEndDate,
          };
        });
        dispatch({
          type: 'rectificationEffectTrack/completeTrack',
          payload: {
            tenantId,
            problemHeaderId: id,
            data: {
              ...basicInfo,
              ...values,
              edProblemProduceActionList,
              edProblemPcaActionList,
            },
          },
        }).then((res) => {
          if (res) {
            notification.success();
            this.handleSearch();
            // 更新短期措施和临时围堵列表，编码个性化话字段更新了，再次修改版本号不对
            const { forever = {}, followUp = {} } = this.form || {};
            if (forever && forever?.handleSearch) forever.handleSearch();
            if (followUp && followUp?.handleSearch) followUp.handleSearch();
          }
        });
      }
    });
  }

  /**
   * 附件查看
   */
  @Bind()
  handleAttachmentOption() {
    this.setState({ attachmentVisible: true });
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

  @Bind()
  tabChange(activeKey) {
    this.setState({
      activeKey,
    });
  }

  @Bind()
  handleEdit() {
    const { isEdit } = this.state;
    this.setState({ isEdit: !isEdit });
  }

  @Bind()
  tabTextRender(type) {
    const { rectificationEffectTrack = {}, create8D = {} } = this.props;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      relatioPagination,
      siteEvalReportPage,
    } = rectificationEffectTrack;
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
  handleModal(visible, flag) {
    this.setState({ [visible]: flag });
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

  // 头按钮
  @Bind()
  headerBtns() {
    const {
      rectificationEffectTrack: { basicInfo = {} },
      fetchBasicInfoLoading,
      saveLoading,
      completeLoading,
      remote: remoteProps,
    } = this.props;
    const { problemStatus, trackEditFlag } = basicInfo;
    const { isEdit, isApprovalShow, fileNum } = this.state;
    const btnLoading = saveLoading || completeLoading || fetchBasicInfoLoading;
    const otherProps = {
      basicInfo,
      handleSearch: this.handleSearch,
      loading: btnLoading,
    };
    const allBtns = [
      problemStatus === 'VALIDATED' &&
        trackEditFlag === 1 && {
          name: 'edit',
          child: isEdit
            ? intl.get('hzero.common.button.cancel').d('取消')
            : intl.get('hzero.common.button.update').d('修改'),
          btnProps: {
            type: 'primary',
            icon: isEdit ? 'cancel' : 'edit',
            loading: btnLoading,
            onClick: throttle(() => this.handleEdit(), 1500, { trailing: false }),
          },
        },
      problemStatus === 'COMPLETED' && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'primary',
          icon: 'save',
          loading: btnLoading,
          onClick: throttle(() => this.handleSave(), 1500, { trailing: false }),
        },
      },
      isEdit &&
        trackEditFlag === 1 && {
          name: 'check',
          child: intl.get(`sqam.common.view.button.completeTrack`).d('完成追踪'),
          btnProps: {
            icon: 'check',
            loading: btnLoading,
            onClick: throttle(() => this.handleComplete(), 1500, { trailing: false }),
          },
        },
      {
        name: 'operate',
        child:
          (!isApprovalShow ? `${intl.get('sqam.common.button.approval').d('审批')}/` : '') +
          intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          loading: btnLoading,
          onClick: throttle(() => this.handleModal('operatorRecordVisible', true), 1500, {
            trailing: false,
          }),
          disabled: !basicInfo.problemHeaderId,
        },
      },
      {
        name: 'attachment',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          loading: btnLoading,
          onClick: throttle(() => this.handleAttachmentOption(), 1500, { trailing: false }),
          disabled: !basicInfo.problemHeaderId,
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL_BTNS', allBtns, otherProps)
      : allBtns;
  }

  render() {
    const {
      activeKey,
      collapseKeys,
      isEdit,
      operatorRecordVisible = false,
      attachmentVisible = false,
      isApprovalShow,
    } = this.state;
    const {
      form,
      tenantId,
      dispatch,
      match = {},
      rectificationEffectTrack: {
        basicInfo = {},
        correlationList = [],
        sourceInfolist = [],
        purchaseOrderList = [],
        relatioPagination,
        siteEvalReportList = [],
        siteEvalReportPage = {},
      },
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
      fetchBasicInfoLoading,
      fetchCorrelationLoading,
      fetchSourceInfoLoading,
      fetchOrderLoading,
      attachmentLoading,
      saveLoading,
      completeLoading,
      location: { pathname },
      customizeTable,
      customizeTabPane,
      customizeForm,
      custLoading,
      create8D: {
        quoteTrxList,
        siteInvestigateReportList = [],
        siteInvestigateReportPage = {},
        evalDataSource = [],
      },
      customizeCollapse,
      evalLoading,
      history,
      customizeBtnGroup,
      remote: remoteProps,
    } = this.props;
    const {
      params: { id },
    } = match;

    const { rectificationProvide = {} } = promiseMaintainProvide;
    const { rectificationFollowUp = {} } = followUpProduce;
    const { rectificationReason = {} } = rootReasonAnalyze;
    const { rectificationSolution = {} } = foreverDealSolution;
    const { rectificationSuit = {} } = isSuitUnderItem;
    const { rectificationStandard = {} } = relateStandard;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = rectificationProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = rectificationFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = rectificationReason;
    const {
      foreverDealSolutionList = [],
      foreverDealSolutionPagination = {},
    } = rectificationSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = rectificationStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = rectificationSuit;
    const { edProblemAction = {}, edProblemTeamList = [], ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const basicInfoProps = {
      basicInfo: basic,
      loading: fetchBasicInfoLoading,
      code: 'SQAM.EFFECT_TRACK_DETAIL.BASIC',
      customizeForm,
      remoteProps,
      exposeCode: 'SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL_CUX_BASIC',
    };
    const correlationProps = {
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      customCode: 'SQAM.EFFECT_TRACK_DETAIL.CORRELATION_8D_LIST',
      customizeTable,
      fetchCorrelation: this.fetchCorrelation,
      pagination: relatioPagination,
    };
    const sourceInfoProps = {
      tenantId,
      dispatch,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      backPath: pathname,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.INSPECT',
      // prefixToPath: '/initiated8D',
    };
    const groupMemberProps = {
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.GROUPMEMBER',
      custLoading,
      groupMember: edProblemTeamList,
      onChangeFlag: (e) => e,
      onAdd: (e) => e,
      match,
    };
    const continueSupplyProps = {
      readOnly: true,
      required: false,
      remote: remoteProps,
      loading: promiseMaintainProvideLoading,
      edProblemHeaderId: id,
      pagination: promiseMaintainProvidePagination,
      dataSource: promiseMaintainProvideList,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.TEMPMEASURE',
      custLoading,
      stateKey: 'rectificationProvide',
    };

    const followUpProduceProps = {
      customizeTable,
      remote: remoteProps,
      code: 'SQAM.EFFECT_TRACK_DETAIL.SHORTMEASURES',
      custLoading,
      loading: followUpProduceLoading,
      readOnly: true,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      stateKey: 'rectificationFollowUp',
      onRef: this.handleBindRef,
    };
    const rootAnalyzeProps = {
      loading: rootAnalyzeLoading,
      edProblemHeaderId: id,
      readOnly: true,
      required: false,
      remote: remoteProps,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'rectificationReason',
    };

    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.TRX',
    };
    const remedialActionProps = {
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.PERMANENTACTION',
      custLoading,
      remote: remoteProps,
      loading: foreverSolutionLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      stateKey: 'rectificationSolution',
      onRef: this.handleBindRef,
    };
    const standardizingProps = {
      customizeTable,
      remote: remoteProps,
      code: 'SQAM.EFFECT_TRACK_DETAIL.STANDARDIZATION',
      custLoading,
      loading: standardizingLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      stateKey: 'rectificationStandard',
    };
    const isSuitUnderItemProps = {
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.OTHERAPPLICABLE',
      custLoading,
      remote: remoteProps,
      loading: isSuitUnderItemLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      stateKey: 'rectificationSuit',
    };
    const congratulationProps = {
      customizeForm,
      code: 'SQAM.EFFECT_TRACK_DETAIL.TEAMCONGRATULATIONS',
      custLoading,
      congratulations: edProblemInfo,
      onRef: (e) => e,
      readOnly: true,
    };
    const questionProps = {
      problemDesc: basic,
      form,
      customizeForm,
      code: 'SQAM.EFFECT_TRACK_DETAIL.PROBLEM',
      noMeanFlag: true,
    };
    const effectTrackProps = {
      customizeForm,
      code: 'SQAM.EFFECT_TRACK_DETAIL.RESULTSTRACKING',
      form,
      dataSource: basicInfo,
      isEdit,
      remoteProps,
      exposeCode: 'SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL_CUX__EFFECT',
      dispatch,
    };
    const operatorRecordProps = {
      remoteProps,
      isApprovalShow,
      visible: operatorRecordVisible,
      businessKey: basicInfo.businessKey,
      problemHeaderId: basicInfo.problemHeaderId,
      hideModal: () => this.handleModal('operatorRecordVisible', false),
      isExport: true,
    };
    const attachmentProps = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: attachmentLoading,
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
      remote: remoteProps,
      loading: fetchBasicInfoLoading,
      pagination: basicInfo.otherInfoPagination,
      dataSource: basicInfo.lineList,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.OTHERINFO',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.EFFECT_TRACK_DETAIL.OTHER_BTNS',
    };
    const OtherInfoAProps = {
      readOnly: true,
      required: false,
      remote: remoteProps,
      loading: fetchBasicInfoLoading,
      pagination: basicInfo.otherInfoAPagination,
      dataSource: basicInfo.otherDetailList,
      customizeTable,
      code: 'SQAM.EFFECT_TRACK_DETAIL.OTHERINFO_A',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
      namespaceKey: 'rectificationEffectTrack',
    };
    const purchaseOrderProps = {
      loading: fetchOrderLoading,
      dataSource: purchaseOrderList,
      backPath: pathname,
      prefixToPath: '/rectification-effect-track',
      history,
    };
    const siteInvestigateReport = {
      dispatch,
      dataSource: siteInvestigateReportList,
      dataPage: siteInvestigateReportPage,
      backPath: pathname,
    };
    const siteEvalReport = {
      dispatch,
      dataSource: siteEvalReportList,
      dataPage: siteEvalReportPage,
      backPath: pathname,
      prefixToPath: '/rectification-effect-track',
      onSearch: this.siteEvalReportHeader,
    };
    const { supplierName, problemNum, sourceCode } = basicInfo;
    const loading = saveLoading || completeLoading || fetchBasicInfoLoading;
    const notOnlyBasic = !(
      isEmpty(correlationList) &&
      isEmpty(sourceInfolist) &&
      isEmpty(purchaseOrderList) &&
      isEmpty(quoteTrxList) &&
      isEmpty(evalDataSource) &&
      isEmpty(siteEvalReportPage) &&
      basicInfo.sourceCode !== 'REPORT_EVAL' &&
      sourceCode !== 'SITE_EVAL' &&
      sourceCode !== 'KPI_EVAL'
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
      <Fragment>
        <Header
          title={
            !isUndefined(supplierName) && !isUndefined(problemNum)
              ? `${supplierName}${problemNum}${intl
                  .get(`sqam.common.view.message.title.qualityRectification.effectTrack`)
                  .d(`质量整改成效追踪`)}`
              : ''
          }
          backPath="/sqam/rectification-effect-track/list"
        >
          {customizeBtnGroup(
            { code: 'SQAM.EFFECT_TRACK_DETAIL.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <div className="sqam-detail-content" id="sqam-effectTrack-detail-content-inner-wrapper">
          <Content>
            <Spin spinning={loading} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {customizeCollapse(
                {
                  code: 'SQAM.EFFECT_TRACK_DETAIL.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-basic"
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
                        { code: 'SQAM.EFFECT_TRACK_DETAIL.BASIC_TABS' },
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
                          {correlationList.length && (
                            <TabPane tab={this.tabTextRender('rectification')} key="rectification">
                              <Correlation {...correlationProps} />
                            </TabPane>
                          )}
                          {purchaseOrderList.length && (
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
                    id="sqam-effectTrack-panel-question"
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
                    id="sqam-effectTrack-panel-groupMember"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-promiseMaintainProvide"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-shortMeature"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-analyzeReason"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-foreverDealSolution"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施')}</h3>
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-applyItem"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-standard"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-congratulation"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-effectTrack"
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
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-otherInfo"
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
                    id="sqam-effectTrack-panel-otherInfo-A"
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
                    id="sqam-effectTrack-panel-custom"
                    showArrow={false}
                    forceRender
                    key="customA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-custom-b"
                    showArrow={false}
                    forceRender
                    key="customB"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_B"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-effectTrack-panel-custom-c"
                    showArrow={false}
                    forceRender
                    key="customC"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.EFFECT_TRACK_DETAIL.CUSZ_FORM_C"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_RECTIFICATION_EFFECT_TRACK_DETAIL_CUX_EXTRA_PANEL",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            <FixedAnchor
              linkList={this.codeFields}
              className="sqam-effectTrack-detail-content-inner-wrapper"
              code="SQAM.EFFECT_TRACK_DETAIL.COLLAPSE"
              customizeCollapse={customizeCollapse}
            />
          </Content>
        </div>
        {operatorRecordVisible && <OperatorRecord {...operatorRecordProps} />}
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
      </Fragment>
    );
  }
}
