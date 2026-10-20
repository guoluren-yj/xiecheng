/**
 * 8D 创建-明细
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */ 

import React, { Fragment, PureComponent } from 'react';
import { Spin, Collapse, Form, Modal, Icon, Tabs, Popover } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, omit, isArray, throttle, isNil, isObject } from 'lodash';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import moment from 'moment';
import classNames from 'classnames';
import uuidv4 from 'uuid/v4';
import Lov from 'components/Lov';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import remote from 'hzero-front/lib/utils/remote';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  getEditTableData,
  getResponse,
  getCurrentUserId,
  delItemsToPagination,
} from 'utils/utils';
import { SRM_SQAM } from '_utils/config';
import PrintProButton from '_components/PrintProButton';
import { DEFAULT_DATETIME_FORMAT, DETAIL_DEFAULT_CLASSNAME, DATETIME_MIN } from 'utils/constants';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { stringify } from 'querystring';
import { getServerTime, queryApprovalMethod } from '@/services/create8DService';
import { getFileNumByUUID } from '@/utils/utils';
import QuestionForm from './QuestionForm';
import BasicInfoForm from './BasicInfoForm';
import TeamMembers from './TeamMembers';
import SourceInfo from '../../components/SourceInfoPanel';
import CorrelationPanel from '../CorrelationPanel';
import AddPurchaseOrderModal from './AddPurchaseOrderModal';
import PurchaseOrderPanel from '../../components/PurchaseOrderPanel';
import IsSuitUnderItem from '../../components/IsSuitUnderItem';
import RelateStandard from '../../components/RelateStandard';
import CongratulationPanel from '../../components/CongratulationPanel';
import Change from '../../components/ChangeFormItem';
import OperatorRecord from '../../components/QualityRectificationRecord';
import styles from './index.less';
import PromiseMaintainProvide from '../../components/PorvisionalMeasure/PromiseMaintainProvide';
import FollowUpProduce from '../../components/PorvisionalMeasure/FollowUpProduce';
import RootReasonAnalyze from '../../components/rootReasonAnalyze';
import ForeverDealSolution from '../../components/ForeverDealSolution';

import AttachmentModal from '../../components/AttachmentC7nModal';
import TrxQuoteList from '../../components/TrxQuoteList';
import SiteInvestigate from '../../components/SiteInvestigate';
import SiteEval from '../../components/SiteEval';
import EvaluationList from '../../components/EvaluationList';
import FixedAnchor from '../../components/FixedAnchor';
import OtherInfo from '../../components/OtherInfo';
import OtherInfoA from '../../components/OtherInfoA';
import '../../common.less';

const prefix = `sqam.common.view.message.title`;
const { TabPane } = Tabs;

