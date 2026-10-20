/**
 * 我收到的8D - 明细
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Icon, Tabs } from 'hzero-ui';
import classNames from 'classnames';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { isEmpty, throttle } from 'lodash';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import CustomForm from '@/routes/components/CustomForm';
import { SRM_SQAM } from '_utils/config';
import { Button as PermissionButton } from 'components/Permission';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import remote from 'hzero-front/lib/utils/remote';
import { getFileNumByUUID } from '@/utils/utils';
import QuestionPanel from '../../components/QuestionPanel';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import GroupMemberPanelSupplier from '../../components/GroupMemberPanelSupplier';
import CongratulationPanel from '../../components/CongratulationPanel';
import OperatorRecord from '../../components/QualityRectificationRecord';
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
import TrxQuoteList from '../../components/TrxQuoteList';
import SupplierSiteInvestigate from '../../components/SupplierSiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';

const prefix = `sqam.common.view.message.title`;
const prefix3 = `received8D`;

const { TabPane } = Tabs;
@remote({
  code: 'SQAM_RECEIVED8D_DETAIL',
  name: 'remote',
  process: {
    EFFECT_TRACK_PANEL: value => value,
    ATTACHMENT_MODAL: value => value,
  },
})
@withCustomize({
  unitCode: [
    'SQAM.RECEIVED_8D_DETAIL.BASIC',
    'SQAM.RECEIVED_8D_DETAIL.GROUPMEMBER',
    'SQAM.RECEIVED_8D_DETAIL.SHORTMEASURES',
    'SQAM.RECEIVED_8D_DETAIL.PERMANENTACTION',
    'SQAM.RECEIVED_8D_DETAIL.OTHERAPPLICABLE',
    'SQAM.RECEIVED_8D_DETAIL.STANDARDIZATION',
    'SQAM.RECEIVED_8D_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.RECEIVED_8D_DETAIL.TEMPMEASURE',
    'SQAM.RECEIVED_8D_DETAIL.ROOTCAUSE',
    'SQAM.RECEIVED_8D_DETAIL.RESULTSTRACKING',
    'SQAM.RECEIVED_8D_DETAIL.COLLAPSE',
    'SQAM.RECEIVED_8D_DETAIL.INSPECT',
    'SQAM.RECEIVED_8D_DETAIL.OTHERINFO',
    'SQAM.RECEIVED_8D_DETAIL.PROBLEM',
    'SQAM.RECEIVED_8D_DETAIL.TRX',
    'SQAM.RECEIVED_8D_DETAIL.CUSZ_FORM',
    'SQAM.RECEIVED_8D_DETAIL.CORRELATION_8D_LIST',
    'SQAM.RECEIVED_8D_DETAIL.BTNS',
    'SQAM.RECEIVED_8D_DETAIL.OTHER_BTNS',
    'SQAM.RECEIVED_8D_DETAIL.BASIC_TABS',
    'SQAM.RECEIVED_8D_DETAIL.OTHERINFO_A',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
  ],
})
@connect(
  ({
    received8D,
    loading,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    create8D,
  }) => ({
    received8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    create8D,
    evalLoading: loading.effects['create8D/fetchList'],
    loading: {
      detail: loading.effects['received8D/fetch8DBasicInfo'],
      operator: loading.effects['received8D/fetchOperatorRecord'],
      attachment: loading.effects['received8D/fetchAttachment'],
      returnSupplier: loading.effects['received8D/returnSupplier'],
    },
    promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
    followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
    rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
    foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
    isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
    standardizingLoading: loading.effects['standardizing/fetchData'],
    fetchCorrelationLoading: loading.effects['initiated8D/relation8D'],
    fetchSourceInfoLoading: loading.effects['received8D/fetchSourceInfoLoading'],
    fetchOrderLoading: loading.effects['received8D/fetchPurchaseOrder'],
    printLoading: loading.effects['received8D/print'],
    tenantId: getCurrentOrganizationId(),
  })
)
@formatterCollections({
  code: [
    'sqam.common',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.business',
    'sslm.evaluationQuery',
  ],
})
export default class Detail extends PureComponent {
  codeFields = [];

  constructor(props) {
    super(props);
    this.state = {
      operatorRecordVisible: false,
      attachmentVisible: false,
      selectedRowKeys: [],
      collapseKeys: [
        'b',
        'd',
        'c',
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
        'otherA',
      ],
      activeKey: 'basicInfo',
      nextId: null,
      evalHeaderIds: [],
      fileNum: 0,
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取8d基本信息
   */
  componentDidMount() {
    const { dispatch, remote: remoteProps } = this.props;
    this.handleSearch();
    const { queryUnitConfig } = this.props;
    queryUnitConfig({}, res => {
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
          code: 'customA',
          key: `sqam-${prefix3}-panel-custom`,
          title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
        },
        {
          code: 'otherA',
          key: `sqam-${prefix3}-panel-otherInfo-A`,
          title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
        },
      ];
      let newFields = remoteProps
        ? remoteProps.process('SQAM.RECEIVED_8D_DETAIL.COLLAPSE_FIELDS', _newFields)
        : _newFields;
      const unitConfig = res['SQAM.RECEIVED_8D_DETAIL.COLLAPSE'];
      if (unitConfig) {
        const { fields } = unitConfig;
        fields.forEach(row => {
          if (row.fieldName) {
            newFields = newFields.map(item => {
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
    dispatch({ type: 'received8D/fetchLov' });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'received8D/updateState',
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
    if (nextParams.id && params.id !== nextParams.id) {
      this.setState({ nextId: nextParams.id });
      this.handleSearch(nextParams.id);
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'received8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: nextId || id,
        customizeUnitCode:
          'SQAM.RECEIVED_8D_DETAIL.BASIC,SQAM.RECEIVED_8D_DETAIL.PROBLEM,SQAM.RECEIVED_8D_DETAIL.GROUPMEMBER,SQAM.RECEIVED_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.RECEIVED_8D_DETAIL.RESULTSTRACKING,SQAM.RECEIVED_8D_DETAIL.OTHERINFO,SQAM.RECEIVED_8D_DETAIL.CUSZ_FORM,SQAM.RECEIVED_8D_DETAIL.OTHERINFO_A',
        menuEntryPoint: 'SUPPLIER_RCV',
      },
    }).then(() => {
      const {
        received8D: {
          basicInfo: {
            sourceCode,
            rcvTrxLineIds,
            evalHeaderIds,
            problemHeaderId,
            attachmentUuid,
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
      this.getAttachmentNum([attachmentUuid, supplierAttachmentUuid]);
    });
    this.fetchCorrelation(nextId);
    this.fetchPurchaseOrder(nextId);
  }

  @Bind()
  async getAttachmentNum(uuids) {
    const num = await getFileNumByUUID(uuids);
    this.setState({ fileNum: num });
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
      type: 'received8D/siteEvalReportHeader',
      payload: {
        tenantId,
        query: {
          evalHeaderIds,
          page,
        },
      },
    });
  }

  // 查询关联8D
  @Bind()
  fetchCorrelation(nextId, page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'received8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId: nextId || id,
        customizeUnitCode: 'SQAM.RECEIVED_8D_DETAIL.CORRELATION_8D_LIST',
        page,
      },
    });
  }

  @Bind()
  fectchCorrelationPage(page = {}) {
    this.fetchCorrelation(this.state.nextId, page);
  }

  @Bind()
  async fetchItemTrx(rcvTrxLineIds) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/fetchTrxHeaderSupplier',
      payload: {
        tenantId,
        query: {
          // decisionResults: decisionResult ? [decisionResult] : decisionResults,
          // assessmentResults,
          withOutAuthFlag: 1,
          rcvTrxLineIds,
          customizeUnitCode: 'SQAM.RECEIVED_8D_DETAIL.TRX',
        },
      },
    });
  }

  @Bind()
  fetchSourceInfo(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'received8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: nextId || id,
        customizeUnitCode: 'SQAM.RECEIVED_8D_DETAIL.INSPECT',
      },
    });
  }

  @Bind()
  fetchPurchaseOrder(nextId) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'received8D/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: nextId || id,
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
      received8D: {
        basicInfo: { problemHeaderId },
      },
    } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/received8D/history/${record.problemHeaderHisId}/${problemHeaderId}`,
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
    const { id } = match.params;
    dispatch({
      type: 'received8D/fetchAssociation',
      payload: { problemHeaderId: id },
    });
  }

  /**
   * 查询详情页的Table
   */
  @Bind()
  fetchReadOnlyTable(type, page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type,
      payload: { edProblemHeaderId: id, tenantId, ...page },
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
      document.getElementById('sqam-received8D-detail-content-inner-wrapper')
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
    const { received8D = {}, create8D = {} } = this.props;
    const { quoteTrxList = [], siteInvestigateReportList = [], evalDataSource = [] } = create8D;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      relatioPagination,
      siteEvalReportPage,
    } = received8D;
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

  @Bind()
  handlePrint({ key }) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'received8D/print',
      payload: {
        tenantId,
        problemHeaderId: id,
        outputType: key,
      },
    }).then(res => {
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
        // supplierTenantId: getUserOrganizationId(),
        // source: 'supplier',
      },
    });
  }

  // 点击撤回
  handleWithdraw = () => {
    const {
      dispatch,
      received8D: { basicInfo = {} },
      tenantId,
    } = this.props;
    dispatch({
      type: 'received8D/returnSupplier',
      payload: {
        basicInfo,
        tenantId,
        customizeUnitCode:
          'SQAM.RECEIVED_8D_DETAIL.BASIC,SQAM.RECEIVED_8D_DETAIL.PROBLEM,SQAM.RECEIVED_8D_DETAIL.GROUPMEMBER,SQAM.RECEIVED_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.RECEIVED_8D_DETAIL.RESULTSTRACKING,SQAM.RECEIVED_8D_DETAIL.OTHERINFO,SQAM.RECEIVED_8D_DETAIL.CUSZ_FORM,SQAM.RECEIVED_8D_DETAIL.OTHERINFO_A',
      },
    }).then(result => {
      if (result) {
        notification.success();
        this.handleSearch();
      }
    });
  };

  @Bind()
  headerBtnsRender() {
    const {
      loading,
      received8D: { basicInfo = {} },
      printLoading = false,
      remote: remoteProps,
      tenantId,
    } = this.props;
    const isLoading = loading.detail || printLoading || loading.returnSupplier;
    const otherProps = {
      _this: this,
      basicInfo,
      isLoading,
      handleSearch: this.handleSearch,
    };
    const { problemStatus } = basicInfo;
    const btns = [
      ['ICA_SUBMITTED', 'PCA_SUBMITTED'].includes(problemStatus) && {
        name: 'withdraw',
        child: intl.get('hzero.common.button.callBack').d('撤回'),
        btnProps: {
          onClick: throttle(() => this.handleWithdraw(), 1500, { trailing: false }),
          loading: isLoading,
        },
      },
      {
        name: 'operate',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          disabled: !basicInfo.problemHeaderId,
          onClick: throttle(() => this.handleModal('operatorRecordVisible', true), 1500, {
            trailing: false,
          }),
          loading: isLoading,
        },
      },
      {
        name: 'attachment',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${this.state.fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          disabled: !basicInfo.problemHeaderId,
          onClick: throttle(this.handleAttachmentOption, 1500, { trailing: false }),
          loading: isLoading,
        },
      },
      {
        name: 'print',
        group: true,
        disabled: !basicInfo.problemHeaderId,
        children: [
          {
            name: 'pdf',
            child: 'PDF',
            btnProps: {
              onClick: throttle(() => this.handlePrint({ key: 'PDF' }), 1500, { trailing: false }),
            },
          },
          {
            name: 'excel',
            child: 'EXCEL',
            btnProps: {
              onClick: throttle(() => this.handlePrint({ key: 'XLSX' }), 1500, { trailing: false }),
            },
          },
        ],
        child: (
          <PermissionButton
            icon="printer"
            loading={isLoading}
            permissionList={[
              {
                code: `srm.sqam.business.problem.8d.recevied.button.print`,
                type: 'button',
              },
            ]}
          >
            {intl.get(`hzero.common.button.print`).d('打印')}
            <Icon type="down" />
          </PermissionButton>
        ),
      },
      {
        name: 'newprint',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get('sqam.common.view.button.printNew').d('新打印'),
          buttonProps: {
            disabled: !basicInfo.problemHeaderId,
            permissionList: [
              {
                code: 'srm.sqam.business.problem.8d.recevied.button.printnew',
                type: 'button',
              },
            ],
            loading: isLoading,
          },
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/problem-headers/list-print-new`,
          method: 'PUT',
          data: { edProblemHeaderIdList: [basicInfo.problemHeaderId] },
          successCallBack: () => this.handleSearch(),
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_RECEIVED_8D_DETAIL_BTNS', btns, otherProps)
      : btns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { match } = this.props;
    const { id } = match.params;
    const {
      operatorRecordVisible,
      attachmentVisible = false,
      selectedRowKeys = [],
      collapseKeys,
      activeKey,
    } = this.state;
    const {
      tenantId,
      loading,
      dispatch,
      received8D: {
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
      fetchSourceInfoLoading,
      fetchCorrelationLoading,
      location: { pathname, state = {} },
      create8D: { quoteTrxList, siteInvestigateReportList = [], evalDataSource = [] },
      fetchOrderLoading,
      customizeTable,
      customizeForm,
      customizeTabPane,
      customizeCollapse,
      custLoading,
      evalLoading,
      history,
      customizeBtnGroup,
      remote: remoteProps,
    } = this.props;

    const { received8DProvide = {} } = promiseMaintainProvide;
    const { received8DFollowUp = {} } = followUpProduce;
    const { received8DReason = {} } = rootReasonAnalyze;
    const { received8DSolution = {} } = foreverDealSolution;
    const { received8DSuit = {} } = isSuitUnderItem;
    const { received8DStandard = {} } = relateStandard;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = received8DProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = received8DFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = received8DReason;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = received8DSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = received8DStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = received8DSuit;
    const { edProblemAction = {}, edProblemTeamList = [], ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const basicInfoProps = {
      basicInfo: basic,
      loading: loading.detail,
      isSupplier: true,
      code: 'SQAM.RECEIVED_8D_DETAIL.BASIC',
      customizeForm,
      remoteProps,
      exposeCode: 'SQAM_RECEIVED8D_DETAIL__BASIC',
    };
    const groupMemberProps = {
      code: 'SQAM.RECEIVED_8D_DETAIL.GROUPMEMBER',
      customizeTable,
      custLoading,
      selectedRowKeys,
      isSupplier: true,
      groupMember: edProblemTeamList,
      onChangeFlag: e => e,
      onAdd: e => e,
    };
    const continueSupplyProps = {
      readOnly: true,
      required: false,
      loading: promiseMaintainProvideLoading,
      edProblemHeaderId: id,
      pagination: promiseMaintainProvidePagination,
      dataSource: promiseMaintainProvideList,
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.TEMPMEASURE',
      custLoading,
      stateKey: 'received8DProvide',
    };

    const followUpProduceProps = {
      code: 'SQAM.RECEIVED_8D_DETAIL.SHORTMEASURES',
      customizeTable,
      custLoading,
      loading: followUpProduceLoading,
      readOnly: true,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      stateKey: 'received8DFollowUp',
    };
    const rootAnalyzeProps = {
      loading: rootAnalyzeLoading,
      edProblemHeaderId: id,
      readOnly: true,
      required: false,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'received8DReason',
    };
    const remedialActionProps = {
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.PERMANENTACTION',
      custLoading,
      loading: foreverSolutionLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      stateKey: 'received8DSolution',
    };
    const standardizingProps = {
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.STANDARDIZATION',
      custLoading,
      loading: standardizingLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      stateKey: 'received8DStandard',
    };
    const isSuitUnderItemProps = {
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.OTHERAPPLICABLE',
      custLoading,
      loading: isSuitUnderItemLoading,
      readOnly: true,
      required: false,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      stateKey: 'received8DSuit',
    };
    const congratulationProps = {
      customizeForm,
      code: 'SQAM.RECEIVED_8D_DETAIL.TEAMCONGRATULATIONS',
      readOnly: true,
      congratulations: edProblemInfo,
      onRef: e => e,
    };
    const operatorRecordProps = {
      remoteProps,
      isApprovalShow: false,
      visible: operatorRecordVisible,
      businessKey: basicInfo.businessKey,
      problemHeaderId: basicInfo.problemHeaderId,
      hideModal: () => this.handleModal('operatorRecordVisible', false),
    };
    const attachmentProps = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      loading: loading.attachment,
      visible: attachmentVisible,
      onCancel: this.handleAttachmentModalHidden,
      supplierAttachmentUuid: basicInfo.supplierAttachmentUuid,
      attachmentUuid: basicInfo.attachmentUuid,
      purchaseReadOnly: true,
      showSupplier: true,
      camp: 'supplier',
      supplierReadOnly: true,
    };

    const OtherInfoProps = {
      readOnly: true,
      required: false,
      loading: loading.detail,
      pagination: basicInfo.otherInfoPagination,
      dataSource: basicInfo.lineList,
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.OTHERINFO',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.RECEIVED_8D_DETAIL.OTHER_BTNS',
      camp: 'supplier',
    };
    const OtherInfoAProps = {
      readOnly: true,
      required: false,
      loading: loading.detail,
      pagination: basicInfo.otherInfoAPagination,
      dataSource: basicInfo.otherDetailList,
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.OTHERINFO_A',
      custLoading,
      problemHeaderId: basicInfo.problemHeaderId,
    };

    const questionProps = {
      problemDesc: basic,
      onRef: e => e,
      customizeForm,
      code: 'SQAM.RECEIVED_8D_DETAIL.PROBLEM',
      noMeanFlag: true,
    };

    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      code: 'SQAM.RECEIVED_8D_DETAIL.TRX',
      customizeTable,
    };

    const correlationProps = {
      supplier: true,
      backPath: pathname,
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      customCode: 'SQAM.RECEIVED_8D_DETAIL.CORRELATION_8D_LIST',
      customizeTable,
      fetchCorrelation: this.fectchCorrelationPage,
      pagination: relatioPagination,
    };
    const sourceInfoProps = {
      tenantId,
      dispatch,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      backPath: pathname,
      prefixToPath: '/received8D',
      customizeTable,
      code: 'SQAM.RECEIVED_8D_DETAIL.INSPECT',
    };
    const purchaseOrderProps = {
      loading: fetchOrderLoading,
      dataSource: purchaseOrderList,
      backPath: pathname,
      isSupplier: true,
      prefixToPath: '/received8D',
      history,
    };
    const effectTrackProps = {
      remoteProps,
      dataSource: basicInfo,
      code: 'SQAM.RECEIVED_8D_DETAIL.RESULTSTRACKING',
      customizeForm,
      _this:this,
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
      prefixToPath: '/received8D',
      onSearch: this.siteEvalReportHeader,
    };
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
      pageSource: 'received8D',
      // onChange: page => this.handleEvaluationSearch(page),
    };
    return (
      <React.Fragment>
        {match.path !== '/pub/sqam/received8D/detail/:id' && (
          <Header
            title={intl
              .get(`${prefix}.qualityRectification.received`)
              .d('我收到的质量整改报告详情')}
            backPath={state.backPath || '/sqam/received8D/list'}
          >
            {customizeBtnGroup(
              { code: 'SQAM.RECEIVED_8D_DETAIL.BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        )}
        <div className="sqam-detail-content" id="sqam-received8D-detail-content-inner-wrapper">
          <Content className={classNames(styles['page-content'])}>
            <Spin spinning={loading.detail} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {match.path === '/pub/sqam/received8D/detail/:id' && (
                <Button
                  icon="paper-clip"
                  onClick={this.handleAttachmentOption}
                  style={{ marginBottom: '10px' }}
                >
                  {intl.get('entity.attachment.view').d('附件查看')}
                </Button>
              )}
              {customizeCollapse(
                {
                  code: 'SQAM.RECEIVED_8D_DETAIL.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Collapse.Panel
                    id="sqam-received8D-panel-basic"
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
                        { code: 'SQAM.RECEIVED_8D_DETAIL.BASIC_TABS' },
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
                              <SupplierSiteInvestigate {...siteInvestigateReport} />
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
                    id="sqam-received8D-panel-question"
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
                    id="sqam-received8D-panel-groupMember"
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
                    <GroupMemberPanelSupplier {...groupMemberProps} />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-received8D-panel-promiseMaintainProvide"
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
                    id="sqam-received8D-panel-shortMeature"
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
                    id="sqam-received8D-panel-analyzeReason"
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
                    id="sqam-received8D-panel-foreverDealSolution"
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
                    id="sqam-received8D-panel-applyItem"
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
                    id="sqam-received8D-panel-standard"
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
                    id="sqam-received8D-panel-congratulation"
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
                  {basicInfo.problemStatus !== 'VALIDATED' && (
                    <Collapse.Panel
                      id="sqam-received8D-panel-effectTrack"
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
                      <EffectTrackPanel
                        {...remoteProps?.process('EFFECT_TRACK_PANEL', effectTrackProps)}
                      />
                    </Collapse.Panel>
                  )}
                  <Collapse.Panel
                    id="sqam-received8D-panel-otherInfo"
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
                    id="sqam-received8D-panel-otherInfo-A"
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
                    id="sqam-received8D-panel-custom"
                    showArrow={false}
                    forceRender
                    key="customA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.RECEIVED_8D_DETAIL.CUSZ_FORM"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_RECEIVED8D_DETAIL_CUX_EXTRA_PANEL",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            <FixedAnchor
              linkList={this.codeFields}
              className="sqam-received8D-detail-content-inner-wrapper"
              code="SQAM.RECEIVED_8D_DETAIL.COLLAPSE"
              customizeCollapse={customizeCollapse}
            />
          </Content>
        </div>
        {operatorRecordVisible && <OperatorRecord {...operatorRecordProps} />}
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
      </React.Fragment>
    );
  }
}
