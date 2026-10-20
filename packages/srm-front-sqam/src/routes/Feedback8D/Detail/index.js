/**
 * 8D ICA/PCA -反馈明细
 * @date: 2018-11-27 
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Modal, Icon, Tabs } from 'hzero-ui';
import Checkbox from 'components/Checkbox';
import classNames from 'classnames';
import uuidv4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { isEmpty, omit, throttle } from 'lodash';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import moment from 'moment';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getEditTableData,
  delItemsToPagination,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import remote from 'hzero-front/lib/utils/remote';
import CustomForm from '@/routes/components/CustomForm';
import { getFileNumByUUID } from '@/utils/utils';
import BasicInfoPanel from '../../components/BasicInfoPanel';
import QuestionPanel from '../../components/QuestionPanel';
import GroupMemberPanel from '../../components/GroupMemberPanel';
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
// import AuditStagePanel from './AuditStagePanel';
import TrxQuoteList from '../../components/TrxQuoteList';
import SupplierSiteInvestigate from '../../components/SupplierSiteInvestigate';
import EvaluationList from '../../components/EvaluationList';
import SiteEval from '../../components/SiteEval';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';

const prefix2 = `sqam.common.view.message.title`;
const prefix3 = `feedback8D`;
const { TabPane } = Tabs;

@remote(
  {
    code: 'SQAM_FEEDBACK8D_DETAIL_CUX',
    name: 'remote',
  },
  {
    events: {
      handleSaveDataCux: ({ onSave, payload }) => onSave(payload),
      handleDidMount: () => {},
    },
  }
)
@withCustomize({
  unitCode: [
    'SQAM.FEEDBACK_8D_DETAIL.BASIC',
    'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
    'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
    'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
    'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
    'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
    'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
    'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
    'SQAM.FEEDBACK_8D_DETAIL.COLLAPSE',
    'SQAM.FEEDBACK_8D_DETAIL.INSPECT',
    'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
    'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
    'SQAM.FEEDBACK_8D_DETAIL.TRX',
    'SQAM.FEEDBACK_8D_LIST.BTNS',
    'SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM',
    'SQAM.FEEDBACK_8D_DETAIL.CORRELATION_8D_LIST',
    'SQAM.FEEDBACK_8D_DETAIL.OTHER_BTNS',
    'SQAM.FEEDBACK_8D_DETAIL.BASIC_TABS',
    'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO_A',
    'SQAM.FEEDBACK_8D_DETAIL.OTHER_BTNS_A',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
  ],
})
@connect(
  ({
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
    feedback8D,
    groupMemberPanel,
    rootReasonAnalyze,
    followUpProduce,
    foreverDealSolution,
    promiseMaintainProvide,
    relateStandard,
    isSuitUnderItem,
    create8D,
    evalLoading: loading.effects['create8D/fetchList'],
    loading: {
      detail: loading.effects['feedback8D/fetch8DBasicInfo'],
      approval: loading.effects['feedback8D/fetchApprovalOpinion'],
      version: loading.effects['feedback8D/fetchHistoryVersion'],
      save: loading.effects['feedback8D/save8D'],
      release: loading.effects['feedback8D/submit8D'],
      attachment: loading.effects['feedback8D/fetchAttachment'],
      deletedMembers: loading.effects['feedback8D/removeGroupMem'],

      promiseMaintainProviderDeleteLoading: loading.effects['promiseMaintainProvide/deleteData'],
      promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
      followUpProduceDeleteLoading: loading.effects['followUpProduce/deleteData'],
      followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
      rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
      rootAnalyzeDeleteLoading: loading.effects['rootReasonAnalyze/deleteData'],
      foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
      foreverSolutionDeleteLoading: loading.effects['foreverSolution/deleteData'],
      isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
      isSuitUnderItemDeleteLoading: loading.effects['isSuitUnderItem/deleteData'],
      standardizingLoading: loading.effects['standardizing/fetchData'],
      standardizingDeleteLoading: loading.effects['standardizing/deleteData'],
      fetchSourceInfoLoading: loading.effects['feedback8D/fetchSourceInfoLoading'],
      fetchCorrelationLoading: loading.effects['feedback8D/relation8D'],
      fetchOrderLoading: loading.effects['feedback8D/fetchPurchaseOrder'],
      otherInfoADeleteLoading: loading.effects['feedback8D/delDproblemheaderdetaillinesA'],
    },
    tenantId: getCurrentOrganizationId(),
  })
)
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.feedback8D',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.attachment',
    'entity.roles',
    'entity.business',
    'sslm.evaluationQuery',
    'hzero.common',
  ],
})
export default class Detail extends PureComponent {
  form = {
    j: {}, //  小组祝贺
    c: {},
    customA: {},
  };

  codeFields = [];

  constructor(props) {
    super(props);
    // const {
    //   location: { state: { _back } = {} },
    // } = props;
    this.state = {
      operatorRecordVisible: false,
      attachmentVisible: false,
      selectedRowKeys: [],
      selectedRowsMember: [],
      attachmentUUID: uuidv4(), // 打开模态框新建的uuid
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
        'customA',
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
      otherInfoASelectedRowKeys: [], // 其他信息
      otherInfoASelectedRows: [],

      LeaderLineId: undefined,
      activeKey: 'basicInfo',
      storageSize: [],
      evalHeaderIds: [],
      fileNum: 0,
    };
  }

  componentDidMount() {
    const { dispatch, tenantId, match, remote: remoteProps } = this.props;
    const { id } = match.params;
    this.handleSearch({ mountedFlag: true });
    this.queryValueCode();
    const { queryUnitConfig } = this.props;
    queryUnitConfig({}, (res) => {
      if (!getResponse(res)) return;
      const _newFields = [
        // {
        //   code: 'a',
        //   key: `sqam-${prefix3}-panel-auditStage`,
        //   title: intl.get(`${prefix2}.panel.auditStage`).d('审核阶段'),
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
          code: 'customA',
          key: `sqam-${prefix3}-panel-custom`,
          title: intl.get(`${prefix2}.panel.basic`).d('基本信息'),
        },
        {
          code: 'otherA',
          key: `sqam-${prefix3}-panel-otherInfo-A`,
          title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
        },
      ];
      let newFields = remoteProps
        ? remoteProps.process('SQAM.FEEDBACK_8D_ETAIL.COLLAPSE_FIELDS', _newFields)
        : _newFields;
      const unitConfig = res['SQAM.FEEDBACK_8D_DETAIL.COLLAPSE'];
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
    dispatch({
      type: 'feedback8D/getEdit',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    });
    dispatch({
      type: 'create8D/fetchUploadInfo',
    }).then((res) => {
      if (res) {
        const listConfig = res.listConfig?.content || [];
        const item = listConfig.find((v) => v.directory === 'sqam/8d/') || {};
        const { storageSize = 10 } = item;
        this.setState({ storageSize });
      }
    });
    window.addEventListener('message', this.handleEvent);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {},
        historyVersion: [],
        approvalList: [],
        sourceInfolist: [],
        correlationList: [],
        purchaseOrderList: [],
      },
    });
    window.removeEventListener('message', this.handleEvent);
  }

  @Bind()
  handleEvent(e) {
    const { origin } = e;
    if (origin !== window.location.origin) return;
    const { type, payload } = e.data;
    if (type === '/sqam/feedback8D/detail' && payload === 'update') {
      this.handleSearch();
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

  @Bind()
  fetchSourceInfo() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    dispatch({
      type: 'feedback8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.INSPECT',
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.CORRELATION_8D_LIST',
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
    const { dispatch, tenantId, feedback8D } = this.props;
    const {
      basicInfo: { edProblemTeamList = [] },
    } = feedback8D;
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
    // 删除的成员列表
    const deleteMem = [];
    // 未删除的成员列表
    const newMem = [];
    edProblemTeamList.forEach((i) => {
      if (selectedRowKeys.includes(i.problemTeamId) && i._status !== 'create') {
        const deleteItem = omit(i, ['$form', 'rowKey', '_status']);
        deleteMem.push({ ...deleteItem, deleteFlag: 1, optcamp: 'SUPPLIER' }); // 重置更新状态的成员的deleteFlag
      } else if (!selectedRowKeys.includes(i.problemTeamId)) {
        newMem.push({ ...i });
      }
    });
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据'),
      onOk: () => {
        if (isEmpty(deleteMem)) {
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
        } else {
          dispatch({
            type: 'feedback8D/removeGroupMem',
            payload: {
              tenantId,
              members: deleteMem,
              optcamp: 'SUPPLIER',
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
        }
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
  handleSearch(searchProps) {
    const { mountedFlag = false } = searchProps || {};
    const { dispatch, tenantId, match, remote: remoteProps } = this.props;
    const { id } = match.params;
    const customizeUnitCodes = [
      'SQAM.FEEDBACK_8D_DETAIL.BASIC',
      'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
      'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
      'SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO_A',
    ].join();
    dispatch({
      type: 'feedback8D/fetch8DBasicInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCodes,
        menuEntryPoint: 'SUPPLIER_FEEDBACK',
      },
    }).then(async() => {
      const {
        feedback8D: {
          basicInfo: feedbackBasicInfo,
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
      if (mountedFlag && remoteProps?.event) {
        const cuxRes = await remoteProps.event.fireEvent('handleDidMount', {
          basicInfo: feedbackBasicInfo,
          handleSearch: this.handleSearch,
        });
        if (!cuxRes) {
          return;
        }
      }
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
      this.getAttachmentNum([attachmentUuid, supplierAttachmentUuid]);
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
      type: 'create8D/fetchTrxHeaderSupplier',
      payload: {
        tenantId,
        query: {
          // decisionResults: decisionResult ? [decisionResult] : decisionResults,
          // assessmentResults,
          withOutAuthFlag: 1,
          rcvTrxLineIds,
          customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.TRX',
        },
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
      type: 'feedback8D/siteEvalReportHeader',
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
    const customizeUnitCodes = [
      'SQAM.FEEDBACK_8D_DETAIL.BASIC',
      'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
      'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
      'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
      'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
      'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
      'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
      'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
      'SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO_A',
    ].join();
    const {
      dispatch,
      tenantId,
      match,
      feedback8D: { basicInfo = {} },
      followUpProduce = {},
      rootReasonAnalyze = {},
      foreverDealSolution = {},
      relateStandard = {},
      isSuitUnderItem = {},
    } = this.props;

    const { feedback8DFollowUp = {} } = followUpProduce;
    const { feedback8DReason = {} } = rootReasonAnalyze;
    const { feedback8DSolution = {} } = foreverDealSolution;
    const { feedback8DSuit = {} } = isSuitUnderItem;
    const { feedback8DStandard = {} } = relateStandard;

    const { followUpProducePagination = {} } = feedback8DFollowUp;
    const { rootReasonAnalyzePagination = {} } = feedback8DReason;
    const { foreverDealSolutionPagination = {} } = feedback8DSolution;
    const { relateStandardPagination = {} } = feedback8DStandard;
    const { isSuitUnderItemPagination = {} } = feedback8DSuit;
    const { id } = match.params;
    const type = opt === 'save' ? 'feedback8D/save8D' : 'feedback8D/submit8D';
    dispatch({
      type,
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
        if (opt === 'save') {
          // 刷新页面
          dispatch({
            type: 'feedback8D/fetch8DBasicInfo',
            payload: {
              tenantId,
              problemHeaderId: res.problemHeaderId,
              customizeUnitCodes,
            },
          });
          this.handleSearch();
          this.handleContinueSupplySearch();
          this.handleFollowUpSearch(followUpProducePagination);
          this.handleRootReasonSearch(rootReasonAnalyzePagination);
          this.handleIsSuitUnderItemSearch(isSuitUnderItemPagination);
          this.handleForeverSolutionSearch(foreverDealSolutionPagination);
          this.handleStandardSolutionSearch(relateStandardPagination);
        } else {
          // 返回列表页
          dispatch(
            routerRedux.push({
              pathname: `/sqam/feedback8D/list`,
            })
          );
        }
      } else {
        this.handleSearch();
        // this.handleContinueSupplySearch();
        // this.handleFollowUpSearch(followUpProducePagination);
        // this.handleRootReasonSearch(rootReasonAnalyzePagination);
        // this.handleIsSuitUnderItemSearch(isSuitUnderItemPagination);
        // this.handleForeverSolutionSearch(foreverDealSolutionPagination);
        // this.handleStandardSolutionSearch(relateStandardPagination);
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

  @Bind()
  saveContentOnChange(e) {
    const saveRemindFlag = e.target.checked;
    const customizeUnitCodes = [
      'SQAM.FEEDBACK_8D_DETAIL.BASIC',
      'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
      'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
      'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
      'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
      'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
      'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
      'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
      'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
      'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
      'SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM',
    ].join();
    const {
      dispatch,
      feedback8D: { basicInfo = {} },
    } = this.props;
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {
          ...basicInfo,
          saveRemindFlag,
          customizeUnitCodes,
        },
      },
    });
  }

  /**
   * 保存/提交
   */
  @Bind()
  async handleSave8D(opt) {
    const {
      feedback8D: { basicInfo = {} },
      promiseMaintainProvide: {
        feedback8DProvide: { promiseMaintainProvideList = [] },
      },
      followUpProduce: {
        feedback8DFollowUp: { followUpProduceList = [] },
      },
      rootReasonAnalyze: {
        feedback8DReason: { rootReasonAnalyzeList = [] },
      },
      foreverDealSolution: {
        feedback8DSolution: { foreverDealSolutionList = [] },
      },
      isSuitUnderItem: {
        feedback8DSuit: { isSuitUnderItemList = [] },
      },
      relateStandard: {
        feedback8DStandard: { relateStandardList = [] },
      },
      dispatch,
      remote: remoteProps,
    } = this.props;
    const { edProblemTeamList = [], edProblemAction = {}, saveRemindFlag } = basicInfo;
    const icaType = ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus);
    const pcaType = ['PCA_FEEDBACKING', 'PCA_REJECTED'];

    const saveContent = (
      <React.Fragment>
        <p>
          {intl
            .get('sqam.common.view.message.confirm.save')
            .d('当前状态整改报告保存信息双方可见，是否确认保存？')}
        </p>
        <div className={classNames(styles['modal-saveContent-1'])}>
          <Checkbox onChange={this.saveContentOnChange}>
            {intl.get('sqam.common.view').d('当前整改报告不再显示')}
          </Checkbox>
        </div>
      </React.Fragment>
    );
    const content =
      opt === 'save'
        ? saveContent
        : intl.get('sqam.common.view.message.confirm.submitRelease').d('是否提交8D质量整改单');

    if (icaType || pcaType) {
      // 小组成员
      const newGroupMemberList = this.handleDataTypes(edProblemTeamList, 'getEditedData');
      const editedGroupMemberList = this.handleDataTypes(newGroupMemberList, 'getEditedData');

      // 临时围堵措施—保证持续供货
      const newContinueDataSource = this.handleDataTypes(
        promiseMaintainProvideList,
        'filterNotDelete'
      );
      const editedContinueDataSource = this.handleDataTypes(newContinueDataSource, 'getEditedData');

      // 临时围堵措施—针对后续生产
      const newFollowUpProduceList = this.handleDataTypes(followUpProduceList, 'filterNotDelete');
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
      const newIsSuitUnderItemList = this.handleDataTypes(isSuitUnderItemList, 'filterNotDelete');
      const editedIsSuitUnderItemList = this.handleDataTypes(
        newIsSuitUnderItemList,
        'getEditedData'
      );

      // 相关标准化
      const newRelateStandardList = this.handleDataTypes(relateStandardList, 'filterNotDelete');
      const editedRelateStandardList = this.handleDataTypes(newRelateStandardList, 'getEditedData');

      // 其他信息（如果配置了个性化）
      const newlineListSource = this.handleDataTypes(basicInfo.lineList, 'filterNotDelete');
      const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');

      const newlineListSourceA = this.handleDataTypes(basicInfo.otherDetailList, 'filterNotDelete');
      const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');
      let formCError;
      // eslint-disable-next-line
      if (this.form.c?.validateFieldsAndScroll) {
        await this.form.c.validateFieldsAndScroll((err) => {
          if (err) {
            formCError = true;
          }
        });
      }
      // eslint-disable-next-line
      if (this.form?.customA?.validateFieldsAndScroll) {
        await this.form.customA.validateFieldsAndScroll((err) => {
          if (err) formCError = true;
        });
      } 
      if (formCError) return;

      if (remoteProps) {
        const beforeSaveRes = await remoteProps.event.fireEvent('handleBeforeSaveOrSubmitCux', {
          teamMembersList: edProblemTeamList,
          headerInfo: basicInfo,
          operateType: opt,
          editedContinueDataSource,
        });
        if (beforeSaveRes === false) return false;
      }

      Promise.all([
        this.validateEditTableDataSource(editedGroupMemberList, [], {}),
        this.validateEditTableDataSource(editedContinueDataSource, [], {}),
        this.validateEditTableDataSource(editedFollowUpProduceList, [], {}),
        this.validateEditTableDataSource(editedRootReasonAnalyzeList, [], {}),
        this.validateEditTableDataSource(editedForeverDealSolutionList, [], {}),
        this.validateEditTableDataSource(editedIsSuitUnderItemList, [], {}),
        this.validateEditTableDataSource(editedRelateStandardList, [], {}),
        this.validateEditTableDataSource(editlineList, [], {}),
        this.validateEditTableDataSource(editlineListA, [], {}),
      ]).then(() => {
        // 小组成员
        const newGroupMemberDataList = this.handleData(editedGroupMemberList, 'problemTeamId');
        // if (opt !== 'save' && !this.checkGroupLeaderUnique()) return;
        // 临时围堵措施—保证持续供货
        let newPromiseMaintainProvideList = this.handleData(
          promiseMaintainProvideList,
          'edProblemTeamId'
        );
        newPromiseMaintainProvideList = newPromiseMaintainProvideList.map((item) => {
          const suppliyEndDate =
            item.suppliyEndDate && icaType
              ? moment(item.suppliyEndDate).format(DATETIME_MIN)
              : item.suppliyEndDate;
          const effectFlag = item.badQuantity === 0 ? 0 : 1;
          return {
            ...item,
            suppliyEndDate,
            effectFlag,
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
        const finallyRootReasonAnalyzeList = this.handleData(rootReasonAnalyzeList, 'rootCauseId');
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
        // 小组祝贺
        const formJ = this.form?.j?.getFieldsValue ? this.form.j.getFieldsValue() : {};
        const formC = this.form?.c?.getFieldsValue ? this.form.c.getFieldsValue() : {};
        const formCustomA = this.form?.customA?.getFieldsValue
          ? this.form.customA.getFieldsValue()
          : {};
        // 其他信息
        const finallylineList = this.handleData(basicInfo.lineList, 'otherInfoId');
        const finallylineListA = this.handleData(basicInfo.otherDetailList, 'otherDetailId');
        const AllNewData = {
          edProblemTeamList: newGroupMemberDataList.map((item) => ({
            ...item,
            optcamp: 'SUPPLIER',
          })),
          edProblemSupplyActionList: newPromiseMaintainProvideList,
          edProblemProduceActionList: FinallyFollowUpProduceList,
          edProblemRootCauseList: finallyRootReasonAnalyzeList,
          edProblemPcaActionList: finallyForeverDealSolutionList,
          edProblemApplicableItemsList: finallyIsSuitUnderItemSolutionList,
          edProblemRelevantStandardList: finallyRelateStandardSolutionList,
          ...formC,
          ...formCustomA,
          edProblemAction: {
            ...edProblemAction,
            ...formJ,
          },
          lineList: finallylineList,
          otherDetailList: finallylineListA,
        };
        const customizeUnitCodes = [
          'SQAM.FEEDBACK_8D_DETAIL.BASIC',
          'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
          'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
          'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
          'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
          'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
          'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
          'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
          'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
          'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
          'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
          'SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM',
          'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO_A',
        ].join();

        if (opt === 'save' && saveRemindFlag === 1) {
          return this.cuxSendDataToAfterEnd(opt, AllNewData);
        }
        Modal.confirm({
          content,
          iconType: '',
          onOk: () => this.cuxSendDataToAfterEnd(opt, AllNewData),
          onCancel() {
            dispatch({
              type: 'feedback8D/updateState',
              payload: {
                customizeUnitCodes,
                basicInfo: {
                  ...basicInfo,
                  saveRemindFlag,
                },
              },
            });
          },
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
    const uuid = basicInfo.supplierAttachmentUuid || attachmentUUID;
    this.getAttachmentNum([uuid, basicInfo?.attachmentUuid]);
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

  @Bind()
  handleUpdateBasicInfo(changeValues) {
    const {
      dispatch,
      feedback8D: { basicInfo },
    } = this.props;
    dispatch({
      type: 'feedback8D/updateState',
      payload: {
        basicInfo: {
          ...basicInfo,
          ...changeValues,
        },
      },
    });
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

  @Bind()
  async handleOtherInfoADelete() {
    const { otherInfoASelectedRows, otherInfoASelectedRowKeys } = this.state;
    let result = {};
    const {
      dispatch,
      feedback8D: { basicInfo = {} },
    } = this.props;
    const { otherDetailList, otherInfoAPagination } = basicInfo;
    const remoteDeleteData = otherInfoASelectedRows.filter((item) => item._status === 'update');
    let isNeedRefresh = false;
    if (remoteDeleteData.length > 0) {
      result = await dispatch({
        type: 'feedback8D/delDproblemheaderdetaillinesA',
        payload: remoteDeleteData,
      });
      if (!result) return;
      isNeedRefresh = true;
    }
    const params = {
      otherDetailList: otherDetailList.filter(
        (item) => !otherInfoASelectedRowKeys.includes(item.otherDetailId)
      ),
      otherInfoAPagination: delItemsToPagination(
        otherInfoASelectedRows.length,
        otherDetailList.length,
        otherInfoAPagination
      ),
    };
    dispatch({
      type: 'feedback8D/updateState',
      payload: { basicInfo: { ...basicInfo, ...params } },
    });
    this.setState({
      otherInfoASelectedRows: [],
      otherInfoASelectedRowKeys: [],
    });
    if (isNeedRefresh) {
      this.handleSearch();
    }
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
        stateKey: 'feedback8DProvide',
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

    const { feedback8DProvide = {} } = promiseMaintainProvide;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = feedback8DProvide;

    const obj = {
      selectedRows: continueSupplySelectedRows,
      ModelDataSource: promiseMaintainProvideList,
      SelectedRowKeys: continueSupplySelectedRowKeys,
      SelectedRowKeysName: 'edProblemTeamId',
      dispatchTypeDelete: 'promiseMaintainProvide/deleteData',
      dispatchTypeUpdate: 'promiseMaintainProvide/updateState',
      ModelDataSourceName: 'promiseMaintainProvideList',
      Pagination: promiseMaintainProvidePagination,
      PaginationName: 'promiseMaintainProvidePagination',
      stateKey: 'feedback8DProvide',
      rowsKey: 'continueSupply',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
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
        (item) => !SelectedRowKeys.includes(item[SelectedRowKeysName])
      ),
      [PaginationName]: delItemsToPagination(
        selectedRows.length,
        ModelDataSource.length,
        Pagination
      ),
    };
    dispatch({
      type: dispatchTypeUpdate,
      payload: stateKey ? { [stateKey]: params } : params,
    });
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
        stateKey: 'feedback8DFollowUp',
      },
    });
  }

  @Bind()
  async handleFollowUpDelete() {
    const { followUpSelectedRowKeys, followUpSelectedRows } = this.state;
    const { followUpProduce = {} } = this.props;
    const { feedback8DFollowUp = {} } = followUpProduce;
    const { followUpProduceList = [], followUpProducePagination = {} } = feedback8DFollowUp;
    const obj = {
      selectedRows: followUpSelectedRows,
      ModelDataSource: followUpProduceList,
      SelectedRowKeys: followUpSelectedRowKeys,
      SelectedRowKeysName: 'produceActionId',
      dispatchTypeDelete: 'followUpProduce/deleteData',
      dispatchTypeUpdate: 'followUpProduce/updateState',
      ModelDataSourceName: 'followUpProduceList',
      Pagination: followUpProducePagination,
      PaginationName: 'followUpProducePagination',
      stateKey: 'feedback8DFollowUp',
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
        stateKey: 'feedback8DReason',
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
    const { feedback8DReason = {} } = rootReasonAnalyze;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = feedback8DReason;

    const obj = {
      selectedRows: rootReasonSelectedRows,
      ModelDataSource: rootReasonAnalyzeList,
      SelectedRowKeys: rootReasonSelectedRowKeys,
      SelectedRowKeysName: 'rootCauseId',
      dispatchTypeDelete: 'rootReasonAnalyze/deleteData',
      dispatchTypeUpdate: 'rootReasonAnalyze/updateState',
      ModelDataSourceName: 'rootReasonAnalyzeList',
      Pagination: rootReasonAnalyzePagination,
      PaginationName: 'rootReasonAnalyzePagination',
      stateKey: 'feedback8DReason',
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
        stateKey: 'feedback8DSolution',
      },
    });
  }

  @Bind()
  async handleForeverSolutionDelete() {
    const { foreverSolutionSelectedRowKeys, foreverSolutionSelectedRows } = this.state;
    const { foreverDealSolution = {} } = this.props;
    const { feedback8DSolution = {} } = foreverDealSolution;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = feedback8DSolution;

    const obj = {
      selectedRows: foreverSolutionSelectedRows,
      ModelDataSource: foreverDealSolutionList,
      SelectedRowKeys: foreverSolutionSelectedRowKeys,
      SelectedRowKeysName: 'pcaActionId',
      dispatchTypeDelete: 'foreverDealSolution/deleteData',
      dispatchTypeUpdate: 'foreverDealSolution/updateState',
      ModelDataSourceName: 'foreverDealSolutionList',
      Pagination: foreverDealSolutionPagination,
      PaginationName: 'foreverDealSolutionPagination',
      stateKey: 'feedback8DSolution',
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
        stateKey: 'feedback8DStandard',
      },
    });
  }

  @Bind()
  async handleStandardSolutionDelete() {
    const { relateStandardSelectedRowKeys, relateStandardSelectedRows } = this.state;
    const { relateStandard = {} } = this.props;
    const { feedback8DStandard = {} } = relateStandard;
    const { relateStandardList = [], relateStandardPagination = {} } = feedback8DStandard;

    const obj = {
      selectedRows: relateStandardSelectedRows,
      ModelDataSource: relateStandardList,
      SelectedRowKeys: relateStandardSelectedRowKeys,
      SelectedRowKeysName: 'relevantStandardId',
      dispatchTypeDelete: 'relateStandard/deleteData',
      dispatchTypeUpdate: 'relateStandard/updateState',
      ModelDataSourceName: 'relateStandardList',
      Pagination: relateStandardPagination,
      PaginationName: 'relateStandardPagination',
      stateKey: 'feedback8DStandard',
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
        customizeUnitCode: 'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
        stateKey: 'feedback8DSuit',
      },
    });
  }

  @Bind()
  async handleIsSuitUnderItemDelete() {
    const { isSuitUnderItemSelectedRowKeys, isSuitUnderItemSelectedRows } = this.state;
    const { isSuitUnderItem = {} } = this.props;
    const { feedback8DSuit = {} } = isSuitUnderItem;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = feedback8DSuit;

    const obj = {
      selectedRows: isSuitUnderItemSelectedRows,
      ModelDataSource: isSuitUnderItemList,
      SelectedRowKeys: isSuitUnderItemSelectedRowKeys,
      SelectedRowKeysName: 'applicableItemsId',
      dispatchTypeDelete: 'isSuitUnderItem/deleteData',
      dispatchTypeUpdate: 'isSuitUnderItem/updateState',
      ModelDataSourceName: 'isSuitUnderItemList',
      Pagination: isSuitUnderItemPagination,
      PaginationName: 'isSuitUnderItemPagination',
      stateKey: 'feedback8DSuit',
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
      document.getElementById('sqam-feedback8D-detail-content-inner-wrapper')
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
    const { feedback8D = {}, create8D = {} } = this.props;
    const { quoteTrxList = [], siteInvestigateReportList = [], evalDataSource = [] } = create8D;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      correlationList = [],
      relatioPagination,
      siteEvalReportPage,
    } = feedback8D;
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

  @Bind()
  headerBtnsRender() {
    const { cuxloading } = this.state;
    const { loading, feedback8D = {}, remote: remoteProps } = this.props;
    const btnLoading = loading.save || loading.release || loading.detail || cuxloading;
    const { basicInfo = {} } = feedback8D;
    const otherProps = {
      handleSearch: this.handleSearch,
      form: this.form,
      basicInfo,
      loading: btnLoading,
    };
    const btns = [
      {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          type: 'primary',
          loading: btnLoading,
          onClick: throttle(() => this.handleSave8D('save'), 1500, { trailing: false }),
        },
      },
      {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交', { trailing: false }),
        btnProps: {
          icon: 'check',
          loading: btnLoading,
          onClick: throttle(() => this.handleSave8D('submit'), 1500, { trailing: false }),
        },
      },
      {
        name: 'operator',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'clock-circle-o',
          loading: btnLoading,
          disabled: !basicInfo.problemHeaderId,
          onClick: throttle(() => this.handleModal('operatorRecordVisible', true), 1500, {
            trailing: false,
          }),
        },
      },
      {
        name: 'attachment',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${this.state.fileNum})`,
        btnProps: {
          icon: 'paper-clip',
          loading: btnLoading,
          disabled: !basicInfo.problemHeaderId,
          onClick: throttle(() => this.handleAttachmentOption(), 1500, { trailing: false }),
        },
      },
    ];
    return remoteProps
      ? remoteProps.process('SQAM_FEEDBACK_8D_DETAIL_BTNS', btns, otherProps)
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
      attachmentUUID,
      operatorRecordVisible,
      attachmentVisible = false,
      selectedRowKeys = [],
      collapseKeys,

      continueSupplySelectedRowKeys,
      // promiseMaintainProvideList,
      followUpSelectedRowKeys,
      rootReasonSelectedRowKeys,
      foreverSolutionSelectedRowKeys,
      relateStandardSelectedRowKeys,
      isSuitUnderItemSelectedRowKeys,
      activeKey,
      storageSize,
      selectedRowsMember,
      otherInfoASelectedRowKeys,
    } = this.state;
    const {
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
      isSuitUnderItem = {},
      create8D: { quoteTrxList, siteInvestigateReportList = [], evalDataSource = [] },
      location: { pathname },
      customizeTable,
      customizeForm,
      customizeTabPane,
      custLoading,
      customizeCollapse,
      evalLoading,
      history,
      customizeBtnGroup,
      remote: remoteProps,
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
    } = loading;
    const { code = {} } = groupMemberPanel;

    const { feedback8DProvide = {} } = promiseMaintainProvide;
    const { feedback8DFollowUp = {} } = followUpProduce;
    const { feedback8DReason = {} } = rootReasonAnalyze;
    const { feedback8DSolution = {} } = foreverDealSolution;
    const { feedback8DSuit = {} } = isSuitUnderItem;
    const { feedback8DStandard = {} } = relateStandard;

    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = feedback8DProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = feedback8DFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = feedback8DReason;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = feedback8DSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = feedback8DStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = feedback8DSuit;

    const { participateNode, camp, idd } = code;
    const {
      basicInfo = {},
      sourceInfolist = [],
      correlationList = [],
      purchaseOrderList = [],
      getEdit = [],
      relatioPagination,
      siteEvalReportList = [],
      siteEvalReportPage = {},
    } = feedback8D;
    const { edProblemTeamList = [], edProblemAction = {}, ...basic } = basicInfo;
    const edProblemInfo = edProblemAction || {};
    const icaType = ['PUBLISHED', 'ICA_REJECTED'].includes(basicInfo.problemStatus);
    const pcaType = ['PCA_FEEDBACKING', 'PCA_REJECTED'].includes(basicInfo.problemStatus);
    const title = icaType
      ? intl.get(`sqam.common.view.message.title.8d.feedback.ICA`).d('ICA反馈维护明细')
      : intl.get(`sqam.common.view.message.title.8d.feedback.PCA`).d('PCA反馈维护明细');

    const basicInfoProps = {
      basicInfo: basic,
      loading: loading.detail,
      isSupplier: true,
      code: 'SQAM.FEEDBACK_8D_DETAIL.BASIC',
      customizeForm,
      remoteProps,
      exposeCode: 'SQAM_FEEDBACK8D_DETAIL_CUX__BASIC',
    };
    const questionProps = {
      problemDesc: basicInfo,
      customizeForm,
      code: 'SQAM.FEEDBACK_8D_DETAIL.PROBLEM_DESCRIPTION',
      onRef: this.handleBindRef,
      onFormChange: this.handleUpdateBasicInfo,
    };
    const groupMemberProps = {
      loading,
      camp,
      idd,
      participateNode,
      selectedRowKeys,
      selectedRowsMember,
      readOnly: !icaType,
      required: icaType,
      isSuppiler: true,
      groupMember: edProblemTeamList,
      onAdd: this.handleAddMem,
      onRemove: this.handleDeleteMem,
      onSelectRow: this.handleSelectMem,
      onChangeFlag: this.handleChangeEditable,
      onChangeLeader: this.handleLeaderChange,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.GROUPMEMBER',
      custLoading,
      basicInfo,
      match,
    };
    const continueSupplyProps = {
      tenantId,
      loading: promiseMaintainProvideLoading,
      deleteLoading: promiseMaintainProviderDeleteLoading,
      selectedRowKeys: continueSupplySelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !icaType : !getEdit.includes('e'),
      required: icaType,
      pagination: promiseMaintainProvidePagination,
      edProblemHeaderId: id,
      dataSource: promiseMaintainProvideList,
      onRemove: this.handleContinueSupplyDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.TEMPMEASURE',
      custLoading,
      stateKey: 'feedback8DProvide',
    };
    const followUpProduceProps = {
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.SHORTMEASURES',
      custLoading,
      loading: followUpProduceLoading,
      deleteLoading: followUpProduceDeleteLoading,
      selectedRowKeys: followUpSelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !icaType : !getEdit.includes('f'),
      required: icaType,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      onRemove: this.handleFollowUpDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'feedback8DFollowUp',
    };
    const rootAnalyzeProps = {
      loading: rootAnalyzeLoading,
      deleteLoading: rootAnalyzeDeleteLoading,
      edProblemHeaderId: id,
      selectedRowKeys: rootReasonSelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !(icaType || pcaType) : !getEdit.includes('g'),
      required: icaType || pcaType,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      onRemove: this.handleRootReasonDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.ROOTCAUSE',
      custLoading,
      stateKey: 'feedback8DReason',
    };
    const remedialActionProps = {
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.PERMANENTACTION',
      custLoading,
      loading: foreverSolutionLoading,
      deleteLoading: foreverSolutionDeleteLoading,
      selectedRowKeys: foreverSolutionSelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !(icaType || pcaType) : !getEdit.includes('h'),
      required: icaType || pcaType,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      onRemove: this.handleForeverSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'feedback8DSolution',
    };
    const standardizingProps = {
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.STANDARDIZATION',
      custLoading,
      loading: standardizingLoading,
      deleteLoading: standardizingDeleteLoading,
      selectedRowKeys: relateStandardSelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !(icaType || pcaType) : !getEdit.includes('i'),
      required: icaType || pcaType,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      onRemove: this.handleStandardSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'feedback8DStandard',
    };

    const trxRcvProps = {
      dispatch,
      dataSource: quoteTrxList,
      backPath: pathname,
      code: 'SQAM.FEEDBACK_8D_DETAIL.TRX',
      customizeTable,
    };
    const isSuitUnderItemProps = {
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.OTHERAPPLICABLE',
      custLoading,
      loading: isSuitUnderItemLoading,
      deleteLoading: isSuitUnderItemDeleteLoading,
      selectedRowKeys: isSuitUnderItemSelectedRowKeys,
      readOnly: isEmpty(getEdit) ? !(icaType || pcaType) : !getEdit.includes('k'),
      required: icaType || pcaType,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      onRemove: this.handleIsSuitUnderItemDelete,
      onSelectRow: this.handleCommonRowSelection,
      stateKey: 'feedback8DSuit',
    };
    const congratulationProps = {
      code: 'SQAM.FEEDBACK_8D_DETAIL.TEAMCONGRATULATIONS',
      customizeForm,
      custLoading,
      readOnly: isEmpty(getEdit) ? false : !getEdit.includes('j'),
      congratulations: edProblemInfo,
      onRef: this.handleBindRef,
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
      storageSize,
      tenantId,
      loading: loading.attachment,
      visible: attachmentVisible,
      attachmentUUID: basicInfo.supplierAttachmentUuid
        ? basicInfo.supplierAttachmentUuid
        : attachmentUUID,
      supplierBucketDirectory: 'sqam-ed-supplieratt', // 供应商附件bucketDirectory
      // purchaserBucket: 'sqam-ed-att',
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      onCancel: this.handleAttachmentModalHidden,
      supplierAttachmentUuid: basicInfo.supplierAttachmentUuid || attachmentUUID,
      attachmentUuid: basicInfo.attachmentUuid,
      purchaseReadOnly: true,
      showSupplier: true,
      camp: 'supplier',
    };

    const OtherInfoProps = {
      readOnly: true,
      required: false,
      loading: loading.detail,
      pagination: basicInfo.otherInfoPagination,
      dataSource: basicInfo.lineList,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO',
      custLoading,
      handleSearch: this.handleSearch,
      problemHeaderId: basicInfo.problemHeaderId,
      importFlag: true,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.FEEDBACK_8D_DETAIL.OTHER_BTNS',
      camp: 'supplier',
    };
    const OtherInfoAProps = {
      readOnly: false,
      required: false,
      loading: loading.detail || loading.otherInfoADeleteLoading,
      pagination: basicInfo.otherInfoAPagination,
      dataSource: basicInfo.otherDetailList,
      detailInfo: basicInfo,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.OTHERINFO_A',
      custLoading,
      handleSearch: this.handleSearch,
      problemHeaderId: basicInfo.problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.CREATE_8D_DETAIL.OTHER_BTNS_A',
      namespaceKey: 'feedback8D',
      onRemove: this.handleOtherInfoADelete,
      onSelectRow: this.handleCommonRowSelection,
      selectedRowKeys: otherInfoASelectedRowKeys,
    };

    const correlationProps = {
      supplier: true,
      dataSource: correlationList,
      loading: fetchCorrelationLoading,
      customizeTable,
      customCode: 'SQAM.FEEDBACK_8D_DETAIL.CORRELATION_8D_LIST',
      fetchCorrelation: this.fetchCorrelation,
      pagination: relatioPagination,
    };

    const sourceInfoProps = {
      tenantId,
      dispatch,
      dataSource: sourceInfolist,
      loading: fetchSourceInfoLoading,
      prefixToPath: '/feedback8D',
      backPath: pathname,
      customizeTable,
      code: 'SQAM.FEEDBACK_8D_DETAIL.INSPECT',
    };
    const purchaseOrderProps = {
      loading: fetchOrderLoading,
      dataSource: purchaseOrderList,
      backPath: pathname,
      isSupplier: true,
      prefixToPath: '/feedback8D',
      history,
    };
    // const reviewInfoProps = {
    //   basicInfo: basic,
    //   customizeForm,
    //   onClickOpen: this.handleAttachmentOption,
    // };
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
      prefixToPath: '/feedback8D',
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
      pageSource: 'feedback8D',
      // onChange: page => this.handleEvaluationSearch(page),
    };
    return (
      <React.Fragment>
        <Header title={title} backPath="/sqam/feedback8D/list">
          {customizeBtnGroup(
            { code: 'SQAM.FEEDBACK_8D_LIST.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtnsRender()} />
          )}
        </Header>
        <div className="sqam-detail-content" id="sqam-feedback8D-detail-content-inner-wrapper">
          <Content className={classNames(styles['page-content'])}>
            <Spin spinning={loading.detail} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {customizeCollapse(
                {
                  code: 'SQAM.FEEDBACK_8D_DETAIL.COLLAPSE',
                },
                <Collapse
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Collapse.Panel
                    id="sqam-feedback8D-panel-basic"
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
                        { code: 'SQAM.FEEDBACK_8D_DETAIL.BASIC_TABS' },
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
                    id="sqam-feedback8D-panel-question"
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
                    <QuestionPanel {...questionProps} />
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-feedback8D-panel-groupMember"
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
                    id="sqam-feedback8D-panel-promiseMaintainProvide"
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
                    id="sqam-feedback8D-panel-shortMeature"
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
                    id="sqam-feedback8D-panel-analyzeReason"
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
                    id="sqam-feedback8D-panel-foreverDealSolution"
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
                    id="sqam-feedback8D-panel-applyItem"
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
                    id="sqam-feedback8D-panel-standard"
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
                    id="sqam-feedback8D-panel-congratulation"
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
                    id="sqam-feedback8D-panel-otherInfo"
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
                    id="sqam-feedback8D-panel-otherInfo-A"
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
                    id="sqam-feedback8D-panel-custom"
                    forceRender
                    showArrow={false}
                    key="customA"
                  >
                    <CustomForm
                      customizeForm={customizeForm}
                      onRef={this.handleBindRef}
                      basicInfo={basic}
                      code="SQAM.FEEDBACK_8D_DETAIL.CUSZ_FORM"
                      refField="customA"
                    />
                  </Collapse.Panel>
                  {remoteProps.process("SQAM_FEEDBACK8D_DETAIL_CUX_EXTRA_PANEL",null,{_this:this})}
                </Collapse>
              )}
            </Spin>
            <FixedAnchor
              linkList={this.codeFields}
              className="sqam-feedback8D-detail-content-inner-wrapper"
              code="SQAM.FEEDBACK_8D_DETAIL.COLLAPSE"
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