@remote(
  {
    code: 'SQAM_CREATE8D_DETAIL_CUX',
    name: 'remote',
  },
  {
    events: {
      handleSaveDataCux: ({ onSave, payload }) => onSave(payload),
    },
  }
)
@formatterCollections({
  code: [
    'sqam.common',
    'sqam.detail',
    'entity.supplier',
    'entity.item',
    'entity.company',
    'entity.organization',
    'entity.attachment',
    'entity.roles',
    'entity.business',
    'sqam.createRectification',
    'hzero.hzeroUI',
    'sslm.evaluationQuery',
    'sqam.quoteIncomingInspection',
    'hzero.common',
  ],
})
@withCustomize({
  unitCode: [
    'SQAM.CREATE_8D_DETAIL.BASIC',
    'SQAM.CREATE_8D_DETAIL.COLLAPSE',
    'SQAM.CREATE_8D_DETAIL.TEMPMEASURE',
    'SQAM.CREATE_8D_DETAIL.SHORTMEASURES',
    'SQAM.CREATE_8D_DETAIL.ROOTCAUSE',
    'SQAM.CREATE_8D_DETAIL.PERMANENTACTION',
    'SQAM.CREATE_8D_DETAIL.OTHERAPPLICABLE',
    'SQAM.CREATE_8D_DETAIL.STANDARDIZATION',
    'SQAM.CREATE_8D_DETAIL.TEAMCONGRATULATIONS',
    'SQAM.CREATE_8D_DETAIL.CREATE.COLLAPSE',
    'SQAM.CREATE_8D_DETAIL.INSPECT',
    'SQAM.CREATE_8D_DETAIL.OTHERINFO',
    'SQAM.CREATE_8D_DETAIL.PROBLEM',
    'SQAM.CREATE_8D_DETAIL.TRX',
    'SQAM.CREATE_8D_DETAIL.CORRELATION_8D_LIST',
    'SQAM.CREATE_8D_DETAIL.BTNS',
    'SQAM.CREATE_8D_DETAIL.OTHER_BTNS',
    'SQAM.CREATE_8D_DETAIL.BASIC_TABS',
    'SQAM.CREATE_8D_DETAIL.OTHER_BTNS_A',
    'SQAM.CREATE_8D_DETAIL.OTHERINFO_A',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST',
    // 'SSLM.EVALUATION_QUERY_ARCHIVES.LIST_FILTER',
    'SQAM.CREATE_8D_DETAIL.GROUPMEMBER',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(
  ({
    loading,
    create8D,
    promiseMaintainProvide,
    followUpProduce,
    rootReasonAnalyze,
    foreverDealSolution,
    relateStandard,
    isSuitUnderItem,
  }) => {
    return {
      create8D,
      promiseMaintainProvide,
      followUpProduce,
      rootReasonAnalyze,
      foreverDealSolution,
      relateStandard,
      isSuitUnderItem,
      evalLoading: loading.effects['create8D/fetchList'],
      loading: {
        fetch: loading.effects['create8D/fetchDetail'],
        save: loading.effects['create8D/save8D'] || loading.effects['create8D/update8D'],
        delete: loading.effects['create8D/delete8D'],
        release: loading.effects['create8D/release8D'],
        fetchLineLoading: loading.effects['create/queryTeamMembers'],
        fetchSourceLoading: loading.effects['create/fetchSourceLoading'],
        fetchUserIDLoading: loading.effects['create8D/fetctUserID'],
      },
      promiseMaintainProvideLoading: loading.effects['promiseMaintainProvide/fetchData'],
      followUpProduceLoading: loading.effects['followUpProduce/fetchData'],
      rootAnalyzeLoading: loading.effects['rootReasonAnalyze/fetchData'],
      foreverSolutionLoading: loading.effects['foreverDealSolution/fetchData'],
      isSuitUnderItemLoading: loading.effects['isSuitUnderItem/fetchData'],
      standardizingLoading: loading.effects['standardizing/fetchData'],
      promiseMaintainProviderDeleteLoading: loading.effects['promiseMaintainProvide/deleteData'],
      followUpProduceDeleteLoading: loading.effects['followUpProduce/deleteData'],
      rootAnalyzeDeleteLoading: loading.effects['rootReasonAnalyze/deleteData'],
      foreverSolutionDeleteLoading: loading.effects['foreverSolution/deleteData'],
      isSuitUnderItemDeleteLoading: loading.effects['isSuitUnderItem/deleteData'],
      standardizingDeleteLoading: loading.effects['standardizing/deleteData'],
      otherInfoDeleteLoading: loading.effects['create8D/delDproblemheaderdetaillines'],
      otherInfoADeleteLoading: loading.effects['create8D/delDproblemheaderdetaillinesA'],
      deleteMemberLoading: loading.effects['create8D/deleteTeamMembers'],
      tenantId: getCurrentOrganizationId(),
    };
  }
)
export default class Detail extends PureComponent {
  form = {
    j: {}, // 小组祝贺
    l: {}, // 成效追踪
  };

  constructor(props) {
    super(props);
    const {
      match: { params },
    } = props;
    const { id } = params;
    this.state = {
      id,
      user: getCurrentUser().realName,
      // uploadVisible: false,
      newFlag: isUndefined(id),
      collapseKeys: ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'],
      attachmentVisible: false,
      addCorrelationList: [],
      correlationList: [],
      teamMembersList: [],
      selectedRowKeys: [],
      selectedSourceKeys: [], // 来源信息选中行的 key
      selectedOrderKeys: [],
      activeKey: 'basicInfo',
      decisionResults: [],
      serverTime: new Date(),
      addPurchaseOrderVisible: false,
      operatorRecordVisible: false,
      isApprovalShow: false,
      attachmentUuid: uuidv4(),
      attachmentInterUuid: uuidv4(),
      storageSize: [],
      continueSupplySelectedRowKeys: [], // 保证持续供货
      otherInfoSelectedRowKeys: [], // 其他信息
      otherInfoSelectedRows: [],
      otherInfoASelectedRowKeys: [], // 其他信息
      otherInfoASelectedRows: [],
      continueSupplySelectedRows: [],
      followUpSelectedRowKeys: [],
      followUpSelectedRows: [],
      rootReasonSelectedRowKeys: [],
      rootReasonSelectedRows: [],
      foreverSolutionSelectedRowKeys: [],
      foreverSolutionSelectedRows: [],
      isSuitUnderItemSelectedRowKeys: [],
      isSuitUnderItemSelectedRows: [],
      relateStandardSelectedRowKeys: [],
      relateStandardSelectedRows: [],
      evalHeaderIds: [],
      supplierRecord: null,
      fileNum: 0,
      // problemHeaderId: '',
    };
    const Change_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
    this.otherARef = null;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    this.handleInitWithId();
    this.fetchIncomingSearch();
    dispatch({
      type: 'create8D/fetchLov',
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
  }

  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      match: { params = {} },
    } = this.props;
    const {
      match: { params: nextParams = {} },
    } = nextProps;
    const { id } = nextParams;
    if (params.id !== id) {
      this.setState({ id, newFlag: isUndefined(id) }, () => this.handleInitWithId());
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'create8D/updateState',
      payload: {
        sourceInfolist: [],
        purchaseOrderList: [],
        siteEvalReportList: [],
        siteEvalReportPage: {},
      },
    });
  }

  @Bind()
  handleInitWithId() {
    this.handleSearch();
    this.queryTeamMembers();
    this.fetchSettingValue();
  }

  // 查询配置中心是否开启无需审批
  @Bind()
  async fetchSettingValue() {
    const { tenantId } = this.props;
    const { id } = this.state;
    if (!isUndefined(id)) {
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
          customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.TRX',
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
      type: 'create8D/siteEvalReportHeader',
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
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'create8D/fetchSourceInfo',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.INSPECT',
      },
    });
  }

  @Bind()
  fetchPurchaseOrder() {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'create8D/fetchPurchaseOrder',
      payload: {
        tenantId,
        problemHeaderId: id,
      },
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    if (!isUndefined(id)) {
      dispatch({
        type: 'create8D/fetchDetail',
        payload: {
          tenantId,
          problemHeaderId: id,
          congratulationUnitCode:"SQAM.CREATE_8D_DETAIL.TEAMCONGRATULATIONS"
        },
      }).then(() => {
        const {
          form,
          create8D: {
            detail: {
              sourceCode,
              rcvTrxLineIds,
              evalHeaderIds,
              problemHeaderId,
              attachmentUuid,
              attachmentInterUuid,
            },
          },
        } = this.props;
        if (form) form.resetFields();
        this.fetchCorrelation();
        this.fetchPurchaseOrder();
        if (sourceCode === 'TRX_RCV_LINE') {
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
        if (sourceCode === 'INCOMING_INSPECTION') this.fetchSourceInfo();
        this.getAttachmentNum([attachmentUuid, attachmentInterUuid]);
      });
    } else {
      this.handleInitData();
      this.handleGetServerTime();
    }
  }

  @Bind()
  async getAttachmentNum(uuids) {
    const num = await getFileNumByUUID(uuids, 'sqam-ed-att');
    this.setState({ fileNum: num });
  }

  @Bind()
  fetchIncomingSearch() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'create8D/fetchIncomingSearch',
      payload: { tenantId },
    }).then((res) => {
      if (res) {
        const decisionResults = res.map((item) => item.decisionResult).join();
        this.setState({ decisionResults });
      }
    });
  }

  @Bind()
  changeDetailValue() {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'create8D/changeDetail',
      payload: { tenantId, problemHeaderId: id },
    });
  }

  @Bind()
  async handleInitData() {
    const {
      dispatch,
      sourceDefaultData,
      create8D: { detail = {} },
      remote: remoteProps,
    } = this.props;
    const initParams = await remoteProps?.process('cuxCreateHeader', {}, {});
    if ((isNil(sourceDefaultData) || !isObject(sourceDefaultData)) && isEmpty(initParams)) return;
    const {
      supplierId: extSupplierId,
      supplierNum,
      supplierName,
      supplierCompanyNum,
      supplierCompanyName,
      ...others
    } = sourceDefaultData || {};
    dispatch({
      type: 'create8D/updateState',
      payload: {
        detail: {
          ...detail,
          ...others,
          ...initParams,
          extSupplierId,
          supplierNum: supplierNum || supplierCompanyNum,
          supplierName: supplierName || supplierCompanyName,
        },
      },
    });
  }

  @Bind()
  handleGetServerTime() {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/fetctUserID',
      payload: {
        userID: getCurrentUserId(),
      },
    });
    getServerTime({ tenantId }).then((res) => {
      if (res) {
        this.setState({
          serverTime: res.currentDate,
        });
      }
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
    }).catch((e) => {
      throw e;
    });
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

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}, key = '') {
    this.form[key] = (ref.props || {}).form;
  }

  @Bind()
  handleSetRecord(record) {
    this.setState({ supplierRecord: record });
  }

  getParamFlag() {
    const { supplierRecord } = this.state;
    const {
      create8D: { detail = {} },
    } = this.props;
    const extSupplierId = supplierRecord ? supplierRecord?.extSupplierId : detail?.extSupplierId;
    const supplierCompanyId = supplierRecord
      ? supplierRecord?.supplierCompanyId
      : detail?.supplierCompanyId;
    if (extSupplierId && supplierCompanyId) return 1;
    else if (extSupplierId && !supplierCompanyId) return 2;
    else return 0;
  }

  /**
   * 保存
   */
  @Bind()
  handleSave8D(type) {
    const { teamMembersList, newFlag, id } = this.state;
    const {
      tenantId,
      form,
      create8D: { detail = {}, sourceInfolist = [] },
      custConfig = {},
      remote: remoteProps,
    } = this.props;
    const { edProblemAction = {} } = detail;
    form.validateFields(async (err, values) => {
      if (!err) {
        const {
          supplierStashNum,
          icaDemandDate,
          pcaDemandDate,
          problemOccurredDate,
          creationDate,
          supplierCompanyId,
          supplierTenantId,
          supplierId,
          extSupplierId,
          ...vals
        } = values;
        const newValues = {
          ...vals,
          icaDemandDate: icaDemandDate
            ? moment(icaDemandDate).format(DEFAULT_DATETIME_FORMAT)
            : null,
          pcaDemandDate: pcaDemandDate
            ? moment(pcaDemandDate).format(DEFAULT_DATETIME_FORMAT)
            : null,
          problemOccurredDate: problemOccurredDate
            ? moment(problemOccurredDate).format(DEFAULT_DATETIME_FORMAT)
            : null,
          creationDate: creationDate ? moment(creationDate).format(DEFAULT_DATETIME_FORMAT) : null,
          problemStatus: 'NEW',
          sourceCode: detail.sourceCode || 'MANUAL',
          supplierNum: supplierStashNum || detail.supplierNum,
          supplierCompanyId: supplierCompanyId || detail.supplierCompanyId,
          supplierTenantId: supplierTenantId || detail.supplierTenantId,
          supplierId: supplierId || detail.supplierId,
          extSupplierId: extSupplierId || detail.extSupplierId,
          supplierQueryFlag: this.getParamFlag(),
        };
        const editTableData = getEditTableData(teamMembersList, ['rowKey', '$form', '_status']);
        const editLineData = getEditTableData(detail.lineList, ['rowKey', '$form', '_status']);
        const editLineAData = getEditTableData(detail.otherDetailList || [], [
          'rowKey',
          '$form',
          '_status',
        ]);
        if (
          detail.sourceCode === 'INCOMING_INSPECTION' &&
          isArray(sourceInfolist) &&
          isEmpty(sourceInfolist)
        ) {
          notification.warning({
            message: intl
              .get('sqam.createRectification.view.message.atLeastOneIncoming')
              .d('单据创建方式需引用至少一条检验单'),
          });
          return;
        }
        if (remoteProps) {
          const beforeSaveRes = await remoteProps.event.fireEvent('handleBeforeSaveOrSubmitCux', {
            teamMembersList,
            headerInfo: detail,
            operateType: type,
          });
          if (beforeSaveRes === false) return false;
        }
        if (id) {
          const {
            promiseMaintainProvide: {
              create8DProvide: { promiseMaintainProvideList = [] },
            },
            followUpProduce: {
              create8DFollowUp: { followUpProduceList = [] },
            },
            rootReasonAnalyze: {
              create8DReason: { rootReasonAnalyzeList = [] },
            },
            foreverDealSolution: {
              create8DSolution: { foreverDealSolutionList = [] },
            },
            isSuitUnderItem: {
              create8DSuit: { isSuitUnderItemList = [] },
            },
            relateStandard: {
              create8DStandard: { relateStandardList = [] },
            },
          } = this.props;
          // 小组成员
          const newGroupMemberList = this.handleDataTypes(teamMembersList, 'getEditedData');
          const editedGroupMemberList = this.handleDataTypes(newGroupMemberList, 'getEditedData');

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

          const newlineListSource = this.handleDataTypes(detail.lineList, 'filterNotDelete');

          const editlineList = this.handleDataTypes(newlineListSource, 'getEditedData');
          const newlineListSourceA = this.handleDataTypes(
            detail.otherDetailList,
            'filterNotDelete'
          );
          const editlineListA = this.handleDataTypes(newlineListSourceA, 'getEditedData');

          Promise.all([
            this.validateEditTableDataSource(editedGroupMemberList, [], {}),
            this.validateEditTableDataSource(editedContinueDataSource, [], {
              force: true,
            }),
            this.validateEditTableDataSource(editedFollowUpProduceList, [], {
              force: true,
            }),
            this.validateEditTableDataSource(editedRootReasonAnalyzeList, [], {
              force: true,
            }),
            this.validateEditTableDataSource(editedForeverDealSolutionList, [], {}),
            this.validateEditTableDataSource(editedIsSuitUnderItemList, [], {
              force: true,
            }),
            this.validateEditTableDataSource(editedRelateStandardList, [], {
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
            let newPromiseMaintainProvideList = this.handleData(
              promiseMaintainProvideList,
              'edProblemTeamId'
            );
            newPromiseMaintainProvideList = newPromiseMaintainProvideList.map((item) => {
              const suppliyEndDate = item.suppliyEndDate
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
            let FinallyFollowUpProduceList = this.handleData(
              followUpProduceList,
              'produceActionId'
            );
            FinallyFollowUpProduceList = FinallyFollowUpProduceList.map((item) => {
              const produceEndDate =
                item.produceEndDate && moment(item.produceEndDate).format(DATETIME_MIN);
              return {
                ...item,
                produceEndDate,
              };
            });

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

            // 根本原因分析
            const finallyRootReasonAnalyzeList = this.handleData(
              rootReasonAnalyzeList,
              'rootCauseId'
            );

            // 根本原因分析
            const finallylineList = this.handleData(detail.lineList, 'otherInfoId');
            const finallylineListA = this.handleData(detail.otherDetailList || [], 'otherDetailId');

            // 小组祝贺
            const formJ = this.form.j.getFieldsValue ? this.form.j.getFieldsValue() : {};
            const payload = Object.assign(
              type === 'save' ? { problemHeaderId: id } : { saveFlag: 1 },
              {
                tenantId,
                data:
                  type === 'save'
                    ? {
                        ...detail,
                        ...newValues,
                        edProblemTeamList: editTableData.map((item) => ({
                          ...item,
                          optcamp: 'PURCHASER',
                        })),
                        incomingInspectionDTOS: sourceInfolist,
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
                      }
                    : [
                        {
                          ...detail,
                          ...newValues,
                          edProblemTeamList: editTableData,
                          incomingInspectionDTOS: sourceInfolist,
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
                        },
                      ],
              }
            );
            // 标准保存、提交
            const onSave = (data) => {
              if (type === 'save') {
                if (detail.problemStatus === 'NEW' || newFlag) {
                  this.saveData(data);
                } else {
                  Modal.confirm({
                    iconType: '',
                    content: intl
                      .get('sqam.common.view.message.confirm.saveRectification')
                      .d('是否保存整改报告'),
                    onOk: () => {
                      this.saveData(data);
                    },
                  });
                }
              } else {
                this.handleRelease8D(data);
              }
            };
            if (remoteProps?.event) {
              remoteProps.event.fireEvent('handleSaveDataCux', {
                onSave,
                payload,
                that: this,
              });
            } else {
              onSave(payload);
            }
          });
        } else {
          const collapseCode = newFlag
            ? 'SQAM.CREATE_8D_DETAIL.CREATE.COLLAPSE'
            : 'SQAM.CREATE_8D_DETAIL.COLLAPSE';
          const teamMemberShowFlag =
            custConfig[collapseCode]?.fields?.find((v) => v?.fieldCode === 'd')?.visible !== 0;
          if (editTableData.length !== teamMembersList.length && teamMemberShowFlag) return;
          const payload = Object.assign(
            type === 'save' ? { problemHeaderId: id } : { saveFlag: 1 },
            {
              tenantId,
              data:
                type === 'save'
                  ? {
                      ...detail,
                      ...newValues,
                      edProblemTeamList: editTableData,
                      incomingInspectionDTOS: sourceInfolist,
                      lineList: editLineData,
                      otherDetailList: editLineAData,
                    }
                  : [
                      {
                        ...detail,
                        ...newValues,
                        edProblemTeamList: editTableData,
                        incomingInspectionDTOS: sourceInfolist,
                        lineList: editLineData,
                        otherDetailList: editLineAData,
                      },
                    ],
            }
          );
          if (type === 'save') {
            if (detail.problemStatus === 'NEW' || newFlag) {
              this.saveData(payload);
            } else {
              Modal.confirm({
                iconType: '',
                content: intl
                  .get('sqam.common.view.message.confirm.saveRectification')
                  .d('是否保存整改报告'),
                onOk: () => {
                  this.saveData(payload);
                },
              });
            }
          } else {
            this.handleRelease8D(payload);
          }
        }
      } else {
        notification.warning({
          message: intl.get('sqam.common.view.message.fill.waring').d('保存失败，请填写未填写项'),
        });
      }
    });
  }

  @Bind()
  saveData(payload) {
    const { problemHeaderId } = payload;
    const {
      dispatch,
      followUpProduce = {},
      rootReasonAnalyze = {},
      foreverDealSolution = {},
      relateStandard = {},
      isSuitUnderItem = {},
      promiseMaintainProvide = {},
    } = this.props;
    const { create8DProvide = {} } = promiseMaintainProvide;
    const { create8DFollowUp = {} } = followUpProduce;
    const { create8DReason = {} } = rootReasonAnalyze;
    const { create8DSolution = {} } = foreverDealSolution;
    const { create8DSuit = {} } = isSuitUnderItem;
    const { create8DStandard = {} } = relateStandard;

    const { followUpProducePagination = {} } = create8DFollowUp;
    const { rootReasonAnalyzePagination = {} } = create8DReason;
    const { foreverDealSolutionPagination = {} } = create8DSolution;
    const { relateStandardPagination = {} } = create8DStandard;
    const { isSuitUnderItemPagination = {} } = create8DSuit;
    const { promiseMaintainProvidePagination = {} } = create8DProvide;
    dispatch({
      type: 'create8D/save8D',
      payload,
    }).then((res) => {
      if (res) {
        notification.success();
        // 刷新页面
        if (isUndefined(problemHeaderId)) {
          dispatch(
            routerRedux.push({
              pathname: `/sqam/create8D/detail/${res.problemHeaderId}`,
            })
          );
        } else {
          if (this.form.j && this.form.j.resetFields) this.form.j.resetFields();
          this.handleSearch();
          this.queryTeamMembers();
          // 重新更新数据时，重新设置pageSize
          this.handleFollowUpSearch({
            ...followUpProducePagination,
            pageSize: followUpProducePagination.sourceSize || followUpProducePagination.pageSize,
          });
          this.handleRootReasonSearch({
            ...rootReasonAnalyzePagination,
            pageSize:
              rootReasonAnalyzePagination.sourceSize || rootReasonAnalyzePagination.pageSize,
          });
          this.handleIsSuitUnderItemSearch({
            ...isSuitUnderItemPagination,
            pageSize: isSuitUnderItemPagination.sourceSize || isSuitUnderItemPagination.pageSize,
          });
          this.handleForeverSolutionSearch({
            ...foreverDealSolutionPagination,
            pageSize:
              foreverDealSolutionPagination.sourceSize || foreverDealSolutionPagination.pageSize,
          });
          this.handleStandardSolutionSearch({
            ...relateStandardPagination,
            pageSize: relateStandardPagination.sourceSize || relateStandardPagination.pageSize,
          });
          this.handleContinueSupplySearch({
            ...promiseMaintainProvidePagination,
            pageSize:
              promiseMaintainProvidePagination.sourceSize ||
              promiseMaintainProvidePagination.pageSize,
          });
        }
      }
    });
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete8D(logicDelete = 0) {
    const {
      dispatch,
      tenantId,
      create8D: { detail = {} },
      history,
    } = this.props;
    Modal.confirm({
      iconType: '',
      content:
        logicDelete === 1
          ? intl.get('sqam.common.view.message.confirm.deleteRectification').d('是否删除整改报告')
          : intl
              .get('sqam.common.view.message.confirm.deleteRectificationForever')
              .d('是否永久删除整改报告'),
      onOk: () => {
        dispatch({
          type: 'create8D/delete8D',
          payload: {
            tenantId,
            data: [{ ...detail, logicDelete }],
          },
        }).then((res) => {
          if (res) {
            notification.success();

            // 删除功能:跳转到我发起的质量整改详情页

            history.push({
              pathname: `/sqam/create8D/list`,
            });

            // dispatch(
            //   routerRedux.push({
            //     pathname: `/sqam/initiated8D/detail/${id}`,
            //   })
            // );

            // 永久删除功能：返回列表页
          }
        });
      },
    });
  }

  /**
   * 发布
   */
  @Bind()
  handleRelease8D(payload) {
    const { modal, dispatch, history } = this.props;
    Modal.confirm({
      iconType: '',
      content: intl
        .get(`sqam.common.view.message.confirm.releaseRectification`)
        .d('是否发布整改报告'),
      onOk: () => {
        dispatch({
          type: 'create8D/release8D',
          payload,
        }).then((res) => {
          if (res) {
            notification.success();
            if (modal) return modal.close();
            // 返回列表页
            history.push({
              pathname: `/sqam/create8D/list`,
            });
          }
        });
      },
    });
  }

  @Bind()
  handleAttachmentModalHidden() {
    const {
      tenantId,
      dispatch,
      create8D: { detail },
    } = this.props;
    const { attachmentUuid, attachmentInterUuid } = this.state;
    if (!detail.attachmentUuid && !detail.attachmentInterUuid) {
      dispatch({
        type: 'create8D/saveUUID',
        payload: {
          tenantId,
          uuid: attachmentUuid,
          uuidType: 4, // 供应商附件标识
          problemHeaderId: detail.problemHeaderId,
          interUuid: attachmentInterUuid,
        },
      }).then((res) => {
        // 返回版本号
        if (res) {
          dispatch({
            type: 'create8D/updateState',
            payload: {
              detail: {
                ...detail,
                objectVersionNumber: res,
                attachmentUuid,
                attachmentInterUuid,
              },
            },
          });
        }
      });
    } else {
      if (!detail.attachmentUuid) {
        dispatch({
          type: 'create8D/saveUUID',
          payload: {
            tenantId,
            uuid: attachmentUuid,
            uuidType: 1, // 供应商附件标识
            problemHeaderId: detail.problemHeaderId,
          },
        }).then((res) => {
          // 返回版本号
          if (res) {
            dispatch({
              type: 'create8D/updateState',
              payload: {
                detail: {
                  ...detail,
                  objectVersionNumber: res,
                  attachmentUuid,
                },
              },
            });
          }
        });
      }
      if (!detail.attachmentInterUuid) {
        dispatch({
          type: 'create8D/saveUUID',
          payload: {
            tenantId,
            uuid: attachmentInterUuid,
            uuidType: 3,
            problemHeaderId: detail.problemHeaderId,
          },
        }).then((res) => {
          // 返回版本号
          if (res) {
            dispatch({
              type: 'create8D/updateState',
              payload: {
                detail: {
                  ...detail,
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
    const uuid = detail.attachmentUuid || attachmentUuid;
    const uuidInter = detail.attachmentInterUuid || attachmentInterUuid;
    this.getAttachmentNum([uuid, uuidInter]);
  }

  /**
   * 附件查看
   */
  @Bind()
  handleAttachmentOption() {
    this.setState({ attachmentVisible: true });
  }

  /**
   * 明细维护
   * @param {!object} record - 8D对象
   */
  @Bind()
  handleEdit8D(record = {}) {
    const { dispatch, tenantId } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/create8D/detail/${
          record.problemHeaderId || record.associateProblemHeaderId
        }`,
      })
    );
    dispatch({
      type: 'create8D/fetchDetail',
      payload: {
        tenantId,
        problemHeaderId: record.problemHeaderId || record.associateProblemHeaderId,
      },
    });
  }

  /**
   * 关联8D跳转
   * @param {!object} record - 8D对象
   */
  @Bind()
  handlCorrlation8D(record = {}) {
    const { dispatch } = this.props;
    const { id } = this.state;
    const { problemHeaderId, associateProblemHeaderId } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sqam/create8D/detail8D/${problemHeaderId || associateProblemHeaderId}`,
        search: id ? stringify({ problemHeaderId: id }) : {},
      })
    );
  }

  // 查询关联8D
  @Bind()
  fetchCorrelation(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'create8D/relation8D',
      payload: {
        tenantId,
        problemHeaderId: id,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.CORRELATION_8D_LIST',
        page,
      },
    }).then((res) => {
      if (res) {
        const arr = isArray(res) ? res : res?.content || [];
        this.setState({
          correlationList: arr.map((item) => ({
            rowKey: uuidv4(),
            ...item,
          })),
        });
      }
    });
  }

  /**
   * 删除行数据
   */
  @Bind()
  deleteTeamMembers() {
    const { teamMembersList, selectedRowKeys } = this.state;
    const deleteList = [];
    const createList = [];
    teamMembersList.forEach((item) => {
      if (selectedRowKeys.includes(item.rowKey)) {
        if (item._status === 'update') {
          const deleteItem = omit(item, ['$form', 'rowKey', '_status']);
          deleteList.push({ ...deleteItem, optcamp: 'PURCHASER' });
        } else if (item._status === 'create') {
          createList.push(item.rowKey);
        }
      }
    });
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.remove`).d('确定删除选中数据'),
      onOk: () => {
        if (!isEmpty(deleteList)) {
          if (this.isUpdata() || teamMembersList.some((item) => item._status === 'create')) {
            Modal.confirm({
              title: intl
                .get(`hzero.common.validation.nowDataNotSave`)
                .d(`当前数据有未保存。继续操作将造成数据丢失，是否继续？`),
              onOk: () => this.handleDelete(deleteList),
            });
          } else {
            this.handleDelete(deleteList);
          }
        } else if (!isEmpty(createList)) {
          const newTeamMembersList = teamMembersList.filter((item) => {
            return !createList.includes(item.rowKey);
          });
          this.setState({
            teamMembersList: newTeamMembersList,
            selectedRowKeys: [],
          });
          this.setUpdate('deleteLine', selectedRowKeys);
        }
      },
    });
  }

  // 执行删除
  @Bind()
  handleDelete(deleteList = []) {
    const { dispatch, tenantId } = this.props;
    const deleteLines = deleteList.map((item) => omit(item, ['$form', 'rowKey', '_status']));
    dispatch({
      type: 'create8D/deleteTeamMembers',
      payload: {
        tenantId,
        deleteLines,
        optcamp: 'PURCHASER',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.queryTeamMembers();
      }
    });
  }

  // 查询小组成员列表
  @Bind()
  queryTeamMembers() {
    const { dispatch, tenantId, create8D, remote: remoteProps } = this.props;
    const { id } = this.state;
    const addFieldRemote = remoteProps
      ? remoteProps.process(
          'SQAM_CREATE8D_DETAIL_CUX_ADD_TEAM_MEMBER_DEFAULT',
          {},
          {
            state: this.state,
          }
        )
      : {};
    if (!isUndefined(id)) {
      dispatch({
        type: 'create8D/queryTeamMembers',
        payload: {
          tenantId,
          problemHeaderId: id,
          unitCode: 'SQAM.CREATE_8D_DETAIL.GROUPMEMBER',
        },
      }).then((res) => {
        if (res) {
          this.setState({
            teamMembersList: res.map((item) => ({
              rowKey: uuidv4(),
              _status: 'update',
              ...item,
              ...addFieldRemote,
            })),
          });
        }
      });
    } else {
      dispatch({
        type: 'create8D/fetchLovSql',
        payload: {
          lovCode: 'SQAM.TENANT_USER',
          userId: getCurrentUserId(),
        },
      }).then((res = {}) => {
        const { idd = [] } = create8D;

        this.setState({ creatorInfo: res.content ? res.content : [] }, () => {
          const defaultList = this.state.creatorInfo.map((item) => ({
            rowKey: uuidv4(),
            _status: 'create',
            memberUserId: item.id,
            memberLoginName: item.loginName,
            memberName: item.realName,
            email: item.email,
            leaderFlag: 1,
            phone: item.phone,
            internationalTelCode: (idd && idd[0]?.value) || '+86',
            ...addFieldRemote,
          }));
          this.setState({ teamMembersList: defaultList });
        });
      });
    }
  }

  // 新建小组成员
  @Bind()
  handleAdd() {
    const { teamMembersList } = this.state;
    const { remote: remoteProps } = this.props;
    const defaultField = {
      _status: 'create',
      rowKey: uuidv4(),
    };
    const addField = remoteProps
      ? remoteProps.process('SQAM_CREATE8D_DETAIL_CUX_ADD_TEAM_MEMBER', defaultField, {
          state: this.state,
        })
      : defaultField;
    const newTeamMembersList = [addField, ...teamMembersList];
    this.setState({ teamMembersList: newTeamMembersList });
  }

  // 选中行onchange
  @Bind()
  onRowSelectedChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  @Bind()
  handleSelectChange(code) {
    if (!code) return;
    const { dispatch, form } = this.props;
    const { setFieldsValue } = form;
    dispatch({
      type: 'create8D/fetchDefectTypDe',
      payload: code,
    });
    setFieldsValue({ problemDefectType: undefined });
  }

  /**
   * 添加选中行到状态树
   * @param {arr} selectedRowKeys
   */
  @Bind()
  handleSourceRowChange(selectedSourceKeys) {
    this.setState({
      selectedSourceKeys,
    });
  }

  @Bind()
  handleOrderRowChange(selectedOrderKeys, selectedOrderRows) {
    this.setState({
      selectedOrderKeys,
      selectedOrderRows,
    });
  }

  @Bind()
  handleDelOrder() {
    const { selectedOrderRows } = this.state;
    const { dispatch, tenantId } = this.props;
    Modal.confirm({
      title: intl.get(`sqam.common.view.message.confirm.deleteFlag`).d('是否确认删除'),
      onOk: () => {
        dispatch({
          type: 'create8D/delPurchaseOrder',
          payload: {
            tenantId,
            list: selectedOrderRows,
          },
        }).then((res) => {
          if (res) {
            this.handleSearch();
            notification.success();
          }
        });
      },
    });
  }

  /**
   * 删除来源信息行
   */
  @Bind()
  handleDeleteSource() {
    const { selectedSourceKeys } = this.state;
    const {
      dispatch,
      tenantId,
      create8D: { sourceInfolist = [] },
    } = this.props;
    const newData = [];
    const deleteData = [];
    sourceInfolist.forEach((item) => {
      if (!selectedSourceKeys.includes(item.inspectionId)) {
        newData.push(item);
      } else if (item._status !== 'create') {
        deleteData.push(omit(item, ['$form']));
      }
    });
    Modal.confirm({
      title: intl.get(`sqam.common.view.message.confirm.deleteFlag`).d('是否确认删除'),
      onOk: () => {
        if (!isEmpty(deleteData)) {
          dispatch({
            type: 'create8D/deleteSourceInfo',
            payload: {
              tenantId,
              body: deleteData,
            },
          });
        }
        dispatch({
          type: 'create8D/updateState',
          payload: {
            sourceInfolist: newData,
          },
        });
        this.changeDetailValue();
        this.setState({ selectedSourceKeys: [] });
      },
    });
  }

  @Bind()
  handleAddSource(lovRecord) {
    const {
      dispatch,
      create8D: { sourceInfolist = [] },
    } = this.props;
    if (sourceInfolist.map((item) => item.inspectionId).includes(lovRecord.inspectionId)) {
      notification.warning({
        message: `${lovRecord.inspectionNum}${intl
          .get('sqam.createRectification.view.message.repeat')
          .d(`已存在，请勿重复添加`)}`,
      });
    } else {
      dispatch({
        type: 'create8D/updateState',
        payload: {
          sourceInfolist: [...sourceInfolist, { ...lovRecord }],
        },
      });
    }
  }

  @Bind()
  handleSetItemName(record) {
    const {
      dispatch,
      create8D: { detail = {} },
      form: { registerField, setFieldsValue },
    } = this.props;
    registerField('itemId');
    setFieldsValue({
      itemId: record.itemId,
      itemName: record.itemName,
      model: record.model,
      specifications: record.specifications,
    });
    dispatch({
      type: 'create8D/updateState',
      payload: {
        detail: {
          ...detail,
          itemName: record.itemName,
          model: record.model,
          specifications: record.specifications,
        },
      },
    });
  }

  @Bind()
  tabChange(activeKey) {
    this.setState({
      activeKey,
    });
  }

  @Bind()
  handleResetLeader(val, record) {
    const { teamMembersList } = this.state;
    if (val) {
      record.$form.setFieldsValue({ visibleFlag: 0 });
      teamMembersList.forEach((item) => {
        item.$form.setFieldsValue({
          leaderFlag: item.rowKey === record.rowKey ? 1 : 0,
        });
      });
    }
  }

  @Bind()
  handleModal(visible, flag) {
    this.setState({ [visible]: flag });
  }

  @Bind()
  tabTextRender(type) {
    const { newFlag, correlationList = [] } = this.state;
    const { create8D = {} } = this.props;
    const {
      sourceInfolist = [],
      purchaseOrderList = [],
      quoteTrxList = [],
      siteInvestigateReportList = [],
      evalDataSource = [],
      relation8DPagination,
      siteEvalReportPage,
    } = create8D;
    const textObj = {
      rectification: {
        tab: intl.get(`${prefix}.tab.relatedRectification`).d(`关联整改报告`),
        count: relation8DPagination?.total || correlationList?.length,
        content: intl
          .get(`sqam.common.view.message.relateRectificationAfterSaved`)
          .d('点击保存创建整改报告后可关联质量整改报告'),
      },
      inspect: {
        count: sourceInfolist?.length,
        tab: intl.get(`${prefix}.tab.qualityInspect`).d(`关联质检单`),
        content: null,
      },
      purchaseOrder: {
        count: purchaseOrderList?.length,
        tab: intl.get(`${prefix}.tab.relatedPurchaseOrder`).d(`关联采购订单`),
        content: intl
          .get(`sqam.common.view.message.relatePurchaseOrderAfterSaved`)
          .d('点击保存创建整改报告后可关联采购订单'),
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
    const { count, tab, content } = textObj[type] || {};
    const tabHtml = (
      <span style={newFlag ? {} : { color: '#4c4c4c' }}>
        {tab}
        <strong style={{ padding: '5px', color: '#29BECE' }}>{count}</strong>
      </span>
    );
    return newFlag ? <Popover content={content}>{tabHtml}</Popover> : tabHtml;
  }

  // @Bind()
  // handleEvaluationSearch(fields = {}) {
  //   const { tenantId, dispatch } = this.props;
  //   const { problemHeaderId } = this.state;
  //   dispatch({
  //     type: 'create8D/fetchList',
  //     payload: {
  //       tenantId,
  //       page: isEmpty(fields) ? {} : fields,
  //       pageEntryPoint: 'CUSTOMER_OWNED',
  //       problemHeaderId,
  //       // source: 'purchase',
  //     },
  //   });
  // }
  @Bind()
  handleEvaluationSearch(problemHeaderId) {
    const { tenantId, dispatch } = this.props;
    dispatch({
      type: 'create8D/fetchList',
      payload: {
        tenantId,
        problemHeaderId,
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
    const { create8DProvide = {} } = promiseMaintainProvide;
    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = create8DProvide;

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
      stateKey: 'create8DProvide',
      rowsKey: 'continueSupply',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleContinueSupplySearch();
    }
  }

  @Bind()
  async handleOtherInfoDelete() {
    const { otherInfoSelectedRowKeys, otherInfoSelectedRows } = this.state;
    const {
      create8D: { detail = {} },
    } = this.props;
    const { lineList, otherInfoPagination } = detail;

    const obj = {
      selectedRows: otherInfoSelectedRows || [],
      ModelDataSource: lineList,
      SelectedRowKeys: otherInfoSelectedRowKeys || [],
      SelectedRowKeysName: 'otherInfoId',
      dispatchTypeDelete: 'create8D/delDproblemheaderdetaillines',
      dispatchTypeUpdate: 'create8D/updateState',
      ModelDataSourceName: 'lineList',
      Pagination: otherInfoPagination,
      PaginationName: 'otherInfoPagination',
      type: 'detail',
      detail,
      rowsKey: 'otherInfo',
    };

    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleOtherInfoSearch();
    }
  }

  @Bind()
  async handleOtherInfoADelete() {
    const { otherInfoASelectedRowKeys, otherInfoASelectedRows } = this.state;
    const {
      create8D: { detail = {} },
    } = this.props;
    const { otherDetailList, otherInfoAPagination } = detail;

    const obj = {
      selectedRows: otherInfoASelectedRows || [],
      ModelDataSource: otherDetailList,
      SelectedRowKeys: otherInfoASelectedRowKeys || [],
      SelectedRowKeysName: 'otherDetailId',
      dispatchTypeDelete: 'create8D/delDproblemheaderdetaillinesA',
      dispatchTypeUpdate: 'create8D/updateState',
      ModelDataSourceName: 'otherDetailList',
      Pagination: otherInfoAPagination,
      PaginationName: 'otherInfoAPagination',
      type: 'detail',
      detail,
      rowsKey: 'otherInfoA',
    };

    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleOtherInfoSearch();
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
      type,
      detail,
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
      ...detail,
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
      payload:
        type === 'detail'
          ? {
              detail: params,
            }
          : stateKey
          ? { [stateKey]: params }
          : params,
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
  handleContinueSupplySearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'promiseMaintainProvide/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.TEMPMEASURE',
        stateKey: 'create8DProvide',
      },
    });
  }

  @Bind()
  handleOtherInfoSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      // type: 'create8D/updateState',
      type: 'create8D/fetchDetail',
      payload: {
        tenantId,
        problemHeaderId: id,
        page,
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
  async handleFollowUpDelete() {
    const { followUpSelectedRowKeys, followUpSelectedRows } = this.state;
    const { followUpProduce = {} } = this.props;
    const { create8DFollowUp = {} } = followUpProduce;
    const { followUpProduceList = [], followUpProducePagination = {} } = create8DFollowUp;
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
      stateKey: 'create8DFollowUp',
      rowsKey: 'followUp',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleFollowUpSearch();
    }
  }

  @Bind()
  handleFollowUpSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'followUpProduce/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.SHORTMEASURES',
        stateKey: 'create8DFollowUp',
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
    const { create8DReason = {} } = rootReasonAnalyze;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = create8DReason;

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
      stateKey: 'create8DReason',
      rowsKey: 'rootReason',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleRootReasonSearch();
    }
  }

  @Bind()
  handleRootReasonSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'rootReasonAnalyze/updateState',
      payload: {
        create8DReason: {
          rootReasonAnalyzeList: [],
          rootReasonAnalyzePagination: {},
        },
      },
    });
    dispatch({
      type: 'rootReasonAnalyze/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.ROOTCAUSE',
        stateKey: 'create8DReason',
      },
    });
  }

  @Bind()
  async handleForeverSolutionDelete() {
    const { foreverSolutionSelectedRowKeys, foreverSolutionSelectedRows } = this.state;
    const { foreverDealSolution = {} } = this.props;
    const { create8DSolution = {} } = foreverDealSolution;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = create8DSolution;

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
      stateKey: 'create8DSolution',
      rowsKey: 'foreverSolution',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleForeverSolutionSearch();
    }
  }

  @Bind()
  handleForeverSolutionSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'foreverDealSolution/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.PERMANENTACTION',
        stateKey: 'create8DSolution',
      },
    });
  }

  @Bind()
  async handleIsSuitUnderItemDelete() {
    const { isSuitUnderItemSelectedRowKeys, isSuitUnderItemSelectedRows } = this.state;
    const { isSuitUnderItem = {} } = this.props;
    const { create8DSuit = {} } = isSuitUnderItem;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = create8DSuit;

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
      stateKey: 'create8DSuit',
      rowsKey: 'isSuitUnderItem',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleIsSuitUnderItemSearch();
    }
  }

  @Bind()
  handleIsSuitUnderItemSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'isSuitUnderItem/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.OTHERAPPLICABLE',
        stateKey: 'create8DSuit',
      },
    });
  }

  @Bind()
  async handleStandardSolutionDelete() {
    const { relateStandardSelectedRowKeys, relateStandardSelectedRows } = this.state;
    const { relateStandard = {} } = this.props;
    const { create8DStandard = {} } = relateStandard;
    const { relateStandardList = [], relateStandardPagination = {} } = create8DStandard;

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
      stateKey: 'create8DStandard',
      rowsKey: 'relateStandard',
    };
    const isNeedRefresh = await this.handleDeleteCommonFn(obj);
    if (isNeedRefresh) {
      notification.success();
      this.handleStandardSolutionSearch();
    }
  }

  @Bind()
  handleStandardSolutionSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const { id } = this.state;
    dispatch({
      type: 'relateStandard/fetchData',
      payload: {
        tenantId,
        edProblemHeaderId: id,
        page,
        customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.STANDARDIZATION',
        stateKey: 'create8DStandard',
      },
    });
  }

  @Bind()
  headerBtns() {
    const {tenantId, loading, create8D = {}, hiddenBtnNameList = [] } = this.props;
    const { id, isApprovalShow, newFlag, cuxloading, fileNum } = this.state;
    const { detail = {} } = create8D;
    const { problemStatus } = detail || {};
    const btnLoading =
      loading?.fetch || loading?.save || loading?.release || loading?.delete || cuxloading;
    const allBtns = [
      (['NEW'].includes(problemStatus) || newFlag) &&
        !hiddenBtnNameList?.includes('save') && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            type: 'primary',
            icon: 'save',
            loading: btnLoading,
            onClick: throttle(() => this.handleSave8D('save'), 1500, { trailing: false }),
          },
        },
      (['NEW'].includes(problemStatus) || newFlag) && {
        name: 'release',
        btnComp: Button,
        child: intl.get('hzero.common.button.release').d('发布'),
        btnProps: {
          loading: btnLoading,
          icon: 'rocket',
          onClick: throttle(() => this.handleSave8D('release'), 1500, { trailing: false }),
          permissionList: [
            {
              code: `srm.sqam.business.problem.8d.create.ps.publish`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'deleteForever',
        btnComp: Button,
        child: intl.get('sqam.common.button.deleteForever').d('永久删除'),
        btnProps: {
          loading: btnLoading,
          icon: 'delete',
          onClick: throttle(() => this.handleDelete8D(), 1500, { trailing: false }),
          disabled: isUndefined(id),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.create.ps.radio.button.permanent_delete`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'delete',
        btnComp: Button,
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          loading: btnLoading,
          icon: 'delete',
          onClick: throttle(() => this.handleDelete8D(1), 1500, { trailing: false }),
          disabled: isUndefined(id),
          permissionList: [
            {
              code: `srm.sqam.business.problem.manage.create.ps.radio.button.delete`,
              type: 'button',
            },
          ],
        },
      },
      {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        btnProps: {
          buttonText: intl.get(`hzero.common.button.print`).d('打印'),
          requestUrl: `${SRM_SQAM}/v1/${tenantId}/problem-headers/list-print-new`,
          method: 'PUT',
          data: { edProblemHeaderIdList: [detail.problemHeaderId] },
          loading: btnLoading,
          disabled: newFlag || !detail.problemHeaderId,
        },
      },
      {
        name: 'attachment',
        child: `${intl
          .get('sqam.common.model.qualityRectification.attachmentUuid')
          .d('附件管理')}(${fileNum})`,
        btnProps: {
          loading: btnLoading,
          icon: 'paper-clip',
          onClick: throttle(() => this.handleAttachmentOption(), 1500, { trailing: false }),
          disabled: newFlag || !detail.problemHeaderId,
        },
      },
      {
        name: 'operate',
        child:
          (isApprovalShow ? `${intl.get('sqam.common.button.approval').d('审批')}/` : '') +
          intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          loading: btnLoading,
          icon: 'clock-circle-o',
          onClick: throttle(() => this.handleModal('operatorRecordVisible', true), 1500, {
            trailing: false,
          }),
          disabled: newFlag || !detail.problemHeaderId,
        },
      },
    ];
    return allBtns;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      id,
      user,
      newFlag,
      creatorInfo = {},
      collapseKeys,
      selectedRowKeys,
      teamMembersList,
      correlationList,
      addCorrelationList,
      selectedSourceKeys,
      selectedOrderKeys,
      activeKey,
      decisionResults,
      serverTime,
      addPurchaseOrderVisible,
      operatorRecordVisible,
      isApprovalShow,
      attachmentVisible = false,
      attachmentUuid,
      attachmentInterUuid,
      storageSize,
      continueSupplySelectedRowKeys,
      followUpSelectedRowKeys,
      rootReasonSelectedRowKeys,
      foreverSolutionSelectedRowKeys,
      isSuitUnderItemSelectedRowKeys,
      relateStandardSelectedRowKeys,
      otherInfoSelectedRowKeys,
      otherInfoASelectedRowKeys,
    } = this.state;
    const {
      tenantId,
      loading,
      evalLoading,
      form,
      create8D,
      relation8DLoading,
      fetchLineLoading,
      customizeForm,
      dispatch,
      customizeCollapse,
      location: { pathname },
      customizeTabPane,
      customizeTable,
      custLoading,
      history,
      custConfig,
      promiseMaintainProvideLoading,
      promiseMaintainProviderDeleteLoading,
      promiseMaintainProvide = {},
      followUpProduce = {},
      followUpProduceLoading,
      followUpProduceDeleteLoading,
      rootReasonAnalyze = {}, 
      rootAnalyzeLoading,
      rootAnalyzeDeleteLoading,
      foreverDealSolution = {},
      foreverSolutionLoading,
      foreverSolutionDeleteLoading,
      relateStandard = {},
      standardizingLoading,
      isSuitUnderItem = {},
      isSuitUnderItemLoading,
      isSuitUnderItemDeleteLoading,
      standardizingDeleteLoading,
      otherInfoDeleteLoading,
      otherInfoADeleteLoading,
      customizeBtnGroup,
      deleteMemberLoading,
      remote: remoteProps,
    } = this.props;
    const { create8DProvide = {} } = promiseMaintainProvide;
    const { create8DFollowUp = {} } = followUpProduce;
    const { create8DReason = {} } = rootReasonAnalyze;
    const { create8DSolution = {} } = foreverDealSolution;
    const { create8DSuit = {} } = isSuitUnderItem;
    const { create8DStandard = {} } = relateStandard;
    const {
      promiseMaintainProvideList = [],
      promiseMaintainProvidePagination = {},
    } = create8DProvide;
    const { followUpProduceList = [], followUpProducePagination = {} } = create8DFollowUp;
    const { rootReasonAnalyzeList = [], rootReasonAnalyzePagination = {} } = create8DReason;
    const { foreverDealSolutionList = [], foreverDealSolutionPagination = {} } = create8DSolution;
    const { relateStandardList = [], relateStandardPagination = {} } = create8DStandard;
    const { isSuitUnderItemList = [], isSuitUnderItemPagination = {} } = create8DSuit;
    const { edProblemAction = {}, collaborativeMode, problemStatus: status } = create8D.detail;
    const {
      idd = [],
      camp = [],
      detail = {},
      issueType = [],
      significance = [],
      urgency = [],
      defectType = [],
      problemStatus = [],
      problemSource = [],
      participantNode = [],
      sourceInfolist = [],
      purchaseOrderList = [],
      quoteTrxList = [],
      siteInvestigateReportList = [],
      siteInvestigateReportPage = {},
      siteEvalReportList = [],
      siteEvalReportPage = {},
      // evalPagination = {},
      evalDataSource = [],
      relation8DPagination,
    } = create8D;
    const {
      invOrganizationId,
      problemHeaderId,
      companyId,
      supplierCompanyId,
      extSupplierId,
      supplierTenantId,
    } = detail;
    const basicInfoProps = {
      newFlag,
      tenantId,
      form,
      user,
      problemStatus,
      problemSource,
      dataSource: detail,
      customizeForm,
      serverTime,
      onSetItemName: this.handleSetItemName,
      handleSetRecord: this.handleSetRecord,
      remoteProps,
    };
    const TeamMembersProps = {
      detail,
      form,
      idd,
      camp,
      user,
      newFlag,
      creatorInfo,
      fetchLineLoading,
      participantNode,
      selectedRowKeys,
      teamMembersList,
      customizeTable,
      handleAdd: this.handleAdd,
      deleteTeamMembers: this.deleteTeamMembers,
      onRowSelectedChange: this.onRowSelectedChange,
      onResetLeader: this.handleResetLeader,
      deleteMemberLoading,
      remoteProps,
    };
    const showBtnFlag = ['NEW'].includes(status) || newFlag;

    const CorrelationPanelProps = {
      id,
      detail,
      correlationList,
      isCreate: showBtnFlag,
      relation8DLoading,
      addCorrelationList,
      onSearch: this.handleSearch,
      onDetail: this.handlCorrlation8D,
      addCorrelation: this.addCorrelation,
      fetchCorrelation: this.fetchCorrelation,
      customizeTable,
      customCode: 'SQAM.CREATE_8D_DETAIL.CORRELATION_8D_LIST',
      pagination: relation8DPagination,
    };
    // const uploadModalProps = {
    //   tenantId,
    //   btnProps: {
    //     icon: 'paper-clip',
    //     disabled: isUndefined(id),
    //   },
    //   btnText: intl.get(`entity.attachment.tag`).d('附件'),
    //   bucketName: 'private-bucket', // 采购方附件BucketName
    //   bucketDirectory: 'sqam-ed-att',
    //   attachmentUUID:
    //     isUndefined(detail.attachmentUuid) || isNull(detail.attachmentUuid)
    //       ? uuid
    //       : detail.attachmentUuid,
    //   onCloseUploadModal: this.handleAttachmentUUID,
    //   showFilesNumber: false,
    // };

    const lovParams = {
      tenantId,
      invOrganizationId,
      createProblemFlag: 1,
      decisionResults,
      customizeUnitCode: 'SQAM.CREATE_8D_DETAIL.INSPECT',
      companyId,
      supplierCompanyId,
      supplierId: extSupplierId,
      supplierTenantId,
    };
    const sourceInfoProps = {
      dispatch,
      loading: loading.fetchSourceLoading,
      dataSource: sourceInfolist,
      rowSelection: {
        selectedRowKeys: selectedSourceKeys,
        onChange: this.handleSourceRowChange,
      },
      backPath: pathname,
      prefixToPath: '/create8D',
      code: 'SQAM.CREATE_8D_DETAIL.INSPECT',
      customizeTable,
    };
    const trxRcvProps = {
      dispatch,
      loading: loading.fetchSourceLoading,
      dataSource: quoteTrxList,
      backPath: pathname,
      prefixToPath: '/create8D',
      code: 'SQAM.CREATE_8D_DETAIL.TRX',
      customizeTable,
    };
    const siteInvestigateReport = {
      dispatch,
      loading: loading.fetchSourceLoading,
      dataSource: siteInvestigateReportList,
      dataPage: siteInvestigateReportPage,
      backPath: pathname,
      prefixToPath: '/create8D',
    };
    const siteEvalReport = {
      dispatch,
      loading: loading.fetchSourceLoading,
      dataSource: siteEvalReportList,
      dataPage: siteEvalReportPage,
      backPath: pathname,
      prefixToPath: '/create8D',
      onSearch: this.siteEvalReportHeader,
    };
    const listProps = {
      // customizeTable,
      // custLoading,
      evalLoading,
      // evalPagination,
      evalDataSource,
      history,
      // onChange: page => this.handleEvaluationSearch(page),
    };
    const addPurchaseOrderProps = {
      id,
      detail,
      visible: addPurchaseOrderVisible,
      onModal: () => this.handleModal('addPurchaseOrderVisible', false),
      onFetch: this.handleSearch,
    };
    const purchaseOrderProps = {
      rowSelection: {
        selectedRowKeys: selectedOrderKeys,
        onChange: this.handleOrderRowChange,
      },
      dataSource: purchaseOrderList,
      backPath: pathname,
      prefixToPath: '/create8D',
      history,
    };
    const operatorRecordProps = {
      remoteProps,
      isApprovalShow,
      visible: operatorRecordVisible,
      businessKey: detail.businessKey,
      problemHeaderId: detail.problemHeaderId,
      hideModal: () => this.handleModal('operatorRecordVisible', false),
      isExport: true,
    };
    const collaborativeModeFlag = remoteProps.process('SQAM.CREATE_8D_DETAIL_PROCESS_COLLABORATIVEMODE_FLAG', collaborativeMode === 'SINGLE', this.props);

    const continueSupplyProps = {
      tenantId,
      loading: promiseMaintainProvideLoading,
      deleteLoading: promiseMaintainProviderDeleteLoading,
      selectedRowKeys: continueSupplySelectedRowKeys,
      readOnly: false,
      required: false,
      pagination: promiseMaintainProvidePagination,
      edProblemHeaderId: id,
      dataSource: promiseMaintainProvideList,
      onRemove: this.handleContinueSupplyDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.TEMPMEASURE',
      custLoading,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DProvide',
    };
    const OtherInfoProps = {
      loading: loading.fetch,
      deleteLoading: otherInfoDeleteLoading,
      selectedRowKeys: otherInfoSelectedRowKeys,
      readOnly: false,
      required: true,
      pagination: detail.otherInfoPagination,
      dataSource: detail.lineList,
      onRemove: this.handleOtherInfoDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.OTHERINFO',
      custLoading,
      onSelectChange: this.handleSelectChange,
      handleSearch: this.handleSearch,
      problemHeaderId,
      importFlag: true,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.CREATE_8D_DETAIL.OTHER_BTNS',
    };
    const OtherInfoAProps = {
      loading: loading.fetch,
      deleteLoading: otherInfoADeleteLoading,
      selectedRowKeys: otherInfoASelectedRowKeys,
      readOnly: false,
      required: true,
      pagination: detail.otherInfoAPagination,
      dataSource: detail.otherDetailList || [],
      onRemove: this.handleOtherInfoADelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.OTHERINFO_A',
      custLoading,
      onSelectChange: this.handleSelectChange,
      handleSearch: this.handleSearch,
      problemHeaderId,
      customizeBtnGroup,
      btnCustomCode: 'SQAM.CREATE_8D_DETAIL.OTHER_BTNS_A',
    };
    const followUpProduceProps = {
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.SHORTMEASURES',
      custLoading,
      loading: followUpProduceLoading,
      deleteLoading: followUpProduceDeleteLoading,
      selectedRowKeys: followUpSelectedRowKeys,
      readOnly: false,
      required: false,
      pagination: followUpProducePagination,
      edProblemHeaderId: id,
      dataSource: followUpProduceList,
      onRemove: this.handleFollowUpDelete,
      onSelectRow: this.handleCommonRowSelection,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DFollowUp',
    };
    const rootAnalyzeProps = {
      loading: rootAnalyzeLoading,
      deleteLoading: rootAnalyzeDeleteLoading,
      edProblemHeaderId: id,
      selectedRowKeys: rootReasonSelectedRowKeys,
      readOnly: false,
      required: false,
      pagination: rootReasonAnalyzePagination,
      dataSource: rootReasonAnalyzeList,
      onRemove: this.handleRootReasonDelete,
      onSelectRow: this.handleCommonRowSelection,
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.ROOTCAUSE',
      custLoading,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DReason',
    };
    const remedialActionProps = {
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.PERMANENTACTION',
      custLoading,
      loading: foreverSolutionLoading,
      deleteLoading: foreverSolutionDeleteLoading,
      selectedRowKeys: foreverSolutionSelectedRowKeys,
      readOnly: false,
      required: false,
      edProblemHeaderId: id,
      pagination: foreverDealSolutionPagination,
      dataSource: foreverDealSolutionList,
      onRemove: this.handleForeverSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DSolution',
    };
    const isSuitUnderItemProps = {
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.OTHERAPPLICABLE',
      custLoading,
      loading: isSuitUnderItemLoading,
      deleteLoading: isSuitUnderItemDeleteLoading,
      selectedRowKeys: isSuitUnderItemSelectedRowKeys,
      readOnly: false,
      required: false,
      edProblemHeaderId: id,
      pagination: isSuitUnderItemPagination,
      dataSource: isSuitUnderItemList,
      onRemove: this.handleIsSuitUnderItemDelete,
      onSelectRow: this.handleCommonRowSelection,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DSuit',
    };
    const questionProps = {
      form,
      issueType,
      onSelectChange: this.handleSelectChange,
      significance,
      urgency,
      defectType,
      dataSource: detail,
      customizeForm,
    };
    const standardizingProps = {
      customizeTable,
      code: 'SQAM.CREATE_8D_DETAIL.STANDARDIZATION',
      custLoading,
      loading: standardizingLoading,
      deleteLoading: standardizingDeleteLoading,
      selectedRowKeys: relateStandardSelectedRowKeys,
      readOnly: false,
      required: false,
      edProblemHeaderId: id,
      pagination: relateStandardPagination,
      dataSource: relateStandardList,
      onRemove: this.handleStandardSolutionDelete,
      onSelectRow: this.handleCommonRowSelection,
      collaborativeModeFlag,
      type: 'create',
      stateKey: 'create8DStandard',
    };
    const congratulationProps = {
      code: 'SQAM.CREATE_8D_DETAIL.TEAMCONGRATULATIONS',
      customizeForm,
      custLoading,
      readOnly: false,
      congratulations: edProblemAction || {},
      onRef: this.handleBindRef,
    };

    // 附件组件传递参数
    const attachmentProps = {
      tenantId,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      storageSize,
      purchaserDirectory: 'sqam-ed-att',
      supplerDirectory: 'sqam-ed-supplieratt',
      interPurchaseDirectory: 'sqam-ed-inter-att',
      loading: loading.attachment,
      visible: attachmentVisible,
      attachmentUuid: detail.attachmentUuid ? detail.attachmentUuid : attachmentUuid,
      attachmentInterUuid: detail.attachmentInterUuid
        ? detail.attachmentInterUuid
        : attachmentInterUuid,
      onCancel: this.handleAttachmentModalHidden,
      model: 'create8D',
    };
    const _linkList = [
      {
        code: 'b',
        key: `sqam-create8D-panel-basic`,
        title: intl.get(`${prefix}.panel.basic`).d('基本信息'),
      },
      {
        code: 'c',
        key: `sqam-create8D-panel-question`,
        title: intl.get(`${prefix}.panel.question`).d('问题描述'),
      },
      {
        code: 'd',
        key: `sqam-create8D-panel-groupMember`,
        title: intl.get(`${prefix}.panel.groupMember`).d('小组成员'),
      },
      id && {
        code: 'e',
        key: `sqam-create8D-panel-promiseMaintainProvide`,
        title: intl.get(`${prefix}.panel.promiseMaintainProvide`).d('临时围堵措施—保证持续供货'),
      },
      id && {
        code: 'f',
        key: `sqam-create8D-panel-shortMeature`,
        title: intl.get(`${prefix}.panel.shortMeature`).d('短期措施'),
      },
      id && {
        code: 'g',
        key: `sqam-create8D-panel-analyzeReason`,
        title: intl.get(`${prefix}.panel.analyzeReason`).d('根本原因分析'),
      },
      id && {
        code: 'h',
        key: `sqam-create8D-panel-foreverDealSolution`,
        title: intl.get(`${prefix}.panel.foreverDealSolution`).d('永久纠正措施'),
      },
      id && {
        code: 'i',
        key: `sqam-create8D-panel-standard`,
        title: intl.get(`${prefix}.panel.standard`).d('相关标准化'),
      },
      id && {
        code: 'j',
        key: `sqam-create8D-panel-congratulation`,
        title: intl.get(`${prefix}.panel.congratulation`).d('小组祝贺'),
      },
      id && {
        code: 'k',
        key: `sqam-create8D-panel-applyItem`,
        title: intl.get(`${prefix}.panel.applyItem`).d('是否适用以下项目'),
      },
      id && {
        code: 'l',
        key: `sqam-create8D-panel-effectTrack`,
        title: intl.get(`${prefix}.panel.effectTrack`).d('成效追踪'),
      },
      {
        code: 'm',
        key: `sqam-create8D-panel-otherInfo`,
        title: intl.get(`${prefix}.panel.otherInfo`).d('其他信息'),
      },
      {
        code: 'n',
        key: `sqam-create8D-panel-otherInfoA`,
        title: intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A'),
      },
    ].filter((item) => item);
    const otherProps = {};
    const linkList = remoteProps
      ? remoteProps.process('SQAM.CREATE_8D_DETAIL.COLLAPSE_FIELDS', _linkList, otherProps)
      : _linkList;
    const collapseCode = newFlag
      ? 'SQAM.CREATE_8D_DETAIL.CREATE.COLLAPSE'
      : 'SQAM.CREATE_8D_DETAIL.COLLAPSE';
    const loadingSpin = newFlag ? loading.fetchUserIDLoading : loading.fetch;
    return (
      <React.Fragment>
        <Header
          title={intl.get(`${prefix}.qualityRectification.update`).d('质量整改报告维护')}
          backPath="/sqam/create8D/list"
        >
          {customizeBtnGroup(
            { code: 'SQAM.CREATE_8D_DETAIL.BTNS', pro: true },
            <DynamicButtons buttons={this.headerBtns()} />
          )}
        </Header>
        <div className="sqam-detail-content" id="sqam-create8D-detail-content-inner-wrapper">
          <Content className={classNames(styles['page-content'])}>
            <Spin spinning={loadingSpin} wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}>
              {customizeCollapse(
                {
                  code: newFlag
                    ? 'SQAM.CREATE_8D_DETAIL.CREATE.COLLAPSE'
                    : 'SQAM.CREATE_8D_DETAIL.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className="form-collapse"
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Collapse.Panel
                    id="sqam-create8D-panel-basic"
                    className={styles['purchase-application']}
                    showArrow={false}
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
                    {customizeTabPane(
                      { code: 'SQAM.CREATE_8D_DETAIL.BASIC_TABS' },
                      <Tabs
                        onChange={this.tabChange}
                        activeKey={activeKey}
                        animated={false}
                        className={styles['reset-disabled-tab-pointer']}
                      >
                        <TabPane
                          tab={
                            <span style={{ color: '#4c4c4c' }}>
                              {intl.get(`${prefix}.tab.basicInfo`).d('基础信息')}
                            </span>
                          }
                          key="basicInfo"
                        > 
                          <BasicInfoForm {...basicInfoProps} tenantId={this.props.tenantId} />
                        </TabPane>
                        <TabPane
                          disabled={newFlag}
                          tab={this.tabTextRender('rectification')}
                          key="rectification"
                        >
                          <CorrelationPanel {...CorrelationPanelProps} />
                        </TabPane>
                        <TabPane
                          disabled={newFlag}
                          tab={this.tabTextRender('purchaseOrder')}
                          key="purchaseOrder"
                        >
                          {showBtnFlag && (
                            <Form layout="inline">
                              <Button
                                type="primary"
                                onClick={throttle(
                                  () => this.handleModal('addPurchaseOrderVisible', true),
                                  1500,
                                  { trailing: false }
                                )}
                              >
                                {intl.get(`hzero.common.button.create`).d('新建')}
                              </Button>
                              <Button
                                onClick={throttle(this.handleDelOrder, 1500, { trailing: false })}
                                disabled={isEmpty(selectedOrderKeys)}
                              >
                                {intl.get(`hzero.common.button.delete`).d('删除')}
                              </Button>
                            </Form>
                          )}
                          <PurchaseOrderPanel {...purchaseOrderProps} />
                        </TabPane>
                        {detail.sourceCode === 'INCOMING_INSPECTION' && (
                          <TabPane tab={this.tabTextRender('inspect')} key="inspect">
                            {showBtnFlag && (
                              <Form layout="inline">
                                <Lov
                                  isButton
                                  type="primary"
                                  code="SQAM.INCOMING_INSPECTION"
                                  queryParams={{ ...lovParams }}
                                  onChange={(_, lovRecord = {}) => this.handleAddSource(lovRecord)}
                                >
                                  {intl.get(`hzero.common.button.create`).d('新建')}
                                </Lov>
                                <Button
                                  onClick={throttle(this.handleDeleteSource, 1500, {
                                    trailing: false,
                                  })}
                                  disabled={isEmpty(selectedSourceKeys)}
                                >
                                  {intl.get(`hzero.common.button.delete`).d('删除')}
                                </Button>
                              </Form>
                            )}
                            <SourceInfo {...sourceInfoProps} />
                          </TabPane>
                        )}
                        {detail.sourceCode === 'TRX_RCV_LINE' && (
                          <TabPane tab={this.tabTextRender('trxInspect')} key="trxInspect">
                            <TrxQuoteList {...trxRcvProps} />
                          </TabPane>
                        )}
                        {detail.sourceCode === 'SITE_EVAL' && (
                          <TabPane
                            tab={this.tabTextRender('siteInvestigateReport')}
                            key="siteInvestigateReport"
                          >
                            <SiteInvestigate {...siteInvestigateReport} />
                          </TabPane>
                        )}
                        {detail.sourceCode === 'REPORT_EVAL' && (
                          <TabPane tab={this.tabTextRender('siteEval')} key="siteEval">
                            <SiteEval {...siteEvalReport} />
                          </TabPane>
                        )}
                        {detail.sourceCode === 'KPI_EVAL' && (
                          <TabPane
                            tab={this.tabTextRender('supEvaluationFile')}
                            key="supEvaluationFile"
                          >
                            <EvaluationList {...listProps} />
                          </TabPane>
                        )}
                      </Tabs>
                    )}
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-create8D-panel-question"
                    showArrow={false}
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
                    {/* 等个性化数据查询后加载，避免先加载后隐藏面板后，保存还是会被校验的情况 */}
                    {Object.keys(custConfig).length > 0 && !loadingSpin && (
                      <QuestionForm {...questionProps} />
                    )}
                  </Collapse.Panel>
                  <Collapse.Panel
                    id="sqam-create8D-panel-groupMember"
                    className={styles['purchase-application']}
                    showArrow={false}
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
                    <TeamMembers {...TeamMembersProps} />
                  </Collapse.Panel>
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-promiseMaintainProvide"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-shortMeature"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-analyzeReason"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-foreverDealSolution"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-applyItem"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-standard"
                      showArrow={false}
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
                  {id && (
                    <Collapse.Panel
                      id="sqam-create8D-panel-congratulation"
                      showArrow={false}
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
                  <Collapse.Panel
                    id="sqam-create8D-panel-otherInfo"
                    showArrow={false}
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
                    id="sqam-create8D-panel-otherInfoA"
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>{intl.get(`sqam.common.view.panel.otherInfoA`).d('其他信息-A')}</h3>
                        <a>
                          {collapseKeys.includes('n')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('n') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="n"
                  >
                    <OtherInfoA {...OtherInfoAProps} />
                  </Collapse.Panel>
                </Collapse>
              )} 
            </Spin>
            <FixedAnchor
              linkList={linkList}
              className="sqam-create8D-detail-content-inner-wrapper"
              code={collapseCode}
              customizeCollapse={customizeCollapse}
              unitConfig={custConfig[collapseCode]}
            />
          </Content>
        </div>
        {addPurchaseOrderVisible && <AddPurchaseOrderModal {...addPurchaseOrderProps} />}
        {operatorRecordVisible && <OperatorRecord {...operatorRecordProps} />}
        {attachmentVisible && <AttachmentModal {...attachmentProps} />}
      </React.Fragment>
    );
  }
}
 