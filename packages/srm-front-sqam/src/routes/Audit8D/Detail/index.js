/**
 * 8D 审核-明细
 * @date: 2018-11-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Icon, Tabs } from 'hzero-ui';
import classNames from 'classnames';
import { Button } from 'components/Permission';
import DynamicButtons from '_components/DynamicButtons';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, throttle } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import moment from 'moment';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getResponse,
  getEditTableData,
  delItemsToPagination,
} from 'utils/utils';
import { DETAIL_DEFAULT_CLASSNAME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import uuidv4 from 'uuid/v4';
import { queryApprovalMethod } from '@/services/create8DService';
import CustomForm from '@/routes/components/CustomForm';
import remote from 'hzero-front/lib/utils/remote';
import { getFileNumByUUID } from '@/utils/utils';
import styles from './index.less';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import QuestionPanel from '../../components/QuestionPanel';
import GroupMemberPanel from '../../components/GroupMemberPanel';
import CongratulationPanel from '../../components/CongratulationPanel';
import AttachmentModal from '../../components/AttachmentC7nModal';

import PromiseMaintainProvide from '../../components/PorvisionalMeasure/PromiseMaintainProvide';
import FollowUpProduce from '../../components/PorvisionalMeasure/FollowUpProduce';
import RootReasonAnalyze from '../../components/rootReasonAnalyze';
import ForeverDealSolution from '../../components/ForeverDealSolution';
import RelateStandard from '../../components/RelateStandard';
import IsSuitUnderItem from '../../components/IsSuitUnderItem';
import SourceInfo from '../../components/SourceInfoPanel';
import Correlation from '../../components/CorrelationPanel';
import TimeAdjustmentModal from '../../components/TimeAdjustmentModal';
import PurchaseOrderPanel from '../../components/PurchaseOrderPanel';
import OperatorRecord from '../../components/QualityRectificationRecord';
import TrxQuoteList from '../../components/TrxQuoteList';
import SiteInvestigate from '../../components/SiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';
import CommonDrawer from '../components/CommonDrawer';

const prefix1 = `sqam.common.view.message.title`;
const prefix2 = 'sqam.common.view.message';
const { TabPane } = Tabs;
const prefix3 = 'audit8dnotPub';

@remote(
  {
    code: 'SQAM_AUDIT8D_DETAIL',
    name: 'remote',
  },
  {
    events: {
      handleOperatorCux: ({ handleOperator }) => handleOperator(),
      cuxHandleReject:()=>{},// 审核拒绝增加二开逻辑
      cuxHandleContinuePCA:()=>{},// 继续反馈PCA增加二开逻辑
    },
  }
)
@withCustomize({
  unitCode: [
    // 'SQAM.FEEDBACK_8D_DETAIL.BASIC',
    'SQAM.INITIATED_8D.DETAIL.BASIC', // 我发起的质量整改 -基本信息
    'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
    'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
    'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
    'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
    'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
    'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
    'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
    'SQAM.AUDIT_8D_DETAIL.COLLAPSE',
    'SQAM.AUDIT_8D_DETAIL.HEADER_BTNS',
    'SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE',
    'SQAM.AUDIT_8D_DETAIL.MODAL_CANCEL',
    'SQAM.AUDIT_8D_DETAIL.INSPECT',
    'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
    'SQAM.AUDIT_8D_DETAIL.PROBLEM',
    'SQAM.AUDIT_8D_DETAIL.BASIC',
    'SQAM.AUDIT_8D_DETAIL.TRX',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C',
    'SQAM.AUDIT_8D_DETAIL.CORRELATION_8D_LIST',
    'SQAM.AUDIT_8D_DETAIL.REJECT_STAGE',
    'SQAM.AUDIT_8D_DETAIL.PCA_STAGE',
    'SQAM.AUDIT_8D_DETAIL.OTHER_BTNS',
    'SQAM.AUDIT_8D_DETAIL.BASIC_TABS',
    'SQAM.AUDIT_8D_DETAIL.OTHERINFO_A',
  ],
})
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
@connect(
  ({
    create8D,
    audit8D,
    loading,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
  }) => ({
    create8D,
    audit8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    evalLoading: loading.effects['create8D/fetchList'],
    loading: {
      detail: loading.effects['audit8D/fetch8DBasicInfo'],
      operator: loading.effects['audit8D/fetchOperatorRecord'],
      continue: loading.effects['audit8D/continuePca'],
      completed: loading.effects['audit8D/completed8D'],
      reject: loading.effects['audit8D/auditReject'],
      abandon: loading.effects['audit8D/abandon'],
      attachment: loading.effects['audit8D/fetchAttachment'],
      dateTimeLoading: loading.effects['audit8D/updateTime'],
      otherInfoDeleteLoading: loading.effects['audit8D/delDproblemheaderdetaillines'],
    },
    loadingAssociation: loading.effects['audit8D/fetchAssociation'],
    promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
    followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
    rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
    foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
    isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
    standardizingLoading: loading.effects['standardizing/fetchData'],
    fetchSourceInfoLoading: loading.effects['audit8D/fetchSourceInfoLoading'],
    fetchOrderLoading: loading.effects['audit8D/fetchPurchaseOrder'],
    fetchCorrelationLoading: loading.effects['audit8D/relation8D'],
    tenantId: getCurrentOrganizationId(),
  })
)
export default class Detail extends PureComponent {
  form = {};
 
  constructor(props) {
    super(props);
    this.state = {
      timeAdjustmentVisible: false, // 时间调整Visible
      operatorRecordVisible: false,
      attachmentVisible: false,
      selectedRowKeys: [],
      isPcaSubmitted: undefined,
      collapseKeys: [
        'a',
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
        'm',
        'customeA',
        'customeB',
        'customC',
        'otherA',
      ],
      activeKey: 'basicInfo',
      isApprovalShow: false,
      attachmentUuid: uuidv4(),
      attachmentInterUuid: uuidv4(),
      interAttachmentSize: 0,
      storageSize: [],
      oprVisible: false, // 取消整改/审批拒绝弹出框
      modalType: 'cancel',
      approveType: '',
      evalHeaderIds: [],
      otherInfoSelectedRowKeys: [], // 其他信息
      otherInfoSelectedRows: [],
      otherInfoASelectedRowKeys: [], // 其他信息
      otherInfoASelectedRows: [],
      fileNum: 0,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.handleSearch();
    this.fetchSettingValue();
    dispatch({ type: 'audit8D/fetchLov' });
    dispatch({
      type: 'create8D/fetchUploadInfo',
    }).then((res) => {
      if (res) {
        const { directory } = res.listConfig.content[0] || {};
        if (directory === 'sqam/8d/') {
          const { storageSize = 10 } = res.listConfig.content[0] || {};
          this.setState({ storageSize });
        } else {
          this.setState({ storageSize: 10 });
        }
      }
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'audit8D/updateState',
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

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id },
      },
    } = prevProps;
    if (this.props.match.params.id !== id) {
      this.handleSearch();
    }
  }

  @Bind()
  getCodeFileds() {
    const { custConfig, remote: remoteProps } = this.props;
    const _newFields = [
      // {
      //   code: 'a',
      //   key: `sqam-${prefix3}-panel-auditStage`,
      //   title: intl.get(`${prefix1}.panel.auditStage`).d('审核阶段'),
      // },
      {
        code: 'b',
        key: `sqam-${prefix3}-panel-basic`,
        title: intl.get(`${prefix1}.panel.basic`).d('基本信息'),
      },
      {
        code: 'c',
        key: `sqam-${prefix3}-panel-question`,
        title: intl.get(`${prefix1}.panel.question`).d('问题描述'),
      },
      {
        code: 'd',
        key: `sqam-${prefix3}-panel-groupMember`,
        title: intl.get(`${prefix1}.panel.groupMember`).d('小组成员'),
      },
      {
        code: 'e',
        key: `sqam-${prefix3}-panel-promiseMaintainProvide`,
        title: intl.get(`${prefix1}.panel.promiseMaintainProvide`).d('临时围堵措施—保证持续供货'),
      },
      {
        code: 'f',
        key: `sqam-${prefix3}-panel-shortMeature`,
        title: intl.get(`${prefix1}.panel.shortMeature`).d('短期措施'),
      },
      {
        code: 'g',
        key: `sqam-${prefix3}-panel-analyzeReason`,
        title: intl.get(`${prefix1}.panel.analyzeReason`).d('根本原因分析'),
      },
      {
        code: 'h',
        key: `sqam-${prefix3}-panel-foreverDealSolution`,
        title: intl.get(`${prefix1}.panel.foreverDealSolution`).d('永久纠正措施'),
      },
      {
        code: 'i',
        key: `sqam-${prefix3}-panel-standard`,
        title: intl.get(`${prefix1}.panel.standard`).d('相关标准化'),
      },
      {
        code: 'j',
        key: `sqam-${prefix3}-panel-congratulation`,
        title: intl.get(`${prefix1}.panel.congratulation`).d('小组祝贺'),
      },
      {
        code: 'k',
        key: `sqam-${prefix3}-panel-applyItem`,
        title: intl.get(`${prefix2}.panel.applyItem`).d('是否适用以下项目'),
      },
      {
        code: 'm',
        key: `sqam-${prefix3}-panel-applyItem`,
        title: intl.get(`${prefix1}.panel.otherInfo`).d('其他信息'),
      },
      {
        code: 'customeA',
        key: `sqam-${prefix3}-panel-custom`,
        title: intl.get(`${prefix1}.panel.basic`).d('基本信息'),
      },
      {
        code: 'customeB',
        key: `sqam-${prefix3}-panel-custom-b`,
        title: intl.get(`${prefix1}.panel.basic`).d('基本信息'),
      },
      {
        code: 'customC',
        key: `sqam-${prefix3}-panel-custom-c`,
        title: intl.get(`${prefix1}.panel.basic`).d('基本信息'),
      },
      {
        code: 'otherA',
        key: `sqam-audit8d-panel-otherInfo-A`,
        title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
      },
    ];
    let newFields = remoteProps
      ? remoteProps.process('SQAM.AUDIT_8D_DETAIL.COLLAPSE_FIELDS', _newFields)
      : _newFields;
    const unitConfig = custConfig['SQAM.AUDIT_8D_DETAIL.COLLAPSE'];
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
      return newFields;
    }
    return [];
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'audit8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode:
          'SQAM.INITIATED_8D.DETAIL.BASIC,SQAM.AUDIT_8D_DETAIL.PROBLEM,SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE,SQAM.AUDIT_8D_DETAIL.GROUPMEMBER,SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS,SQAM.AUDIT_8D_DETAIL.OTHERINFO_A,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B,SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C,SQAM.AUDIT_8D_DETAIL.REJECT_STAGE,SQAM.AUDIT_8D_DETAIL.PCA_STAGE,SQAM.AUDIT_8D_DETAIL.BASIC',
        menuEntryPoint: 'CUSTOMER_APPROVE_AUDIT',
      },
    }).then(() => {
      const {
        audit8D: {
          basicInfo: {
            problemStatus,
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
      this.setState({ isPcaSubmitted: problemStatus === 'PCA_SUBMITTED' });
      if (sourceCode === 'INCOMING_INSPECTION') this.fetchSourceInfo();
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
          customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.TRX',
        },
      },
    });
  }

  // 现场考察结果
  @Bind()
  async siteInvestigateReport(evalHeaderIds) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'audit8D/siteInvestigateReport',
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
      type: 'audit8D/siteEvalReportHeader',
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

  @Bind()
  fetchSourceInfo() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'audit8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.INSPECT',
      },
    });
  }

  // 查询关联8D
  @Bind()
  fetchCorrelation(page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'audit8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.CORRELATION_8D_LIST',
        page,
      },
    });
  }

  @Bind()
  fetchPurchaseOrder() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'audit8D/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  // @Bind()
  // handleBindRef(ref = {}) {
  //   this.form = (ref.props || {}).form;
  // }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindJRef(ref = {}, key = '') {
    this.form[key] = (ref.props || {}).form;
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

  /**
   * 行内校验
   * @param {Array} [dataSource=[]] 数据源
   * @param {Array} [excludeKeys=[]] 排除的字段
   * @param {Object} [property={}] 校验API的options
   */
  @Bind()
  async validateEditTableDataSource(dataSource = [], excludeKeys = [], property = {}) {
    if (dataSource.length === 0) {
      return dataSource;
    }
    // 如果折叠面板被隐藏了(如小组成员)，有数据时被校验时会不通过，检查列表如果没有$form返回原数据，不去校验
    const hasFormFlag = dataSource.some((v) => v?.$form);
    if (!hasFormFlag) return dataSource;

    return new Promise((resolve, reject) => {
      const validateDataSource = getEditTableData(dataSource, excludeKeys, property);
      if (validateDataSource.length !== 0) {
        resolve(validateDataSource);
      }
      reject();
    }).catch();
  }

  @Bind()
  handleData(originData = []) {
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
        params = getEditTableData(editMemList, ['problemTeamId']);
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

  /**
   * 操作8D“继续反馈PCA”、“完成8D”等
   * @param {string} type - 要请求的model
   */
  @Bind()
  async edOperator(type, tip, otherValues = {}) {
    const {
      dispatch,
      tenantId,
      // form={},
      match: {
        params: { id },
      },
      audit8D: { basicInfo },
      rootReasonAnalyze = {},
      history,
    } = this.props;
    const formJ = this.form?.j?.getFieldsValue ? this.form?.j?.getFieldsValue() : {};
    const formC = this.form?.c?.getFieldsValue ? this.form?.c?.getFieldsValue() : {};
    const formCustomA = this.form?.customA?.getFieldsValue
      ? this.form?.customA?.getFieldsValue()
      : {};
    const formCustomB = this.form?.customeB?.getFieldsValue
      ? this.form?.customeB?.getFieldsValue()
      : {};
    const formCustomC = this.form?.customC?.getFieldsValue
      ? this.form?.customC?.getFieldsValue()
      : {};
    const { audit8DReason = {} } = rootReasonAnalyze;
    // eslint-disable-next-line
    const { edProblemAction, lineList, otherDetailList } = basicInfo;
    const { rootReasonAnalyzeList = [] } = audit8DReason;
    const rootReasonAnalyzeListData = getEditTableData(rootReasonAnalyzeList);
    const edAction = { ...edProblemAction, ...formJ };
    const { oprForm, ...modalValues } = otherValues;

    let formCError;
    // eslint-disable-next-line
    if (this.form.c?.validateFieldsAndScroll) {
      await this.form.c.validateFieldsAndScroll((err) => {
        if (err) formCError = true;
      });
    }
    // eslint-disable-next-line
    if (this.form?.customA?.validateFieldsAndScroll) {
      await this.form.customA.validateFieldsAndScroll((err) => {
        if (err) formCError = true;
      });
    }

    // eslint-disable-next-line
    if (this.form?.customeB?.validateFieldsAndScroll) {
      await this.form.customeB.validateFieldsAndScroll((err) => {
        if (err) formCError = true;
      });
    }
    // eslint-disable-next-line
    if (this.form?.customC?.validateFieldsAndScroll) {
      await this.form.customC.validateFieldsAndScroll((err) => {
        if (err) formCError = true;
      });
    }
    if (formCError) return;
    const newlineListSource = this.handleDataTypes(lineList, 'filterNotDelete');
    const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');
    const newlineListSourceA = this.handleDataTypes(otherDetailList, 'filterNotDelete');
    const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');
    Promise.all([
      this.validateEditTableDataSource(editlineList, [], {
        force: true,
      }),
      this.validateEditTableDataSource(editlineListA, [], {
        force: true,
      }),
    ]).then(() => {
      // 其他信息
      const finallylineList = this.handleData(lineList, 'otherInfoId');
      const finallylineListA = this.handleData(otherDetailList, 'otherDetailId');
      const newValues = {
        ...formC,
        ...basicInfo,
        edProblemRootCauseList: rootReasonAnalyzeListData,
        edProblemAction: edAction,
        ...modalValues,
        ...formCustomA,
        ...formCustomB,
        ...formCustomC,
        problemDetail: modalValues.problemDetail || basicInfo.problemDetail,
        lineList: finallylineList,
        otherDetailList: finallylineListA,
      };
      dispatch({
        type,
        payload: {
          tenantId,
          problemHeaderId: id,
          data: { ...newValues },
        },
      }).then((res) => {
        if (res) {
          notification.success();
          if (!tip) {
            this.handleOpr(false, oprForm);
          }
          // 返回列表页
          history.push({
            pathname: `/sqam/audit8D/list`,
          });
        }
      });
    });
  }

  /**
   * 继续反馈PCA
   */
  @Bind()
  async handleContinuePCA() {
    const {
      remote:remoteProps,
      audit8D: {
        basicInfo = {},
      }
  } = this.props;

    if (remoteProps && remoteProps.event) {
      await remoteProps.event.fireEvent('cuxHandleContinuePCA', {
        basicInfo
      });
    }
    this.setState({ modalType: 'approve', approveType: 'continue' });
    this.handleOpr(true);
  }

  /**
   * 完成8D
   */
  @Bind()
  handleFinished8D() {
    this.setState({ modalType: 'approve', approveType: 'completed' });
    this.handleOpr(true);
  }

  /**
   * 审核拒绝
   */
  @Bind()
  async handleReject() {
    const {
      remote:remoteProps,
      audit8D: {
        basicInfo = {},
      }
  } = this.props;

    if (remoteProps && remoteProps.event) {
      await remoteProps.event.fireEvent('cuxHandleReject', {
        basicInfo
      });
    }
    this.setState({ modalType: 'approve', approveType: 'reject' });
    this.handleOpr(true);
  }

  /**
   * 取消8D
   */
  @Bind()
  handleAbandon() {
    this.setState({ modalType: 'cancel' });
    this.handleOpr(true);
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
    const {
      tenantId,
      dispatch,
      audit8D: { basicInfo },
    } = this.props;
    const { attachmentUuid, attachmentInterUuid } = this.state;
    if (!basicInfo.attachmentUuid && !basicInfo.attachmentInterUuid) {
      dispatch({
        type: 'audit8D/saveUUID',
        payload: {
          tenantId,
          uuid: attachmentUuid,
          uuidType: 4, // 供应商附件标识
          problemHeaderId: basicInfo.problemHeaderId,
          interUuid: attachmentInterUuid,
        },
      }).then((res) => {
        // 返回版本号
        if (res) {
          dispatch({
            type: 'audit8D/updateState',
            payload: {
              basicInfo: {
                ...basicInfo,
                objectVersionNumber: res,
                attachmentUuid,
                attachmentInterUuid,
              },
            },
          });
        }
      });
    } else {
      if (!basicInfo.attachmentUuid) {
        dispatch({
          type: 'audit8D/saveUUID',
          payload: {
            tenantId,
            uuid: attachmentUuid,
            uuidType: 1, // 供应商附件标识
            problemHeaderId: basicInfo.problemHeaderId,
          },
        }).then((res) => {
          // 返回版本号
          if (res) {
            dispatch({
              type: 'audit8D/updateState',
              payload: {
                basicInfo: {
                  ...basicInfo,
                  objectVersionNumber: res,
                  attachmentUuid,
                },
              },
            });
          }
        });
      }
      if (!basicInfo.attachmentInterUuid) {
        dispatch({
          type: 'audit8D/saveUUID',
          payload: {
            tenantId,
            uuid: attachmentInterUuid,
            uuidType: 3,
            problemHeaderId: basicInfo.problemHeaderId,
          },
        }).then((res) => {
          // 返回版本号
          if (res) {
            dispatch({
              type: 'audit8D/updateState',
              payload: {
                basicInfo: {
                  ...basicInfo,
                  objectVersionNumber: res,
                  attachmentInterUuid,
                },
              },
            });
          }
        });
      }
    }
    this.setState({
      attachmentVisible: false,
    });
    const uuid = basicInfo.attachmentUuid || attachmentUuid;
    const uuidInter = basicInfo.attachmentInterUuid || attachmentInterUuid;
    this.getAttachmentNum([uuid, uuidInter, basicInfo?.supplierAttachmentUuid]);
  }

  /**
   * 历史版本详细信息跳转
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleVersionDetail(record = {}) {
    const {
      dispatch,
      audit8D: {
        basicInfo: { problemHeaderId },
      },
    } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/audit8D/history/${record.problemHeaderHisId}/${problemHeaderId}`,
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
      type: 'audit8D/fetchAssociation',
      payload: { problemHeaderId: id },
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
      document.getElementById('sqam-audit8dnotPub-detail-content-inner-wrapper')
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
    const { audit8D = {}, create8D = {} } = this.props;
    const { quoteTrxList = [], evalDataSource = [] } = create8D;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      siteInvestigateReportList = [],
      relatioPagination,
      siteEvalReportPage,
    } = audit8D;

    const textObj = {
      rectification: {
        tab: intl.get(`${prefix2}.tab.relatedRectification`).d(`关联整改报告`),
        count: relatioPagination?.total || correlationList?.length,
      },
      inspect: {
        count: sourceInfolist?.length,
        tab: intl.get(`${prefix2}.tab.qualityInspect`).d(`关联质检单`),
      },
      purchaseOrder: {
        count: purchaseOrderList?.length,
        tab: intl.get(`${prefix2}.tab.relatedPurchaseOrder`).d(`关联采购订单`),
      },
      trxInspect: {
        count: quoteTrxList?.length,
        tab: intl.get(`${prefix2}.tab.trxRcvLine`).d(`关联质检事务`),
        content: null,
      },
      siteInvestigateReport: {
        count: siteInvestigateReportList?.length,
        tab: intl.get(`${prefix2}.tab.siteInvestigateReport`).d(`现场考察结果`),
        content: null,
      },
      siteEval: {
        count: siteEvalReportPage?.total,
        tab: intl.get(`${prefix2}.tab.siteEval`).d(`评估报告`),
        content: null,
      },
      supEvaluationFile: {
        count: evalDataSource?.length,
        tab: intl.get(`sqam.common.view.message.title.tab.supEvaluationFile`).d(`供应商考评档案`),
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
   * 打开时间调整
   * @param {*} visible
   * @param {*} flag
   */
  @Bind()
  handleOpenAppeal() {
    this.setState({
      timeAdjustmentVisible: true,
    });
  }

  /**
   * 关闭时间调整
   */

  @Bind()
  handleCloseAppeal() {
    this.setState({
      timeAdjustmentVisible: false,
    });
  }

  /**
   * 获得时间model内数据
   */
  @Bind()
  handleOkData(value) {
    this.handleDataOK(value);
  }

  // 时间调整确定按钮
  @Bind()
  handleDataOK(value) {
    const {
      dispatch,
      tenantId,
      match: {
        params: { id },
      },
      // feedback8D: { basicInfo = {} },
    } = this.props;

    const { icaDemandDate, pcaDemandDate, adjustmentRemark } = value;
    const icaDemandDateTime = moment(icaDemandDate).format(DEFAULT_DATETIME_FORMAT);
    const pcaDemandDateTime = moment(pcaDemandDate).format(DEFAULT_DATETIME_FORMAT);
    const newValue = {
      ...value,
      icaDemandDate: icaDemandDateTime,
      pcaDemandDate: pcaDemandDateTime,
      adjustmentRemark,
      problemHeaderId: id,
    };

    dispatch({
      type: 'audit8D/updateTime',
      payload: {
        tenantId,
        body: newValue,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
      }
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
  headerBtnsRender() {
    const {
      loading,
      audit8D: { basicInfo = {} },
    } = this.props;
    const { isPcaSubmitted, isApprovalShow, fileNum, cuxloading } = this.state;
    const btnLoading =
      loading?.continue ||
      loading?.completed ||
      loading?.reject ||
      loading?.abandon ||
      loading?.detail ||
      loading?.dateTimeLoading ||
      loading?.detail ||
      cuxloading;
    const btns = [
      {
        name: 'pca',
        btnComp: Button,
        child: intl.get(`${prefix1}.feedback.pca`).d('继续反馈PCA'),
        btnProps: {
          icon: '',
          type: 'primary',
          style: { display: isUndefined(isPcaSubmitted) || isPcaSubmitted ? 'none' : '' },
          onClick: throttle(this.handleContinuePCA, 1500, { trailing: false }),
          loading: btnLoading,
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.audit.ps.ps.feedback`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'completeRectification',
        child: intl.get(`sqam.common.view.button.completeRectification`).d('完成整改'),
        btnProps: {
          icon: 'check',
          type: isPcaSubmitted ? 'primary' : '',
          onClick: throttle(this.handleFinished8D, 1500, { trailing: false }),
          loading: btnLoading,
        },
      },
      {
        name: 'rejectAduit',
        child: intl.get(`${prefix1}.rejectAduit`).d('审核拒绝'),
        btnProps: {
          icon: 'close',
          onClick: throttle(this.handleReject, 1500, { trailing: false }),
          loading: btnLoading,
        },
      },
      !['ICA_REJECTED'].includes(basicInfo.problemStatus) && {
        name: 'cancelRectification',
        child: intl.get(`sqam.common.view.button.cancelRectification`).d('取消整改'),
        btnProps: {
          icon: 'close',
          onClick: throttle(this.handleAbandon, 1500, { trailing: false }),
          loading: btnLoading,
        },
      },
      {
        name: 'operating',
        child: isApprovalShow
          ? `${intl.get('sqam.common.button.approval').d('审批')}/${intl
              .get('hzero.common.button.operating')
              .d('操作记录')}`
          : intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          onClick: throttle(() => this.handleModal('operatorRecordVisible', true), 1500, {
            trailing: false,
          }),
          loading: btnLoading,
        },
      },
      {
        name: 'attachmentUuid',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          onClick: throttle(this.handleAttachmentOption, 1500, { trailing: false }),
          loading: btnLoading,
        },
      },
      ['PUBLISHED', 'ICA_SUBMITTED', 'ICA_REJECTED', 'PCA_FEEDBACKING'].includes(
        basicInfo.problemStatus
      ) && {
        name: 'timeAdjustment',
        btnComp: Button,
        child: intl.get('sqam.common.model.qualityRectification.timeAdjustment').d('时间调整'),
        btnProps: {
          onClick: throttle(this.handleOpenAppeal, 1500, { trailing: false }),
          loading: btnLoading,
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.audit.ps.button.time`,
              type: 'button',
            },
          ],
        },
      },
    ];

    return btns;
  }

  // 关闭取消整改/审核拒绝弹出框
  @Bind()
  handleOpr(flag = false, oprForm) {
    // eslint-disable-next-line react/no-unused-state
    this.setState({ oprVisible: flag });
    if (!flag) {
      oprForm.resetFields();
    }
  }

  // 保存取消整改/审核拒绝弹出框的内容
  @Bind()
  confirmOpr(oprForm) {
    const { remote: remoteProps } = this.props;
    const { modalType, approveType = 'reject' } = this.state;
    const approveUrlType = {
      completed: 'audit8D/completed8D',
      reject: 'audit8D/auditReject',
      continue: 'audit8D/continuePca',
    };
    const type = modalType === 'cancel' ? 'audit8D/abandon' : approveUrlType[approveType];

    oprForm.validateFields((err, values) => {
      if (!err) {
        const attibuteName = modalType === 'cancel' ? 'cancelRemark' : 'approvedRemark';
        const { expectedTrackTime } = values;
        const handleOperator = (extraParams) =>
          this.edOperator(type, undefined, {
            ...values,
            [attibuteName]: values[attibuteName],
            expectedTrackTime: expectedTrackTime
              ? moment(expectedTrackTime).format(DEFAULT_DATETIME_FORMAT)
              : undefined,
            oprForm,
            ...extraParams,
          });
        if (remoteProps?.event) {
          return remoteProps.event.fireEvent('handleOperatorCux', {
            modalType,
            approveType,
            handleOperator,
            that: this,
            // modalType: 'approve', approveType: 'continue'
          });
        } else {
          return handleOperator();
        }
      }
    });
  }

  // 列表选择公共函数
  @Bind()
  handleCommonRowSelection(selectedRowKeys, selectedRows, container) {
    this.setState({
      [`${container}SelectedRowKeys`]: selectedRowKeys || [],
      [`${container}SelectedRows`]: selectedRows || [],
    });
  }

  @Bind()
  async handleOtherInfoDelete() {
    const { otherInfoSelectedRows, otherInfoSelectedRowKeys } = this.state;
    let result = {};
    const {
      dispatch,
      audit8D: { basicInfo = {} },
    } = this.props;
    const { lineList, otherInfoPagination } = basicInfo;
    const remoteDeleteData = otherInfoSelectedRows.filter((item) => item._status === 'update');
    let isNeedRefresh = false;
    if (remoteDeleteData.length > 0) {
      result = await dispatch({
        type: 'audit8D/delDproblemheaderdetaillines',
        payload: remoteDeleteData,
      });
      if (!result) return;
      isNeedRefresh = true;
    }
    const params = {
      lineList: lineList.filter((item) => !otherInfoSelectedRowKeys.includes(item.otherInfoId)),
      otherInfoPagination: delItemsToPagination(
        otherInfoSelectedRows.length,
        lineList.length,
        otherInfoPagination
      ),
    };
    dispatch({
      type: 'audit8D/updateState',
      payload: { basicInfo: { ...basicInfo, ...params } },
    });
    this.setState({
      otherInfoSelectedRows: [],
      otherInfoSelectedRowKeys: [],
    });
    if (isNeedRefresh) {
      this.handleSearch();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { match } = this.props;
    const { id } = match.params;

    const {
      timeAdjustmentVisible, // 时间调整
      operatorRecordVisible,
      attachmentVisible = false,
      selectedRowKeys = [],
      collapseKeys,
      activeKey,
      isApprovalShow,
      attachmentUuid,
      attachmentInterUuid,
      storageSize,
      oprVisible,
      modalType,
      approveType,
      otherInfoSelectedRowKeys,
      otherInfoASelectedRowKeys,
    } = this.state;
    const {
      remote:remoteProps,
      tenantId,
      loading,
      dispatch,
      audit8D: {
        basicInfo = {},
        sourceInfolist = [],
        correlationList = [],
        purchaseOrderList = [],
        siteInvestigateReportList = [],
        relatioPagination,
        siteEvalReportList = [],
        siteEvalReportPage = {},
      },
      create8D: { quoteTrxList, evalDataSource = [] },
      evalLoading,
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
      fetchOrderLoading,
      location: { pathname },
      customizeForm,
      customizeTable,
      customizeTabPane,
      custLoading,
      customizeCollapse,
      customizeBtnGroup,
      history,
    } = this.props;
    const { audit8DProvide = {} } = promiseMaintainProvide;
    const { audit8DFollowUp = {} } = followUpProduce;
    const { audit8DReason = {} } = rootReasonAnalyze;
    const { audit8DSolution = {} } = foreverDealSolution;
    const { audit8DSuit = {} } = isSuitUnderItem;
    const { audit8DStandard = {} } = relateStandard;
    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = audit8DProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = audit8DFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = audit8DReason;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = audit8DSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = audit8DStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = audit8DSuit;

    const { edProblemAction = {}, edProblemTeamList = [], ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const readOnly = remoteProps?remoteProps.process("SQAM_AUDIT8D_DETAIL_READONLY_PANEL_READONLY",true,{basicInfo}):true;
    // 埋点增加的额外属性
    const remoteExtraProps = remoteProps?remoteProps.process("SQAM_AUDIT8D_DETAIL_EXTRA_PROPS",{},{_this:this}):{};
    const basicInfoProps = {
      basicInfo: basic,
      loading: loading.detail,
      onRef: this.handleBindJRef,
      code: 'SQAM.AUDIT_8D_DETAIL.BASIC',
      customizeForm,
    };
    const groupMemberProps = {
      code: 'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
      customizeTable,
      custLoading,
      selectedRowKeys,
      basicInfo: basic,
      groupMember: edProblemTeamList,
      onChangeFlag: (e) => e,
      onAdd: (e) => e,
      match,
    };
    const continueSupplyProps = {
      remote:remoteProps,
      readOnly,
      required: false,
      loading: promiseMaintainProvideLoading,
      edProblemHeaderId: id,
      pagination: promiseMaintainProvidePagination,
      dataSource: promiseMaintainProvideList,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
      custLoading,
      stateKey: 'audit8DProvide',
      ...remoteExtraProps.audit8DProvide,
    };

    const OtherInfoProps = {
      remote:remoteProps,
      readOnly: false,
      required: false,
      loading: loading.detail,
      pagination: basicInfo.otherInfoPagination,
      dataSource: basicInfo.lineList,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
      custLoading,
      detailInfo: basicInfo,
      namespaceKey: 'audit8D',
      onRemove: this.handleOtherInfoDelete,
      onSelectRow: this.handleCommonRowSelection,
      deleteLoading: loading.otherInfoDeleteLoading,
      selectedRowKeys: otherInfoSelectedRowKeys,
      problemHeaderId: basicInfo.problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.AUDIT_8D_DETAIL.OTHER_BTNS',
    };
    const OtherInfoAProps = {
      remote:remoteProps,
      readOnly: false,
      required: false,
      loading: loading.detail,
      pagination: basicInfo.otherInfoAPagination,
      dataSource: basicInfo.otherDetailList,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.OTHERINFO_A',
      custLoading,
      detailInfo: basicInfo,
      namespaceKey: 'feedback8D',
      onSelectRow: this.handleCommonRowSelection,
      selectedRowKeys: otherInfoASelectedRowKeys,
      problemHeaderId: basicInfo.problemHeaderId,
    };

    const followUpProduceProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
      customizeTable,
      custLoading,
      loading: followUpProduceLoading,
      readOnly,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      stateKey: 'audit8DFollowUp',
      ...remoteExtraProps.audit8DFollowUp,
    };
    const rootAnalyzeProps = {
      remote:remoteProps,
      loading: rootAnalyzeLoading,
      edProblemHeaderId: id,
      readOnly,
      required: false,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'audit8DReason',
      ...remoteExtraProps.audit8DReason,
    };
    const remedialActionProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
      customizeTable,
      custLoading,
      loading: foreverSolutionLoading,
      readOnly,
      required: false,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      stateKey: 'audit8DSolution',
      ...remoteExtraProps.audit8DSolution,
    };
    const standardizingProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
      customizeTable,
      custLoading,
      loading: standardizingLoading,
      readOnly,
      required: false,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      stateKey: 'audit8DStandard',
      ...remoteExtraProps.audit8DStandard,
    };
    const questionProps = {
      problemDesc: basicInfo,
      onRef: this.handleBindJRef,
      customizeForm,
      code: 'SQAM.AUDIT_8D_DETAIL.PROBLEM',
      noMeanFlag: true,
    };
    const isSuitUnderItemProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
      customizeTable,
      custLoading,
      loading: isSuitUnderItemLoading,
      readOnly,
      required: false,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      stateKey: 'audit8DSuit',
      ...remoteExtraProps.audit8DSuit,
    };
    const congratulationProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
      customizeForm,
      custLoading,
      congratulations: edProblemInfo,
      onRef: this.handleBindJRef,
    };
    const attachmentProps = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      purchaserDirectory: 'sqam-ed-att',
      supplerDirectory: 'sqam-ed-supplieratt',
      interPurchaseDirectory: 'sqam-ed-inter-att',
      supplierAttachmentUuid: basicInfo.supplierAttachmentUuid,
      showSupplier: true,
      supplierReadOnly: true,
      loading: loading.attachment,
      visible: attachmentVisible,
      attachmentUuid: basicInfo.attachmentUuid ? basicInfo.attachmentUuid : attachmentUuid,
      attachmentInterUuid: basicInfo.attachmentInterUuid
        ? basicInfo.attachmentInterUuid
        : attachmentInterUuid,
      onCancel: this.handleAttachmentModalHidden,
      storageSize,
    };
    // const auditStageProps = {
    //   onRef: this.handleBindRef,
    //   basicInfo: basic,
    //   onClickOpen: this.handleAttachmentOption,
    //   interAttachmentSize,
    //   code: 'SQAM.AUDIT_8D_DETAIL.APPROVE_STAGE',
    //   customizeForm,
    // };
    const sourceInfoProps = {
      tenantId,
      dispatch,
      prefixToPath: '/audit8D',
      backPath: pathname,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.INSPECT',
    };
    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      code: 'SQAM.AUDIT_8D_DETAIL.TRX',
      customizeTable,
    };
    const correlationProps = {
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      customCode: 'SQAM.AUDIT_8D_DETAIL.CORRELATION_8D_LIST',
      customizeTable,
      fetchCorrelation: this.fetchCorrelation,
      pagination: relatioPagination,
    };
    const purchaseOrderProps = {
      loading: fetchOrderLoading,
      dataSource: purchaseOrderList,
      backPath: pathname,
      prefixToPath: '/audit8D',
      history,
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
    const siteInvestigateReport = {
      dispatch,
      dataSource: siteInvestigateReportList,
      backPath: pathname,
      prefixToPath: '/audit8D',
    };
    const siteEvalReport = {
      dispatch,
      dataSource: siteEvalReportList,
      dataPage: siteEvalReportPage,
      backPath: pathname,
      prefixToPath: '/audit8D',
      onSearch: this.siteEvalReportHeader,
    };
    const listProps = {
      // customizeTable,
      // custLoading,
      evalLoading,
      // evalPagination,
      evalDataSource,
      history,
      // onChange: (page) => this.handleEvaluationSearch(page),
    };
    /**
     * 时间
     */
    const timeAdjustmentProps = {
      loading: fetchOrderLoading,
      basicInfo: basic,
      timeAdjustmentVisible,
      onClose: this.handleCloseAppeal,
      onOk: this.handleOkData,
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

    const approveLoading =
      approveType === 'continue'
        ? loading.continue
        : approveType === 'completed'
        ? loading.completed
        : loading.reject;

    const commonProps = {
      modalType,
      visible: oprVisible,
      customizeForm,
      onHideDrawer: this.handleOpr,
      onConfirm: this.confirmOpr,
      oprLoading: modalType === 'cancel' ? loading.abandon : approveLoading,
      approveType,
    };
    return (
      <React.Fragment>
        <div className={styles['sqam-qualityRectification-audit-header']}>
          <Header
            title={intl
              .get(`${prefix1}.qualityRectification.audit.update`)
              .d('质量整改报告审核维护')}
            backPath="/sqam/audit8D/list"
          >
            {customizeBtnGroup(
              { code: 'SQAM.AUDIT_8D_DETAIL.HEADER_BTNS', pro: true },
              <DynamicButtons buttons={this.headerBtnsRender()} />
            )}
          </Header>
        </div>
        <div className="sqam-detail-content" id="sqam-audit8dnotPub-detail-content-inner-wrapper">
          <Content className={classNames(styles['page-content'])}>
            <Spin spinning={loading.detail} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {customizeCollapse(
                {
                  code: 'SQAM.AUDIT_8D_DETAIL.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  {/* <Collapse.Panel
                    id="sqam-audit8dnotPub-panel-auditStage"
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.auditStage`).d('审核阶段')}</h3>
                        <a>
                          {collapseKeys.includes('a')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('a') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="a"
                  >
                    <AuditStagePanel {...auditStageProps} />
                  </Collapse.Panel> */}
                  <Collapse.Panel
                    id="sqam-audit8dnotPub-panel-basic"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.basic`).d('基本信息')}</h3>
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
                        { code: 'SQAM.AUDIT_8D_DETAIL.BASIC_TABS' },
                        <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
                          <TabPane
                            tab={
                              <span style={{ color: '#4c4c4c' }}>
                                {intl.get(`${prefix1}.tab.basicInfo`).d('基础信息')}
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
                    id="sqam-audit8dnotPub-panel-question"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.question`).d('问题描述')}</h3>
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
                    id="sqam-audit8dnotPub-panel-groupMember"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.groupMember`).d('小组成员')}</h3>
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
                    id="sqam-audit8dnotPub-panel-promiseMaintainProvide"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get(`${prefix1}.panel.promiseMaintainProvide`)
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
                    id="sqam-audit8dnotPub-panel-shortMeature"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.shortMeature`).d('短期措施')}</h3>
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
                    id="sqam-audit8dnotPub-panel-analyzeReason"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.analyzeReason`).d('根本原因分析')}</h3>
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
                    id="sqam-audit8dnotPub-panel-foreverDealSolution"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>
                          {intl.get(`${prefix1}.panel.foreverDealSolution`).d('永久纠正措施')}
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
                  <Collapse.Panel
                    id="sqam-audit8dnotPub-panel-applyItem"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.applyItem`).d('是否适用以下项目')}</h3>
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
                    id="sqam-audit8dnotPub-panel-standard"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.standard`).d('相关标准化')}</h3>
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
                    id="sqam-audit8dnotPub-panel-congratulation"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.congratulation`).d('小组祝贺')}</h3>
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
                    id="sqam-audit8dnotPub-panel-otherInfo"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix1}.panel.otherInfo`).d('其他信息')}</h3>
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
                    id="sqam-audit8d-panel-otherInfo-A"
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
                    id="sqam-audit8dnotPub-panel-custom"
                    showArrow={false}
                    forceRender
                    key="customeA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM"
                      onRef={this.handleBindJRef}
                      refField="customA"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-audit8dnotPub-panel-custom-b"
                    showArrow={false}
                    forceRender
                    key="customeB"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B"
                      onRef={this.handleBindJRef}
                      refField="customeB"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-audit8dnotPub-panel-custom-c"
                    showArrow={false}
                    forceRender
                    key="customC"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C"
                      onRef={this.handleBindJRef}
                      refField="customC"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_AUDIT8D_DETAIL_CUX_EXTRA_NODE",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            <FixedAnchor
              linkList={this.getCodeFileds()}
              className="sqam-audit8dnotPub-detail-content-inner-wrapper"
              code="SQAM.AUDIT_8D_DETAIL.COLLAPSE"
              customizeCollapse={customizeCollapse}
            />
          </Content>
        </div>
        {<TimeAdjustmentModal {...timeAdjustmentProps} />}
        {operatorRecordVisible && <OperatorRecord {...operatorRecordProps} />}
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
        {oprVisible && <CommonDrawer {...commonProps} />}
      </React.Fragment>
    );
  }
}
