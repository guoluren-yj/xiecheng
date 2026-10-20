/**
 * 8D ICA/PCA -反馈明细
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Modal, Icon, Tabs } from 'hzero-ui';
import classNames from 'classnames';
import uuidv4 from 'uuid/v4';
import queryString from 'querystring';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined, throttle, omit } from 'lodash';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
  getResponse,
} from 'utils/utils';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import intl from 'utils/intl';
import notification from 'utils/notification';
import remote from 'hzero-front/lib/utils/remote';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import DynamicButtons from '_components/DynamicButtons';

import { queryApprovalMethod } from '@/services/create8DService';
import CustomForm from '@/routes/components/CustomForm';
import { getFileNumByUUID } from '@/utils/utils';
import QuestionPanel from '../../components/QuestionPanel';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import GroupMemberPanel from '../../components/GroupMemberPanel';
import CongratulationPanel from '../../components/CongratulationPanel';
import OperatorRecord from '../../components/QualityRectificationRecord';
import TimeAdjustmentModal from '../../components/TimeAdjustmentModal';
import PurchaseOrderPanel from '../../components/PurchaseOrderPanel';
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
import TrxQuoteList from '../../components/TrxQuoteList';
import SiteInvestigate from '../../components/SiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';
import CommonDrawer from '../components/CommonDrawer';

const prefix2 = `sqam.common.view.message.title`;
const { TabPane } = Tabs;
const prefix3 = 'audit8d';

@remote(
  {
    code: 'SQAM_PUB_AUDIT8D_DETAIL',
    name: 'remote',
  },
  {
    events: {
      handleSaveDataCux: ({ onSave, payload }) => onSave(payload),
    },
  }
)
@withCustomize({
  unitCode: [
    'SQAM.AUDIT_8D_DETAIL.BASIC',
    'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
    'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
    'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
    'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
    'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
    'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
    'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
    'SQAM.AUDIT_8D_DETAIL.COLLAPSE',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
    'SQAM.AUDIT_8D_DETAIL.MODAL_CANCEL',
    'SQAM.AUDIT_8D_DETAIL.INSPECT',
    'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
    'SQAM.AUDIT_8D_DETAIL.PROBLEM',
    'SQAM.AUDIT_8D_DETAIL.TRX',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B',
    'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C',
    'SQAM.AUDIT_8D_DETAIL.CORRELATION_8D_LIST',
    'SQAM.AUDIT_8D_DETAIL.OTHER_BTNS',
    'SQAM.AUDIT_8D_DETAIL.BASIC_TABS',
    'SQAM.AUDIT_8D_DETAIL.OTHERINFO_A',
    'SQAM.AUDIT_8D_DETAIL.PUB_HEADER_BTNS',
  ],
})
@connect(
  ({
    audit8D,
    feedback8D,
    loading,
    groupMemberPanel,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
    create8D,
  }) => ({
    create8D,
    audit8D,
    feedback8D,
    groupMemberPanel,
    rootReasonAnalyze,
    followUpProduce,
    foreverDealSolution,
    promiseMaintainProvide,
    relateStandard,
    isSuitUnderItem,
    evalLoading: loading.effects['create8D/fetchList'],
    deleteMemberLoading: loading.effects['feedback8D/removeGroupMem'],
    loading: {
      detail: loading.effects['feedback8D/fetch8DBasicInfo'],
      approval: loading.effects['feedback8D/fetchApprovalOpinion'],
      version: loading.effects['feedback8D/fetchHistoryVersion'],
      save: loading.effects['audit8D/save8D'],
      release: loading.effects['feedback8D/submit8D'],
      attachment: loading.effects['feedback8D/fetchAttachment'],
      deletedMembers: loading.effects['feedback8D/removeGroupMem'],
      abandon: loading.effects['audit8D/abandon'],

      promiseMaintainProviderDeleteLoading: loading.effects['promiseMaintainProvide/deleteData'],
      promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
      followUpProduceDeleteLoading: loading.effects['followUpProduce/deleteData'],
      followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
      rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
      rootAnalyzeDeleteLoading: loading.effects['rootReasonAnalyze/deleteData'],
      foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
      foreverSolutionDeleteLoading: loading.effects['foreverDealSolution/deleteData'],
      isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
      isSuitUnderItemDeleteLoading: loading.effects['isSuitUnderItem/deleteData'],
      standardizingLoading: loading.effects['standardizing/fetchData'],
      standardizingDeleteLoading: loading.effects['standardizing/deleteData'],
      fetchSourceInfoLoading: loading.effects['feedback8D/fetchSourceInfoLoading'],
      fetchCorrelationLoading: loading.effects['feedback8D/relation8D'],
      fetchOrderLoading: loading.effects['feedback8D/fetchPurchaseOrder'],
      dateTimeLoading: loading.effects['audit8D/updateTime'],
      otherInfoDeleteLoading: loading.effects['feedback8D/delDproblemheaderdetaillines'],
    },
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
    'entity.attachment',
    'entity.roles',
    'sslm.evaluationQuery',
    'entity.business',
  ],
})
export default class Detail extends PureComponent {
  form = {
    j: {},
    c: {}, //  小组祝贺
    customeA: {},
    customeB: {},
    customC: {},
  };

  codeFields = [];

  constructor(props) {
    super(props);
    // const {z
    //   location: { state: { _back } = {} },
    // } = props;
    this.state = {
      timeAdjustmentVisible: false, // 时间调整Visible
      operatorRecordVisible: false,
      attachmentVisible: false,
      selectedRowKeys: [],
      selectedRowsMember: [],
      attachmentUUID: uuidv4(), // 打开模态框新建的uuid
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
        'customeA',
        'customeB',
        'customC',
        'otherA',
      ],

      continueSupplySelectedRowKeys: [], // 保证持续供货
      continueSupplySelectedRows: [],
      followUpSelectedRowKeys: [],
      followUpSelectedRows: [],
      rootReasonSelectedRowKeys: [],
      rootReasonSelectedRows: [],

      foreverSolutionSelectedRowKeys: [],
      foreverSolutionSelectedRows: [],

      relateStandardSelectedRowKeys: [],
      relateStandardSelectedRows: [],

      isSuitUnderItemSelectedRowKeys: [],
      isSuitUnderItemSelectedRows: [],
      otherInfoSelectedRowKeys: [], // 其他信息
      otherInfoSelectedRows: [],
      otherInfoASelectedRowKeys: [], // 其他信息
      otherInfoASelectedRows: [],

      LeaderLineId: undefined,
      isPcaFeedbacking: undefined,
      backPath: {
        audit8D: '/sqam/audit8D/list',
        default: '/sqam/feedback8D/list',
      },
      activeKey: 'basicInfo',
      isApprovalShow: false,
      oprVisible: false, // 取消整改弹出框
      evalHeaderIds: [],
      fileNum: 0,
    };
  }

  componentDidMount() {
    const { dispatch, remote: remoteProps } = this.props;
    this.handleSearch();
    this.queryValueCode();
    this.fetchSettingValue();
    const { queryUnitConfig } = this.props;
    queryUnitConfig({}, (res) => {
      if (!getResponse(res)) return;
      const _newFields = [
        // {
        //   code: 'a',
        //   key: `sqam-${prefix3}-panel-auditStage`,
        //   title: intl.get(`${prefix1}.panel.auditStage`).d('审核阶段'),
        // },
        {
          code: 'b',
          key: `sqam-${prefix3}-panel-basic`,
          title: intl.get(`${prefix2}.panel.basic`).d('基本信息'),
        },
        {
          code: 'c',
          key: `sqam-${prefix3}-panel-question`,
          title: intl.get(`${prefix2}.panel.question`).d('问题描述'),
        },
        {
          code: 'd',
          key: `sqam-${prefix3}-panel-groupMember`,
          title: intl.get(`${prefix2}.panel.groupMember`).d('小组成员'),
        },
        {
          code: 'e',
          key: `sqam-${prefix3}-panel-promiseMaintainProvide`,
          title: intl.get(`${prefix2}.panel.promiseMaintainProvide`).d('临时围堵措施—保证持续供货'),
        },
        {
          code: 'f',
          key: `sqam-${prefix3}-panel-shortMeature`,
          title: intl.get(`${prefix2}.panel.shortMeature`).d('短期措施'),
        },
        {
          code: 'g',
          key: `sqam-${prefix3}-panel-analyzeReason`,
          title: intl.get(`${prefix2}.panel.analyzeReason`).d('根本原因分析'),
        },
        {
          code: 'h',
          key: `sqam-${prefix3}-panel-foreverDealSolution`,
          title: intl.get(`${prefix2}.panel.foreverDealSolution`).d('永久纠正措施'),
        },
        {
          code: 'i',
          key: `sqam-${prefix3}-panel-standard`,
          title: intl.get(`${prefix2}.panel.standard`).d('相关标准化'),
        },
        {
          code: 'j',
          key: `sqam-${prefix3}-panel-congratulation`,
          title: intl.get(`${prefix2}.panel.congratulation`).d('小组祝贺'),
        },
        {
          code: 'k',
          key: `sqam-${prefix3}-panel-applyItem`,
          title: intl.get(`${prefix2}.panel.applyItem`).d('是否适用以下项目'),
        },
        {
          code: 'm',
          key: `sqam-${prefix3}-panel-otherInfo`,
          title: intl.get(`${prefix2}.panel.otherInfo`).d('其他信息'),
        },
        {
          code: 'customeA',
          key: `sqam-${prefix3}-panel-custom`,
          title: intl.get(`${prefix2}.panel.basic`).d('基本信息'),
        },
        {
          code: 'customeB',
          key: `sqam-${prefix3}-panel-custom-b`,
          title: intl.get(`${prefix2}.panel.basic`).d('基本信息'),
        },
        {
          code: 'customC',
          key: `sqam-${prefix3}-panel-custom-c`,
          title: intl.get(`${prefix2}.panel.basic`).d('基本信息'),
        },
        {
          code: 'otherA',
          key: `sqam-${prefix3}-panel-otherInfo-A`,
          title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
        },
      ];
      let newFields = remoteProps
        ? remoteProps.process('SQAM.PUB_AUDIT_8D_DETAIL.COLLAPSE_FIELDS', _newFields)
        : _newFields;
      const unitConfig = res['SQAM.AUDIT_8D_DETAIL.COLLAPSE'];
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
    dispatch({ type: 'feedback8D/fetchLov' });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {},
        approvalList: [],
        historyVersion: [],
        correlationList: [],
        sourceInfolist: [],
        purchaseOrderList: [],
      },
    });
  }

  // 查询配置中心接口替换成业务规则定义是否开启无需审批
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

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'groupMemberPanel/queryValueCode',
      payload: {
        participateNode: 'SQAM.FEEDBACK_JOIN_POINT', // 参与节点
        camp: 'SQAM.EDPROBLEM.CAMP', // 代表方
        idd: 'HPFM.IDD',
      },
    });
  }

  // 查询关联8D
  @Bind()
  fetchCorrelation(page = {}) {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'feedback8D/relation8D',
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
      type: 'feedback8D/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    });
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
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}, key = '') {
    this.form[key] = (ref.props || {}).form;
  }

  /**
   * 变更编辑状态
   * @param {Object} record 操作对象
   * @param {Boolean} flag 可编辑标记
   */
  @Bind()
  handleChangeEditable(record, flag) {
    const { dispatch, feedback8D } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = feedback8D;
    const newList = edProblemTeamList.map((item) =>
      item.problemTeamId === record.problemTeamId
        ? { ...item, _status: flag ? 'update' : '' }
        : item
    );
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {
          ...feedback8D.basicInfo,
          edProblemTeamList: [...newList],
        },
      },
    });
  }

  /**
   * 新增
   * 小组成员数据列表新增行数据
   */
  @Bind()
  handleAddMem() {
    const { dispatch, tenantId, feedback8D, remote: remoteProps } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = feedback8D;
    const addFieldRemote = remoteProps
      ? remoteProps.process(
          'SQAM_PUB_AUDIT8D_DETAIL_CUX_ADD_TEAM_MEMBER',
          {},
          {
            state: this.state,
          }
        )
      : {};
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {
          ...feedback8D.basicInfo,
          edProblemTeamList: [
            {
              problemTeamId: uuidv4(),
              tenantId,
              memberName: undefined,
              memberResp: undefined,
              memberRole: undefined,
              phone: undefined,
              email: undefined,
              remark: undefined,
              leaderFlag: 0, // 默认值
              visibleFlag: 0,
              _status: 'create', // 新建标记位
              ...addFieldRemote,
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
    const { dispatch, feedback8D, tenantId } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = feedback8D;
    const { selectedRowKeys } = this.state;
    // // 未删除的成员列表
    // const newMem = [];
    // edProblemTeamList.forEach(i => {
    //   if (selectedRowKeys.includes(i.problemTeamId) && i._status !== 'create') {
    //     newMem.push({ ...i, deleteFlag: 1 }); // 重置更新状态的成员的deleteFlag
    //   } else if (!selectedRowKeys.includes(i.problemTeamId)) {
    //     newMem.push({ ...i });
    //   }
    // });
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
        dispatch({
          type: 'feedback8D/removeGroupMem',
          payload: {
            tenantId,
            members: deleteMem,
            optcamp: 'PURCHASER',
          },
        }).then((res) => {
          if (res) {
            notification.success();
            dispatch({
              type: 'feedback8D/updateState',
              payload: {
                basicInfo: {
                  ...feedback8D.basicInfo,
                  edProblemTeamList: [...newMem],
                },
              },
            });
            this.setState({ selectedRowKeys: [] });
          }
        });
      },
    });

    // dispatch({
    //   type: 'feedback8D/updateState',
    //   payload: {
    //     basicInfo: {
    //       ...feedback8D.basicInfo,
    //       edProblemTeamList: [...newMem],
    //     },
    //   },
    // });
    // this.setState({ selectedRowKeys: [] });
  }

  /**
   *
   * @param {array<String>} selectedRowKeys - 小组成员选中行Row
   */
  @Bind()
  handleSelectMem(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRowsMember: selectedRows });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    const customizeUnitCodes = [
      'SQAM.AUDIT_8D_DETAIL.BASIC',
      'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
      'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
      'SQAM.AUDIT_8D_DETAIL.PROBLEM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO_A',
    ];
    dispatch({
      type: 'feedback8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCodes,
        menuEntryPoint: 'CUSTOMER_APPROVE_INITIATED',
      },
    }).then(() => {
      const {
        feedback8D: {
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
      this.setState({
        isPcaFeedbacking: problemStatus === 'PCA_FEEDBACKING' || problemStatus === 'PCA_REJECTED',
      });
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

  @Bind()
  fetchSourceInfo() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'feedback8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.INSPECT',
      },
    });
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
  handleGroupMemberData() {
    const {
      feedback8D: { basicInfo = {} },
    } = this.props;
    const { edProblemTeamList = [] } = basicInfo;
    const activeMem = edProblemTeamList.filter((i) => i.deleteFlag !== 1);
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
        const deleteMem = edProblemTeamList.filter((i) => i.deleteFlag === 1);
        const allGroupMembers = [...params, ...memList].map((rec) => {
          const { _status, ...info } = rec;
          return info;
        });
        return [...allGroupMembers, ...deleteMem];
      }
    }
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

  @Bind()
  cuxSendDataToAfterEnd(opt, newData) {
    const { remote: remoteProps } = this.props;
    const onSave = () => this.sendDataToAfterEnd(opt, newData);
    if (remoteProps?.event) {
      return remoteProps.event.fireEvent('handleSaveDataCux', {
        onSave,
        that: this,
      });
    }
    return onSave();
  }

  @Bind()
  sendDataToAfterEnd(opt, newData) {
    const {
      dispatch,
      tenantId,
      match,
      feedback8D: { basicInfo = {} },
      // form={},
    } = this.props;
    const { id } = match.params;
    const customizeUnitCodes = [
      'SQAM.AUDIT_8D_DETAIL.BASIC',
      'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
      'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
      'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
      'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
      'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
      'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
      'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
      'SQAM.AUDIT_8D_DETAIL.PROBLEM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO_A',
    ];
    dispatch({
      type: 'audit8D/save8D',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCodes,
        data: {
          ...basicInfo,
          ...newData,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearch();
        this.handleContinueSupplySearch();
      }
    });
  }

  @Bind()
  sendDataToAfterEndCancel(newData, oprForm) {
    const {
      dispatch,
      tenantId,
      match,
      feedback8D: { basicInfo = {} },
      // form={},
    } = this.props;
    const { id } = match.params;
    const customizeUnitCodes = [
      'SQAM.AUDIT_8D_DETAIL.BASIC',
      'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
      'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
      'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
      'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
      'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
      'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
      'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO',
      'SQAM.AUDIT_8D_DETAIL.PROBLEM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B',
      'SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C',
      'SQAM.AUDIT_8D_DETAIL.OTHERINFO_As',
    ];
    dispatch({
      type: 'audit8D/abandon',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCodes,
        data: {
          ...basicInfo,
          ...newData,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleOpr(false, oprForm);
        // this.handleSearch();
        // this.handleContinueSupplySearch();
        dispatch(
          routerRedux.push({
            pathname: `/sqam/audit8D/list`,
          })
        );
      }
    });
  }

  @Bind()
  checkGroupLeaderUnique() {
    const {
      feedback8D: { basicInfo = {} },
    } = this.props;
    const { edProblemTeamList = [] } = basicInfo;
    const leaderCount = edProblemTeamList
      .filter((item) => item.deleteFlag !== 1)
      .filter((item) => item.leaderFlag === 1).length;
    if (leaderCount === 0) {
      notification.warning({
        message: intl
          .get(`sqam.common.view.message.leaderRepuiredInGroup`)
          .d('小组成员必须维护一名组长'),
      });
      return false;
    }
    return true;
  }

  /**
   * 取消8D
   */
  @Bind()
  handleAbandon() {
    this.handleOpr(true);
  }

  @Bind()
  edOperator(otherValues) {
    const {
      feedback8D: { basicInfo = {} },
      promiseMaintainProvide: {
        audit8DPubProvide: { promiseMaintainProvideList = [] },
      },
    } = this.props;
    const { edProblemAction = {}, edProblemTeamList, lineList, otherDetailList } = basicInfo;
    const icaType = ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus);
    const { oprForm, ...modalValues } = otherValues;
    if (icaType) {
      // 临时围堵措施—保证持续供货
      const newContinueDataSource = this.handleDataTypes(
        promiseMaintainProvideList,
        'filterNotDelete'
      );
      const editedContinueDataSource = this.handleDataTypes(newContinueDataSource, 'getEditedData');
      const editedEdProblemTeamList = this.handleDataTypes(edProblemTeamList, 'getEditedData');
      const newlineListSource = this.handleDataTypes(lineList, 'filterNotDelete');
      const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');
      const newlineListSourceA = this.handleDataTypes(otherDetailList, 'filterNotDelete');
      const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');
      Promise.all([
        this.validateEditTableDataSource(editedContinueDataSource, [], {
          force: true,
        }),
        this.validateEditTableDataSource(edProblemTeamList, [], {
          force: true,
        }),
        this.validateEditTableDataSource(editlineList, [], {
          force: true,
        }),
        this.validateEditTableDataSource(editlineListA, [], {
          force: true,
        }),
      ]).then(() => {
        // 临时围堵措施—保证持续供货
        let newPromiseMaintainProvideList = this.handleData(promiseMaintainProvideList);
        const newEdProblemTeamList = this.handleData(editedEdProblemTeamList);
        newPromiseMaintainProvideList = newPromiseMaintainProvideList.map((item) => {
          const suppliyEndDate =
            item.suppliyEndDate && moment(item.suppliyEndDate).format(DATETIME_MIN);
          const effectFlag = item.badQuantity === 0 ? 0 : 1;
          return {
            ...item,
            suppliyEndDate,
            effectFlag,
          };
        });
        const formC = this.form?.c?.getFieldsValue ? this.form.c.getFieldsValue() : {};
        const formJ = this.form?.j?.getFieldsValue ? this.form.j.getFieldsValue() : {};
        // 其他信息
        const finallylineList = this.handleData(lineList, 'otherInfoId');
        const finallylineListA = this.handleData(otherDetailList, 'otherDetailId');
        const AllNewData = {
          edProblemSupplyActionList: newPromiseMaintainProvideList,
          ...formC,
          edProblemAction: {
            ...edProblemAction,
            ...formJ,
          },
          edProblemTeamList: newEdProblemTeamList,
          ...modalValues,
          lineList: finallylineList,
          otherDetailList: finallylineListA,
        };
        let formCError;
        // eslint-disable-next-line
        this.form.c?.validateFieldsAndScroll &&
          this.form.c.validateFieldsAndScroll((err) => {
            if (err) formCError = true;
          });
        // eslint-disable-next-line
        this.form.j?.validateFieldsAndScroll &&
          this.form.j.validateFieldsAndScroll((err) => {
            if (err) formCError = true;
          });
        if (formCError) return;
        this.sendDataToAfterEndCancel(AllNewData, oprForm);
      });
    }
  }

  /**
   * 保存/提交
   */
  @Bind()
  async handleSave8D(opt) {
    const {
      feedback8D: { basicInfo = {} },
      promiseMaintainProvide: {
        audit8DPubProvide: { promiseMaintainProvideList = [] },
      },
    } = this.props;
    const { edProblemAction = {}, edProblemTeamList, lineList, otherDetailList } = basicInfo;
    const icaType = ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus);
    const content =
      opt === 'save'
        ? intl.get('sqam.common.view.message.confirm.saveRectification').d('是否保存整改报告')
        : intl.get('sqam.common.view.message.confirm.submitRectification').d('是否提交整改报告');

    if (icaType) {
      let formCError;
      // eslint-disable-next-line
      if (this.form?.customeA?.validateFieldsAndScroll) {
        await this.form.customeA.validateFieldsAndScroll((err) => {
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
      // 临时围堵措施—保证持续供货
      const newContinueDataSource = this.handleDataTypes(
        promiseMaintainProvideList,
        'filterNotDelete'
      );
      const editedContinueDataSource = this.handleDataTypes(newContinueDataSource, 'getEditedData');
      const editedEdProblemTeamList = this.handleDataTypes(edProblemTeamList, 'getEditedData');
      const newlineListSource = this.handleDataTypes(lineList, 'filterNotDelete');
      const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');
      const newlineListSourceA = this.handleDataTypes(otherDetailList, 'filterNotDelete');
      const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');
      Promise.all([
        this.validateEditTableDataSource(editedContinueDataSource, [], {
          force: true,
        }),
        this.validateEditTableDataSource(edProblemTeamList, [], {
          force: true,
        }),
        this.validateEditTableDataSource(editlineList, [], {
          force: true,
        }),
        this.validateEditTableDataSource(editlineListA, [], {
          force: true,
        }),
      ]).then(() => {
        // 临时围堵措施—保证持续供货
        let newPromiseMaintainProvideList = this.handleData(promiseMaintainProvideList);
        const newEdProblemTeamList = this.handleData(editedEdProblemTeamList);
        newPromiseMaintainProvideList = newPromiseMaintainProvideList.map((item) => {
          const suppliyEndDate =
            item.suppliyEndDate && moment(item.suppliyEndDate).format(DATETIME_MIN);
          const effectFlag = item.badQuantity === 0 ? 0 : 1;
          return {
            ...item,
            suppliyEndDate,
            effectFlag,
          };
        });
        const formC = this.form?.c?.getFieldsValue ? this.form.c?.getFieldsValue() : {};
        const formJ = this.form?.j?.getFieldsValue ? this.form.j?.getFieldsValue() : {};
        const formCustomA = this.form?.customeA?.getFieldsValue
          ? this.form.customeA?.getFieldsValue()
          : {};
        const formCustomB = this.form?.customeB?.getFieldsValue
          ? this.form.customeB?.getFieldsValue()
          : {};
        const formCustomC = this.form?.customC?.getFieldsValue
          ? this.form.customC?.getFieldsValue()
          : {};
        // 其他信息
        const finallylineList = this.handleData(lineList, 'otherInfoId');
        const finallylineListA = this.handleData(otherDetailList, 'otherDetailId');

        const AllNewData = {
          edProblemSupplyActionList: newPromiseMaintainProvideList,
          ...formC,
          ...formCustomA,
          ...formCustomB,
          ...formCustomC,
          edProblemAction: {
            ...edProblemAction,
            ...formJ,
          },
          edProblemTeamList: newEdProblemTeamList.map((item) => ({
            ...item,
            optcamp: 'PURCHASER',
          })),
          lineList: finallylineList,
          otherDetailList: finallylineListA,
        };
        // eslint-disable-next-line
        this.form.c?.validateFieldsAndScroll &&
          this.form.c.validateFieldsAndScroll((err) => {
            if (err) formCError = true;
          });
        // eslint-disable-next-line
        this.form.j?.validateFieldsAndScroll &&
          this.form.j.validateFieldsAndScroll((err) => {
            if (err) formCError = true;
          });
        if (formCError) return;
        Modal.confirm({
          content,
          iconType: '',
          onOk: () => this.cuxSendDataToAfterEnd(opt, AllNewData),
        });
      });
    }
  }

  /**
   * 获取已上传附件
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
      feedback8D: { basicInfo },
    } = this.props;
    const { attachmentUUID } = this.state;
    if (!basicInfo.supplierAttachmentUuid) {
      dispatch({
        type: 'feedback8D/saveUUID',
        payload: {
          tenantId,
          uuid: attachmentUUID,
          uuidType: 2, // 供应商附件标识
          problemHeaderId: basicInfo.problemHeaderId,
        },
      }).then((res) => {
        // 返回版本号
        if (res) {
          dispatch({
            type: 'feedback8D/updateState',
            payload: {
              basicInfo: {
                ...basicInfo,
                objectVersionNumber: res,
                supplierAttachmentUuid: attachmentUUID,
              },
            },
          });
        }
      });
    }
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
      feedback8D: {
        basicInfo: { problemHeaderId },
      },
    } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/feedback8D/history/${record.problemHeaderHisId}/${problemHeaderId}`,
      })
    );
  }

  /**
   * 队长变更
   * @param {obj} record - 小组成员
   * @param {boolean} flag - 组长标记
   */
  @Bind()
  handleLeaderChange(record, flag) {
    const {
      dispatch,
      feedback8D: { basicInfo },
    } = this.props;
    const { edProblemTeamList } = basicInfo;
    let newTeamList = [];
    if (flag) {
      record.$form.setFieldsValue({ visibleFlag: 0 });
      // 选中该成员为组长
      newTeamList = edProblemTeamList.map((i) =>
        i.problemTeamId === record.problemTeamId ? { ...i, leaderFlag: 1 } : { ...i, leaderFlag: 0 }
      );
      // 实时更新页面
      newTeamList
        .filter(
          (i) =>
            ['update', 'create'].includes(i._status) && i.problemTeamId !== record.problemTeamId
        )
        .forEach((i) => i.$form.setFieldsValue({ leaderFlag: 0 }));
    } else {
      // 该成员取消组长标记
      newTeamList = edProblemTeamList.map((i) => {
        if (i.problemTeamId === record.problemTeamId) {
          this.setState({ LeaderLineId: i.problemTeamId });
          return { ...i, leaderFlag: 0 };
        }
        return { ...i };
      });
    }
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {
          ...basicInfo,
          edProblemTeamList: newTeamList,
        },
      },
    });
  }

  // 保持持续供货-------------------------

  // 列表选择公共函数
  @Bind()
  handleCommonRowSelection(selectedRowKeys, selectedRows, container) {
    this.setState({
      [`${container}SelectedRowKeys`]: selectedRowKeys || [],
      [`${container}SelectedRows`]: selectedRows || [],
    });
  }

  /**
   * 保持持续供货
   */
  @Bind()
  handleContinueSupplyRowSelection(selectedRowKeys) {
    this.setState({ continueSupplySelectedRowKeys: selectedRowKeys });
  }

  @Bind()
  handleContinueSupplySearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'promiseMaintainProvide/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
        stateKey: 'audit8DPubProvide',
      },
    });
  }

  /**
   *保证持续-删除
   */
  @Bind()
  async handleContinueSupplyDelete() {
    const { continueSupplySelectedRowKeys, continueSupplySelectedRows } = this.state;
    const { promiseMaintainProvide = {} } = this.props;
    const { audit8DPubProvide = {} } = promiseMaintainProvide;
    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = audit8DPubProvide;

    const obj = {
      selectedRows: continueSupplySelectedRows,
      ModelDataSource: promiseMaintainProvideList,
      SelectedRowKeys: continueSupplySelectedRowKeys,
      SelectedRowKeysName: 'continueSupplySelectedRowKeys',
      dispatchTypeDelete: 'promiseMaintainProvide/deleteData',
      dispatchTypeUpdate: 'promiseMaintainProvide/updateState',
      ModelDataSourceName: 'promiseMaintainProvideList',
      Pagination: promiseMaintainProvidePagination,
      PaginationName: 'promiseMaintainProvidePagination',
      stateKey: 'audit8DPubProvide',
      rowsKey: 'continueSupply',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleContinueSupplySearch();
    }
  }

  // 其他信息删除
  @Bind()
  async handleOtherInfoDelete() {
    const { otherInfoSelectedRowKeys, otherInfoSelectedRows } = this.state;
    const {
      feedback8D: { basicInfo = {} },
    } = this.props;
    const { lineList, otherInfoPagination } = basicInfo;

    const obj = {
      selectedRows: otherInfoSelectedRows || [],
      ModelDataSource: lineList,
      SelectedRowKeys: otherInfoSelectedRowKeys || [],
      SelectedRowKeysName: 'otherInfoId',
      dispatchTypeDelete: 'feedback8D/delDproblemheaderdetaillines',
      dispatchTypeUpdate: 'feedback8D/updateState',
      ModelDataSourceName: 'lineList',
      Pagination: otherInfoPagination,
      PaginationName: 'otherInfoPagination',
      type: 'detail',
      detail: basicInfo,
      rowsKey: 'otherInfo',
      stateKey: 'basicInfo',
    };

    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleSearch();
      this.handleContinueSupplySearch();
    }
  }

  // ---------------保证持续供货

  @Bind()
  async handleDeleteCommonFn(obj = {}) {
    const {
      selectedRows,
      ModelDataSource,
      SelectedRowKeys,
      SelectedRowKeysName,
      dispatchTypeDelete,
      ModelDataSourceName,
      dispatchTypeUpdate,
      Pagination,
      PaginationName,
      stateKey,
      rowsKey,
      type,
      detail,
    } = obj;

    let result = {};
    const { dispatch } = this.props;
    const remoteDeleteData = selectedRows.filter((item) => item._status === 'update');
    let isNeedRefresh = false;
    if (remoteDeleteData.length > 0) {
      result = await dispatch({
        type: dispatchTypeDelete,
        payload: remoteDeleteData,
      });
      if (!result) return;
      isNeedRefresh = true;
    }
    const params = {
      [ModelDataSourceName]: ModelDataSource.filter(
        (item) =>
          !SelectedRowKeys.includes(type === 'detail' ? item.otherInfoId : item.edProblemTeamId)
      ),
      [PaginationName]: delItemsToPagination(
        selectedRows.length,
        ModelDataSource.length,
        Pagination
      ),
    };
    dispatch({
      type: dispatchTypeUpdate,
      payload:
        type === 'detail'
          ? { [stateKey]: { ...detail, ...params } }
          : stateKey
          ? { [stateKey]: params }
          : params,
    });
    this.setState({ [SelectedRowKeysName]: [] });
    if (rowsKey) {
      this.setState({
        [`${rowsKey}SelectedRows`]: [],
        [`${rowsKey}SelectedRowKeys`]: [],
      });
    }
    return isNeedRefresh;
  }

  @Bind()
  handleFollowUpSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'followUpProduce/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
        stateKey: 'audit8DPubFollowUp',
      },
    });
  }

  @Bind()
  async handleFollowUpDelete() {
    const { followUpSelectedRowKeys, followUpSelectedRows } = this.state;
    const { followUpProduce = {} } = this.props;
    const { audit8DPubFollowUp = {} } = followUpProduce;
    const { followUpProduceList = [], followUpProducePagination = {} } = audit8DPubFollowUp;
    const obj = {
      selectedRows: followUpSelectedRows,
      ModelDataSource: followUpProduceList,
      SelectedRowKeys: followUpSelectedRowKeys,
      SelectedRowKeysName: 'followUpSelectedRowKeys',
      dispatchTypeDelete: 'followUpProduce/deleteData',
      dispatchTypeUpdate: 'followUpProduce/updateState',
      ModelDataSourceName: 'followUpProduceList',
      Pagination: followUpProducePagination,
      PaginationName: 'followUpProducePagination',
      stateKey: 'audit8DPubFollowUp',
      rowsKey: 'followUp',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleFollowUpSearch();
    }
  }

  @Bind()
  handleRootReasonSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'rootReasonAnalyze/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
        stateKey: 'audit8DPubReason',
      },
    });
  }

  /**
   *根本原因-删除
   */
  @Bind()
  async handleRootReasonDelete() {
    const { rootReasonSelectedRowKeys, rootReasonSelectedRows } = this.state;
    const { rootReasonAnalyze = {} } = this.props;
    const { audit8DPubReason = {} } = rootReasonAnalyze;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = audit8DPubReason;

    const obj = {
      selectedRows: rootReasonSelectedRows,
      ModelDataSource: rootReasonAnalyzeList,
      SelectedRowKeys: rootReasonSelectedRowKeys,
      SelectedRowKeysName: 'rootReasonSelectedRowKeys',
      dispatchTypeDelete: 'rootReasonAnalyze/deleteData',
      dispatchTypeUpdate: 'rootReasonAnalyze/updateState',
      ModelDataSourceName: 'rootReasonAnalyzeList',
      Pagination: rootReasonAnalyzePagination,
      PaginationName: 'rootReasonAnalyzePagination',
      stateKey: 'audit8DPubReason',
      rowsKey: 'rootReason',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleRootReasonSearch();
    }
  }

  @Bind()
  handleForeverSolutionSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'foreverDealSolution/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
        stateKey: 'audit8DPubSolution',
      },
    });
  }

  @Bind()
  async handleForeverSolutionDelete() {
    const { foreverSolutionSelectedRowKeys, foreverSolutionSelectedRows } = this.state;
    const { foreverDealSolution = {} } = this.props;
    const { audit8DPubSolution = {} } = foreverDealSolution;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = audit8DPubSolution;

    const obj = {
      selectedRows: foreverSolutionSelectedRows,
      ModelDataSource: foreverDealSolutionList,
      SelectedRowKeys: foreverSolutionSelectedRowKeys,
      SelectedRowKeysName: 'foreverSolutionSelectedRowKeys',
      dispatchTypeDelete: 'foreverDealSolution/deleteData',
      dispatchTypeUpdate: 'foreverDealSolution/updateState',
      ModelDataSourceName: 'foreverDealSolutionList',
      Pagination: foreverDealSolutionPagination,
      PaginationName: 'foreverDealSolutionPagination',
      stateKey: 'audit8DPubSolution',
      rowsKey: 'foreverSolution',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleForeverSolutionSearch();
    }
  }

  @Bind()
  handleStandardSolutionSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'relateStandard/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
        stateKey: 'audit8DPubStandard',
      },
    });
  }

  @Bind()
  async handleStandardSolutionDelete() {
    const { relateStandardSelectedRowKeys, relateStandardSelectedRows } = this.state;
    const { relateStandard = {} } = this.props;
    const { audit8DPubStandard = {} } = relateStandard;
    const { relateStandardList = [], relateStandardPagination = {} } = audit8DPubStandard;

    const obj = {
      selectedRows: relateStandardSelectedRows,
      ModelDataSource: relateStandardList,
      SelectedRowKeys: relateStandardSelectedRowKeys,
      SelectedRowKeysName: 'relateStandardSelectedRowKeys',
      dispatchTypeDelete: 'relateStandard/deleteData',
      dispatchTypeUpdate: 'relateStandard/updateState',
      ModelDataSourceName: 'relateStandardList',
      Pagination: relateStandardPagination,
      PaginationName: 'relateStandardPagination',
      stateKey: 'audit8DPubStandard',
      rowsKey: 'relateStandard',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleStandardSolutionSearch();
    }
  }

  @Bind()
  handleIsSuitUnderItemSearch(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'isSuitUnderItem/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
        stateKey: 'audit8DPubSuit',
      },
    });
  }

  @Bind()
  async handleIsSuitUnderItemDelete() {
    const { isSuitUnderItemSelectedRowKeys, isSuitUnderItemSelectedRows } = this.state;
    const { isSuitUnderItem = {} } = this.props;
    const { audit8DPubSuit = {} } = isSuitUnderItem;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = audit8DPubSuit;

    const obj = {
      selectedRows: isSuitUnderItemSelectedRows,
      ModelDataSource: isSuitUnderItemList,
      SelectedRowKeys: isSuitUnderItemSelectedRowKeys,
      SelectedRowKeysName: 'isSuitUnderItemSelectedRowKeys',
      dispatchTypeDelete: 'isSuitUnderItem/deleteData',
      dispatchTypeUpdate: 'isSuitUnderItem/updateState',
      ModelDataSourceName: 'isSuitUnderItemList',
      Pagination: isSuitUnderItemPagination,
      PaginationName: 'isSuitUnderItemPagination',
      stateKey: 'audit8DPubSuit',
      rowsKey: 'isSuitUnderItem',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleIsSuitUnderItemSearch();
    }
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
      document.getElementById('sqam-audit8d-detail-content-inner-wrapper')
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
    const { feedback8D = {}, create8D, audit8D } = this.props;
    const { quoteTrxList = [], evalDataSource = [] } = create8D;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      relatioPagination,
      siteEvalReportPage,
    } = feedback8D;
    const { siteInvestigateReportList = [] } = audit8D;
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
        tab: intl.get(`${prefix2}.tab.supEvaluationFile`).d(`供应商考评档案`),
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
      },
    });
  }

  // 关闭取消整改弹出框
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
    oprForm.validateFields((err, values) => {
      if (!err) {
        const { cancelRemark } = values;
        // this.handleOpr(false, oprForm);
        this.edOperator({ cancelRemark, oprForm });
      }
    });
  }

  @Bind()
  headerBtnsRender() {
    const { feedback8D, loading } = this.props;
    const { basicInfo = {} } = feedback8D || {};
    const btnLoading =
      loading?.save || loading?.abandon || loading?.detail || loading?.dateTimeLoading;
    const { isPcaFeedbacking, isApprovalShow, fileNum } = this.state;

    const btns = [
      // 原逻辑 isPcaFeedbacking值是false
      !(isUndefined(isPcaFeedbacking) || isPcaFeedbacking) && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          onClick: throttle(() => this.handleSave8D('save'), 1500, { trailing: false }),
          loading: btnLoading,
        },
      },
      !['ICA_REJECTED'].includes(basicInfo.problemStatus) &&
        !(isUndefined(isPcaFeedbacking) || isPcaFeedbacking) && {
          name: 'cancel8D',
          child: intl.get('hzero.common.button.cancel-sqam').d('取消整改'),
          btnProps: {
            icon: 'close',
            type: '',
            onClick: throttle(() => this.handleAbandon('cancel'), 1500, { trailing: false }),
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
          disabled: !basicInfo.problemHeaderId,
        },
      },
      {
        name: 'attachmentUuid',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          onClick: throttle(() => this.handleAttachmentOption(), 1500, { trailing: false }),
          loading: btnLoading,
          disabled: !basicInfo.problemHeaderId,
        },
      },
      ['PUBLISHED', 'ICA_SUBMITTED', 'ICA_REJECTED', 'PCA_FEEDBACKING'].includes(
        basicInfo.problemStatus
      ) && {
        name: 'timeAdjustment',
        btnComp: PermissionButton,
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

  /**
   * render
   * @returns React.element
   */
  render() {
    const { match } = this.props;
    const { id } = match.params;

    const {
      location: { search },
    } = this.props;
    const { from, hide } = queryString.parse(search.substr(1));

    const {
      attachmentUUID,
      operatorRecordVisible,
      timeAdjustmentVisible, // 时间调整
      attachmentVisible = false,
      selectedRowKeys = [],
      selectedRowsMember = [],
      collapseKeys,

      continueSupplySelectedRowKeys,
      // promiseMaintainProvideList,
      followUpSelectedRowKeys,
      rootReasonSelectedRowKeys,
      foreverSolutionSelectedRowKeys,
      relateStandardSelectedRowKeys,
      isSuitUnderItemSelectedRowKeys,
      backPath = {},
      activeKey,
      isApprovalShow,
      oprVisible,
      otherInfoSelectedRowKeys,
      otherInfoASelectedRowKeys,
    } = this.state;

    const {
      remote:remoteProps,
      loading,
      feedback8D,
      tenantId,
      dispatch,
      groupMemberPanel = {},
      promiseMaintainProvide = {},
      followUpProduce = {},
      rootReasonAnalyze = {},
      foreverDealSolution = {},
      relateStandard = {},
      create8D: { quoteTrxList, evalDataSource = [] },
      isSuitUnderItem = {},
      location: { pathname },
      customizeForm,
      customizeTable,
      customizeTabPane,
      custLoading,
      customizeCollapse,
      audit8D,
      evalLoading,
      history,
      deleteMemberLoading,
      customizeBtnGroup,
      custConfig,
    } = this.props;
    const {
      promiseMaintainProviderDeleteLoading,
      promiseMaintainProvideLoading,
      followUpProduceLoading,
      followUpProduceDeleteLoading,
      standardizingLoading,
      standardizingDeleteLoading,
      isSuitUnderItemLoading,
      isSuitUnderItemDeleteLoading,
      foreverSolutionLoading,
      foreverSolutionDeleteLoading,
      rootAnalyzeLoading,
      rootAnalyzeDeleteLoading,
      fetchSourceInfoLoading,
      fetchCorrelationLoading,
      fetchOrderLoading,
      dateTimeLoading,
      otherInfoDeleteLoading,
    } = loading;
    const { code = {} } = groupMemberPanel;

    const { audit8DPubProvide = {} } = promiseMaintainProvide;
    const { audit8DPubFollowUp = {} } = followUpProduce;
    const { audit8DPubReason = {} } = rootReasonAnalyze;
    const { audit8DPubSolution = {} } = foreverDealSolution;
    const { audit8DPubSuit = {} } = isSuitUnderItem;
    const { audit8DPubStandard = {} } = relateStandard;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = audit8DPubProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = audit8DPubFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = audit8DPubReason;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = audit8DPubSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = audit8DPubStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = audit8DPubSuit;

    const { participateNode, camp, idd } = code;
    const {
      basicInfo = {},
      sourceInfolist = [],
      correlationList = [],
      purchaseOrderList = [],
      relatioPagination,
    } = feedback8D;
    const {
      siteInvestigateReportList = [],
      siteEvalReportList = [],
      siteEvalReportPage = {},
    } = audit8D;

    const { edProblemTeamList = [], edProblemAction = {}, ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const icaType = ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus);
    const title = icaType
      ? intl 
          .get(`sqam.common.view.message.title.qualityRectification.feedback.ICA`)
          .d('ICA反馈维护明细')
      : intl
          .get(`sqam.common.view.message.title.qualityRectification.feedback.PCA`)
          .d('PCA反馈维护明细');
    const basicInfoProps = {
      basicInfo: basic,
      loading: loading.deta,
      code: 'SQAM.AUDIT_8D_DETAIL.BASIC',
      customizeForm,
    };

    const groupMemberProps = {
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.GROUPMEMBER',
      custLoading,
      loading,
      camp,
      idd,
      participateNode,
      selectedRowKeys,
      selectedRowsMember,
      basicInfo: basic,
      readOnly: !icaType,
      required: icaType,
      isSuppiler: false,
      groupMember: edProblemTeamList,
      onAdd: this.handleAddMem,
      onRemove: this.handleDeleteMem,
      onSelectRow: this.handleSelectMem,
      onChangeFlag: this.handleChangeEditable,
      onChangeLeader: this.handleLeaderChange,
      deleteLoading: deleteMemberLoading,
      match,
    };

    const continueSupplyProps = {
      remote:remoteProps,
      tenantId,
      loading: promiseMaintainProvideLoading,
      deleteLoading: promiseMaintainProviderDeleteLoading,
      selectedRowKeys: continueSupplySelectedRowKeys,
      readOnly: !icaType,
      required: icaType,
      pagination: promiseMaintainProvidePagination,
      edProblemHeaderId: id,
      dataSource: promiseMaintainProvideList,
      onRemove: this.handleContinueSupplyDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.TEMPMEASURE',
      custLoading,
      stateKey: 'audit8DPubProvide',
    };
    const followUpProduceProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.SHORTMEASURES',
      customizeTable,
      custLoading,
      loading: followUpProduceLoading,
      deleteLoading: followUpProduceDeleteLoading,
      selectedRowKeys: followUpSelectedRowKeys,
      readOnly: !icaType || hide,
      required: icaType && !hide,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      onRemove: this.handleFollowUpDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'audit8DPubFollowUp',
    };
    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      code: 'SQAM.AUDIT_8D_DETAIL.TRX',
      customizeTable,
    };

    const rootAnalyzeProps = {
      remote:remoteProps,
      loading: rootAnalyzeLoading,
      deleteLoading: rootAnalyzeDeleteLoading,
      edProblemHeaderId: id,
      selectedRowKeys: rootReasonSelectedRowKeys,
      readOnly: !icaType || hide,
      required: icaType && !hide,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      onRemove: this.handleRootReasonDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.AUDIT_8D_DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'audit8DPubReason',
    };
    const remedialActionProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.PERMANENTACTION',
      customizeTable,
      custLoading,
      loading: foreverSolutionLoading,
      deleteLoading: foreverSolutionDeleteLoading,
      selectedRowKeys: foreverSolutionSelectedRowKeys,
      readOnly: !icaType || hide,
      required: icaType && !hide,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      onRemove: this.handleForeverSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'audit8DPubSolution',
    };
    const standardizingProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.STANDARDIZATION',
      customizeTable,
      custLoading,
      loading: standardizingLoading,
      deleteLoading: standardizingDeleteLoading,
      selectedRowKeys: relateStandardSelectedRowKeys,
      readOnly: !icaType || hide,
      required: icaType && !hide,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      onRemove: this.handleStandardSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'audit8DPubStandard',
    };
    const isSuitUnderItemProps = {
      remote:remoteProps,
      code: 'SQAM.AUDIT_8D_DETAIL.OTHERAPPLICABLE',
      customizeTable,
      custLoading,
      loading: isSuitUnderItemLoading,
      deleteLoading: isSuitUnderItemDeleteLoading,
      selectedRowKeys: isSuitUnderItemSelectedRowKeys,
      readOnly: !icaType || hide,
      required: icaType && !hide,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      onRemove: this.handleIsSuitUnderItemDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'audit8DPubSuit',
    };
    const congratulationProps = {
      code: 'SQAM.AUDIT_8D_DETAIL.TEAMCONGRATULATIONS',
      customizeForm,
      custLoading,
      readOnly: false,
      congratulations: edProblemInfo,
      onRef: this.handleBindRef,
    };
    const attachmentProps = {
      tenantId,
      loading: loading.attachment,
      visible: attachmentVisible,
      attachmentUUID: basicInfo.supplierAttachmentUuid
        ? basicInfo.supplierAttachmentUuid
        : attachmentUUID,
      supplierAttachmentUuid: basicInfo.supplierAttachmentUuid,
      attachmentInterUuid: basicInfo.attachmentInterUuid,
      attachmentUuid: basicInfo.attachmentUuid,
      supplierReadOnly: true,
      purchaseReadOnly: true,
      showSupplier: true,
      supplierBucketDirectory: 'sqam-ed-supplieratt', // 供应商附件bucketDirectory
      // purchaserBucket: 'sqam-ed-att',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      onCancel: this.handleAttachmentModalHidden,
    };

    const questionProps = {
      problemDesc: basicInfo,
      onRef: this.handleBindRef,
      customizeForm,
      code: 'SQAM.AUDIT_8D_DETAIL.PROBLEM',
      noMeanFlag: true,
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
      namespaceKey: 'feedback8D',
      onRemove: this.handleOtherInfoDelete,
      onSelectRow: this.handleCommonRowSelection,
      deleteLoading: otherInfoDeleteLoading,
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

    const correlationProps = {
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      customCode: 'SQAM.AUDIT_8D_DETAIL.CORRELATION_8D_LIST',
      customizeTable,
      fetchCorrelation: this.fetchCorrelation,
      pagination: relatioPagination,
    };
    const sourceInfoProps = {
      tenantId,
      dispatch,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      prefixToPath: '/audit8D',
      backPath: pathname,
      code: 'SQAM.AUDIT_8D_DETAIL.INSPECT',
      customizeTable,
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
    const btnLoading = loading?.save || loading?.abandon || loading?.detail || dateTimeLoading;

    const commonProps = {
      visible: oprVisible,
      customizeForm,
      onHideDrawer: this.handleOpr,
      onConfirm: this.confirmOpr,
      oprLoading: loading.abandon,
    };
    return (
      <React.Fragment>
        <Header title={title} backPath={backPath[from] || backPath.default}>
          {customizeBtnGroup(
            { code: 'SQAM.AUDIT_8D_DETAIL.PUB_HEADER_BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtnsRender()} />
          )}
        </Header>
        <div className="sqam-detail-content" id="sqam-audit8d-detail-content-inner-wrapper">
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
                  <Collapse.Panel
                    id="sqam-audit8d-panel-basic"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.basic`).d('基本信息')}</h3>
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
                                {intl.get(`${prefix2}.tab.basicInfo`).d('基础信息')}
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
                    id="sqam-audit8d-panel-question"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.question`).d('问题描述')}</h3>
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
                    {Object.keys(custConfig).length > 0 && !btnLoading && (
                      <QuestionPanel {...questionProps} />
                    )}
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-audit8d-panel-groupMember"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.groupMember`).d('小组成员')}</h3>
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
                    id="sqam-audit8d-panel-promiseMaintainProvide"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get(`${prefix2}.panel.promiseMaintainProvide`)
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
                    id="sqam-audit8d-panel-shortMeature"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.shortMeature`).d('短期措施')}</h3>
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
                    id="sqam-audit8d-panel-analyzeReason"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.analyzeReason`).d('根本原因分析')}</h3>
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
                    id="sqam-audit8d-panel-foreverDealSolution"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>
                          {intl.get(`${prefix2}.panel.foreverDealSolution`).d('永久纠正措施')}
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
                    id="sqam-audit8d-panel-applyItem"
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
                    id="sqam-audit8d-panel-standard"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.standard`).d('相关标准化')}</h3>
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
                    id="sqam-audit8d-panel-congratulation"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.congratulation`).d('小组祝贺')}</h3>
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
                    id="sqam-audit8d-panel-otherInfo"
                    showArrow={false}
                    forceRender
                    header={
                      <Fragment>
                        <h3>{intl.get(`${prefix2}.panel.otherInfo`).d('其他信息')}</h3>
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
                    id="sqam-audit8d-panel-custom"
                    forceRender
                    showArrow={false}
                    key="customeA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM"
                      onRef={this.handleBindRef}
                      refField="customeA"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-audit8d-panel-custom-b"
                    forceRender
                    showArrow={false}
                    key="customeB"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_B"
                      onRef={this.handleBindRef}
                      refField="customeB"
                    />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-audit8d-panel-custom-c"
                    forceRender
                    showArrow={false}
                    key="customC"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      basicInfo={basic}
                      code="SQAM.AUDIT_8D_DETAIL.CUSZ_FORM_C"
                      onRef={this.handleBindRef}
                      refField="customC"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_PUB_AUDIT8D_DETAIL_CUX_EXTRA_NODE",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            <FixedAnchor
              linkList={this.codeFields}
              className="sqam-audit8d-detail-content-inner-wrapper"
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
