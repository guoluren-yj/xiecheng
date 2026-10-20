/**
 * Qualified - 供应商生命周期配置 - 合格申请单查询界面
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, createRef } from 'react';
import { Form, Tabs, Spin, Modal, Tag } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import { isEmpty, isString, isUndefined, concat, uniqBy, isFunction, isBoolean } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import qs from 'querystring';
import Bind from 'lodash-decorators/bind';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  mergeScorerDataSource,
  queryScoreInfo,
  queryScorer,
  addScorerInfo,
  saveScorerInfo,
  deleteScorerInfo,
  cleanState,
  emptyTemplate,
  batchMaintainGrader,
  queryPurchaseHistory,
  queryPurchaseHeader,
  queryPurchaseLines,
  querySupplierClassification,
  deleteClassify,
  backScoreSave,
  stageSourceKey,
} from '@/routes/SupplierLife/utils';
import remote from 'hzero-front/lib/utils/remote';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import SupplierRelatedDocBtn from '@/routes/SupplierLife/SupplierRelatedDoc';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { aiApprove, fetchApproveStatus } from '@/services/commonService';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { checkSupLifesupplierCtgAlter } from '@/services/commonApplicationService';
import QualifiedHeader from './Header';
import HeaderBtns from './HeaderBtns';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';
import SupplyAbilityTable from '../Components/Detail/SupplyAbilityTable';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import SiteInvestigate from '../Components/Detail/SiteInvestigateTable';
import BackScore from '../Components/BackScore';

import PurchaseInform from '../Components/PurchaseInform';
import OperationsRecordModal from '../Components/OperationsRecordModal';

const { confirm } = Modal;

// 供货能力清单code
const abilityUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
];
// 大查询所需的个性化code
const queryUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_LN',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SUP_CLASSIFY_TABLE',
];
// 保存所需的个性化code
const saveUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_LN',
  'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SUP_CLASSIFY_TABLE',
];

@connect(({ loading, qualifiedApplication, commonApplication, user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    user,
    commonApplication,
    qualifiedApplication,
    organizationId: getCurrentOrganizationId(),
    isCreateUser: user.currentUser.id === qualifiedApplication.qualifiedInfo.createdBy,
    scorerLoading: loading.effects['commonApplication/queryScorer'],
    queryLoading:
      loading.effects['commonApplication/queryLifecycleInfo'] ||
      loading.effects['commonApplication/querySupplierClassification'] ||
      loading.effects['qualifiedApplication/querySupplierAbility'] ||
      loading.effects['commonApplication/queryPurchaseData'] ||
      loading.effects['qualifiedApplication/queryQualifiedDetail'] ||
      loading.effects['commonApplication/queryPurchaseHeader'] ||
      loading.effects['commonApplication/queryPurchaseLines'],
    operateLoading:
      loading.effects['qualifiedApplication/saveQualified'] ||
      loading.effects['qualifiedApplication/queryQualifiedDetail'] ||
      loading.effects['qualifiedApplication/submitQualified'] ||
      loading.effects['qualifiedApplication/scoreQualified'] ||
      loading.effects['qualifiedApplication/deleteQualified'] ||
      loading.effects['qualifiedApplication/obsoletedQualified'] ||
      loading.effects['commonApplication/queryQualifiedScoreInfo'],
    templateLoading: loading.effects['commonApplication/queryQualifiedScoreInfo'],
    siteInvestigateLoading: loading.effects['qualifiedApplication/queryManageList'],
    deleteScorerLoading: loading.effects['commonApplication/deleteScorer'],
    saveScorerLoading: loading.effects['commonApplication/saveScorer'],
    printLoading: loading.effects['qualifiedApplication/handleAsnPrint'],
    deleteClassifyLoading: loading.effects['commonApplication/deleteClassify'],
    queryScoreLoading: loading.effects['qualifiedApplication/queryScoreInfo'],
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sslm.commonApplication',
    'sslm.supplierReview',
    'sslm.common',
    'sslm.supplierInform',
    'spfm.importErp',
    'sslm.supplierDetail',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_BTNGROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_LN',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SUP_CLASSIFY_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_RELATED_BTN_FROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_BTN_GROUP', // 评分信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_CLASSIFY_BTN_GROUP', // 供应商分类按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_BTN_GROUP', // 附件信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_PUR_BTN_GROUP', // 采购财务按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER_BTNGROUP', // 合格申请单头-按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_ATTACHMENT', // 供货能力行附件
  ],
})
@remote(
  {
    code: 'SSLM_SUPPlIERLIFE_QUALIFIED', // 德康src-26781 二开埋点
    name: 'qualifiedRemote',
  },
  {
    events: {
      cuxHandleExtraEvents() {}, // 增加额外的二开事件
      cuxHandleSubmit() {}, // 提交审批增加二开逻辑
      cuxHandleInitEvents() {}, // 增加单据生成后的初始化事件
      cuxInitQuery() {}, // 二开新增页签的查询
      cuxWorkflowApproved() {}, // 工作流审批通过回调
    },
  }
)
export default class Qualified extends PureComponent {
  constructor(props) {
    super(props);
    const { location, match, dispatch } = props;
    const isPub = location.pathname.includes('/pub/'); // 判断是否为pub页面
    const readOnly = location.pathname.match('/qualified-view');
    const basePath = match.path.substring(0, match.path.indexOf('/qualified'));
    const queryParams = qs.parse(location.search.substr(1));
    const {
      companyId,
      partnerCompanyId,
      tenantId,
      partnerTenantId,
      supplierCompanyId,
      spfmCompanyId,
      spfmPartnerCompanyId,
      changeReqId,
      pubEdit = 0,
      sourceType,
    } = queryParams;
    const returnPath = match.path.substring(0, match.path.indexOf('/qualified-view'));
    const backPath = queryParams.gradeCode
      ? `${returnPath}/supplier-detail?${qs.stringify({
          tenantId,
          companyId,
          partnerCompanyId,
          partnerTenantId,
          supplierCompanyId,
          spfmCompanyId,
          spfmPartnerCompanyId,
          changeReqId,
        })}`
      : queryParams.requisitionId
      ? `${basePath}/stage/${queryParams.toStageId}`
      : basePath;
    this.state = {
      readOnly,
      backPath,
      sourceType,
      requisitionId: queryParams.requisitionId, // 申请单 id
      templateId: null, // 评分模板 id
      fileList: [], // 上传附件列表
      isPub,
      batchGraderFlag: true, // 批量维护评分人是否显示
      operationsRecordVisible: false,
      tableList: [], // 用于配置表
      pubEditFlag: !!Number(pubEdit), // 判断工作流是否可编辑
      modelTableLoading: false, // 模型表loading 先用一个loading后续可能需要多个
      cuxBtnLoading: false, // 埋点按钮loading
      reviewIsClick: false, // 记录【智能预审】按钮是否点击了
      aiApproveStatus: null, // 智能预审状态
    };
    emptyTemplate(dispatch);
  }

  scoreInfoTable; // 评分信息列表 ref

  getCuzDataSource = []; // 缓存个性化页签数据

  queryCuzData = []; // 缓存个性化页签查询方法

  remoteRef = {}; // 二开新增页签的ref

  timerRef = createRef(null); // 定时器

  timerTime = createRef(0); // 记录轮询次数

  getSnapshotBeforeUpdate(prevProps) {
    const { supplierCompanyId, requisitionId } = qs.parse(prevProps.location.search.substr(1));
    const { supplierCompanyId: newSupplierCompanyId, requisitionId: newRequisitionId } = qs.parse(
      this.props.location.search.substr(1)
    );
    const changeFlag =
      supplierCompanyId !== newSupplierCompanyId || requisitionId !== newRequisitionId;
    return changeFlag;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.clearData();
      this.loadData();
    }

    const { reviewIsClick } = this.state;
    const { reviewIsClick: prevReviewIsClick } = prevState;
    if (reviewIsClick !== prevReviewIsClick) {
      this.timerRef.current = setInterval(() => this.getAiApproveResult(), 5000);
    }
  }

  componentDidMount() {
    const { onLoad, qualifiedRemote } = this.props;
    const { pubEditFlag } = this.state;
    this.init();
    this.loadData();
    // 查询配置表
    queryRelTableConfig('sslm_life_cycle_qualified_req').then(res => {
      this.setState({
        tableList: res,
      });
    });
    // 处理工作流审批保存
    if (isFunction(onLoad) && pubEditFlag) {
      onLoad({
        submit: approveResult => {
          return new Promise(async (resolve, reject) => {
            if (approveResult === 'Approved') {
              // 默认返回true,当返回false时走二开逻辑不走标准逻辑
              const cuxRes = await qualifiedRemote.event.fireEvent('cuxWorkflowApproved', {
                _this: this,
              });
              if (!cuxRes) {
                return;
              }
              this.saveOrReviewOrSubmit('save', {}, resolve, reject);
            } else {
              resolve();
            }
          });
        },
      });
    }
  }

  componentWillUnmount() {
    this.clearData();
    this.clearTimerRef();
  }

  @Bind()
  handleRemoteRef(key, node) {
    this.remoteRef[key] = node;
  }

  /**
   * 清空model
   */
  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualifiedApplication/updateState',
      payload: {
        qualifiedInfo: {},
        scorerList: [],
        editScorerList: [],
        attachmentList: [],
        abilityInfo: {},
        scoreInfoList: [],
        qualifiedSupRecList: [],
        manageList: [], // 现场考察列表
        manageListPagination: {}, // 现场考察列表分页
        abilityInfoData: [],
        supplierClassifyList: [], // 供应商分类列表
      },
    });
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        code: {}, // 值集集合
        lifecycleInfo: {}, // 供应商生命周期头信息
        supplierClassifyData: [], // 供应商列表信息
        scoreInfo: [], // 评分信息
        scorerList: [], // 合格申请评分人列表
        editScorerList: [], // 编辑中的合格申请评分人列表
        purchaseHeadInfo: {}, // 头数据源
        purchaseList: [], // 行数据源
        purchaseListPagination: {}, // 行分页参数
      },
    });
  }

  /**
   * 查询模型表数据
   */
  @Bind()
  fetchModelTableData(requisitionId) {
    const { tableList } = this.state;
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable({}, requisitionId);
      }
    });
  }

  /**
   * 查询页面初始数据
   */
  @Bind()
  loadData() {
    const { dispatch, location, qualifiedRemote } = this.props;
    const queryParams = qs.parse(location.search.substr(1));
    const { requisitionId } = queryParams;
    if (requisitionId || requisitionId === 0) {
      this.queryDetail(requisitionId);
    } else {
      // 查询申请单所需供应商信息
      dispatch({
        type: 'commonApplication/queryLifecycleInfo',
        payload: {
          ...queryParams,
          customizeUnitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER'],
        },
      }).then(res => {
        if (!isEmpty(res)) {
          const {
            requisitionId: newRequisitionId,
            companyId,
            supplierCompanyId,
            supplierTenantId,
          } = res;
          this.setState({
            requisitionId: newRequisitionId,
          });

          if (newRequisitionId || newRequisitionId === 0) {
            this.queryDetail(newRequisitionId);
          } else {
            // 查询”供应商分类“历史数据
            querySupplierClassification({ dispatch, supplierCompanyId, supplierTenantId });
            // 查询”供应商供货能力“历史数据
            this.querySupplierAbility();
            // 查询”采购/财务“历史数据
            queryPurchaseHistory({ dispatch, companyId, supplierCompanyId });
            // 查询现场考察
            this.queryManageList();
            // 埋点增加额外事件
            qualifiedRemote.event.fireEvent('cuxHandleExtraEvents', {
              ...res,
              updateAttachment: this.updateEnclosure,
              otherProps: this.props,
            });
          }
        }
      });
    }
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch, organizationId } = this.props;
    const lovCode = {
      categoryAlterOpsTypeList: 'SSLM.SUPPLIER_CTG_ALTER_TYPE',
      evaluationLevel: 'SSLM.EVALUATION_LEVEL',
      indicatorTypeList: 'SSLM.KPI_INDICATOR_TYPE',
      enabledList: 'HPFM.ENABLED_FLAG',
      tenantId: organizationId,
    };
    dispatch({
      type: 'commonApplication/init',
      payload: lovCode,
    });
  }

  /**
   * 查询申请单详情
   * @param {Number} requisitionId - 申请单 id
   */
  @Bind()
  queryDetail(requisitionId, queryDynamicFlag = false) {
    const {
      form,
      dispatch,
      qualifiedRemote,
      commonApplication: { purchaseListPagination },
    } = this.props;
    dispatch({
      type: 'qualifiedApplication/queryQualifiedDetail',
      payload: {
        requisitionId,
        customizeUnitCode: queryUnitCode,
      },
    }).then(res => {
      if (res) {
        const { templateId } = res;
        emptyTemplate(dispatch);
        // 重置表单值，解决调用validate后，值不干净问题
        form.resetFields();
        this.setState({
          templateId,
          aiApproveStatus: res.aiApproveStatus,
        });
        // 查询现场考察
        this.queryManageList();
        if (queryDynamicFlag) {
          // 查询配置表数据
          this.fetchModelTableData(requisitionId);
        }
        // 二开增加额外的初始化事件
        if (qualifiedRemote && qualifiedRemote.event) {
          const eventProps = {
            form,
            ...res,
            otherProps: this.props,
          };
          qualifiedRemote.event.fireEvent('cuxHandleInitEvents', eventProps);
        }
      }
    });
    // 查询”采购财务“头信息
    queryPurchaseHeader({ dispatch, requisitionId });
    // 查询”采购财务“行信息
    queryPurchaseLines({ dispatch, requisitionId, page: purchaseListPagination });
    if (qualifiedRemote && qualifiedRemote.event) {
      qualifiedRemote.event.fireEvent('cuxInitQuery', { remoteRef: this.remoteRef });
    }
  }

  /**
   * 查询供货能力清单
   * @param {Object} pagination - 分页对象
   */
  @Bind()
  querySupplierAbility(pagination) {
    const {
      dispatch,
      commonApplication: { lifecycleInfo = {} },
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    const { supplierCompanyId, companyId } = isEmpty(lifecycleInfo) ? qualifiedInfo : lifecycleInfo;
    dispatch({
      type: 'qualifiedApplication/querySupplierAbility',
      payload: {
        pagination,
        supplierCompanyId,
        companyId,
        customizeUnitCode: abilityUnitCode,
      },
    });
  }

  /**
   * 查询现场考察
   * @param {Object} pagination - 分页对象
   */
  @Bind()
  queryManageList(page = {}) {
    const {
      dispatch,
      organizationId,
      commonApplication: { lifecycleInfo = {} },
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    const { supplierCompanyId, companyId } = isEmpty(qualifiedInfo) ? lifecycleInfo : qualifiedInfo;
    dispatch({
      type: 'qualifiedApplication/queryManageList',
      payload: {
        page,
        supplierCompanyId,
        companyId,
        tenantId: organizationId,
      },
    });
  }

  /**
   * 更新评分模板
   * @param {Number} templateId - 评分模板 id
   */
  @Bind()
  updateTemplate(templateId) {
    const { dispatch } = this.props;
    this.setState(
      {
        templateId,
        batchGraderFlag: false,
      },
      () => {
        queryScoreInfo(dispatch, templateId, 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE');
      }
    );
  }

  /**
   * 校验模型表数据
   */
  @Bind()
  checkModelTableData() {
    const { tableList } = this.state;
    let checkModelTableFlag = true;
    let modelDatas = [];
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        const tableData = this[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if (!checkModelTableFlag) {
      return false;
    } else {
      return modelDatas;
    }
  }

  /**
   * 校验个性化页签数据
   */
  @Bind()
  checkCuzTabData() {
    let checkCuzDataFlag = true;
    let cuzData = [];
    if (!isEmpty(this.getCuzDataSource)) {
      this.getCuzDataSource.forEach(getData => {
        if (isFunction(getData)) {
          const cuzDataSource = getData();
          if (checkCuzDataFlag) {
            checkCuzDataFlag = cuzDataSource;
          }
          if (cuzDataSource) {
            cuzData = concat(cuzData, cuzDataSource);
          }
        }
      });
    }
    if (!checkCuzDataFlag) {
      return false;
    } else {
      return cuzData;
    }
  }

  /**
   * 查询个性化页签数据
   */
  @Bind()
  queryCuzTabData(param = {}) {
    if (!isEmpty(this.queryCuzData)) {
      this.queryCuzData.forEach(queryData => {
        if (isFunction(queryData)) {
          queryData(param);
        }
      });
    }
  }

  /*
   * 获取保存所需参数
   * @param {*} type - 类型（保存、发起评审、提交审批）
   * @param {*} standardFlag - 是否标准单据 用于后端区分标准/二开
   */
  @Bind()
  getParams() {
    const {
      qualifiedRemote,
      commonApplication: { lifecycleInfo = {}, supplierClassifyData = [], scoreInfo = [] },
      qualifiedApplication: {
        supplierClassifyList,
        attachmentList = [],
        abilityInfoData = [],
        qualifiedSupRecList = [],
        scoreInfoList = [],
      },
    } = this.props;
    const { supplierCompanyId } = lifecycleInfo;
    const { requisitionId } = this.state;
    // 存储需保存的数据
    const saveParams = { requisitionId, customizeUnitCode: saveUnitCode };
    // 校验标识
    let validateFlag = true;

    // 评分信息
    const scoreLines = isEmpty(scoreInfo) ? scoreInfoList : scoreInfo;
    const scoreFormItems = isUndefined(this.scoreInfoTable) ? [] : getEditTableData(scoreLines);
    const kpiEvalTplIndDTOS = scoreFormItems;
    saveParams.kpiEvalTplIndDTOS = kpiEvalTplIndDTOS;

    // 供货能力清单
    const newQualifiedSupRecList = requisitionId ? qualifiedSupRecList : abilityInfoData;
    const qualifiedSupRecLists = newQualifiedSupRecList.map(source => {
      const { supplyRecordId, _status, updateFlag, isLocal = false, ...otherSource } = source;
      const data = _status === 'create' || !requisitionId ? otherSource : source;
      if (_status === 'update') {
        if (isLocal) {
          delete data.supplyRecordId;
        }
        data.updateFlag = 1;
      } else {
        data.updateFlag = updateFlag || 0;
      }
      return data;
    });
    saveParams.qualifiedSupRecList = qualifiedSupRecLists.map(v => ({ ...v, supplierCompanyId }));

    // 供应商分类
    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;
    const classifyData = getEditTableData(supplierClassify, ['_status', 'categoryAlterLineId']);
    const isClassify = !!supplierClassify.find(
      n => n._status === 'update' || n._status === 'create'
    );
    if (isClassify && isEmpty(classifyData)) {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.classifyWarnMsg')
          .d('请维护【供应商分类】信息'),
      });
      return;
    } else {
      // 保存/提交需全量传给后端
      const editClassifyData = getEditTableData(supplierClassify);
      const firstCreateList = uniqBy(
        [...editClassifyData, ...supplierClassify],
        'categoryAlterLineId'
      );
      const finallyList = firstCreateList.map(n => {
        const { _status, categoryAlterLineId, ...others } = n;
        if (requisitionId) {
          if (_status === 'create') {
            return others;
          } else {
            return { ...others, categoryAlterLineId };
          }
        } else {
          return others;
        }
      });
      saveParams.supplierCategoryAlterLines = finallyList;
    }

    // 处理附件(附件没有带出历史逻辑)
    const editAttachment = getEditTableData(attachmentList, ['_status', 'attachmentLineId']);
    const isModify = !!attachmentList.find(n => n._status === 'update' || n._status === 'create');
    if (isModify && isEmpty(editAttachment)) {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.attachmentWarnMsg')
          .d('请维护【附件】页签信息'),
      });
      return;
    } else {
      saveParams.qualifiedAttachmentLines = editAttachment;
    }

    // 校验校验模型表数据
    const modelDatas = this.checkModelTableData();
    if (!modelDatas) {
      validateFlag = false;
      return;
    }
    // 校验个性化页签数据
    const cuzData = this.checkCuzTabData();
    if (!cuzData) {
      validateFlag = false;
      return;
    }
    if (validateFlag) {
      saveParams.modelDatas = [...modelDatas, ...cuzData];
    }

    // 获取"采购/财务信息"
    const purseDate = isUndefined(this.purchaseInform) ? {} : this.purchaseInform.checkData();
    if (purseDate) {
      saveParams.lifeChangeSync = purseDate.lifeChangeSync;
      saveParams.lifeChangeSyncPfs = purseDate.lifeChangeSyncPfs;
    } else {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.purchaseWarnMsg')
          .d('请维护【采购/财务信息】'),
      });
      return;
    }

    const result = { validateFlag, saveParams };
    const remoteResult = qualifiedRemote
      ? qualifiedRemote.process('SSLM_SUPPlIERLIFE_QUALIFIED_DETAIL_SAVE_PARAMS', result, {
          remoteRef: this.remoteRef,
        })
      : result;

    return remoteResult;
  }

  // 提交审批
  @Bind()
  handleSubmit(payload) {
    const { history, dispatch } = this.props;
    const { backPath } = this.state;
    checkSupLifesupplierCtgAlter(payload.supplierCategoryAlterLines).then(checked => {
      const isChecked = getResponse(checked);
      if (isBoolean(isChecked)) {
        confirm({
          title:
            isChecked === false
              ? intl
                  .get('sslm.commonApplication.view.message.supplierCtgCheckedTip')
                  .d('存在要启用的分类已在供应商分类定义被禁用，是否确认提交审批？')
              : intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
          onOk: () => {
            dispatch({
              type: 'qualifiedApplication/submitQualified',
              payload,
            }).then(res => {
              if (res) {
                notification.success();
                this.handleClearScorer();
                history.push(backPath);
              }
            });
          },
        });
      }
    });
  }

  /**
   * 保存、发起评审、提交审批
   */
  @Bind()
  saveOrReviewOrSubmit(type, params, resolve = () => {}, reject = () => {}) {
    const {
      dispatch,
      form,
      history,
      qualifiedRemote,
      commonApplication: { lifecycleInfo = {} },
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    const { requisitionId, pubEditFlag, backPath } = this.state;
    // 校验头信息，防止个性化配置附件必输校验异步问题
    form.validateFieldsAndScroll({ force: true }, async (error, fieldsValue) => {
      if (!error) {
        const { stageId: fromStageId } = lifecycleInfo;
        const qualifiedHeader = requisitionId
          ? {
              ...qualifiedInfo,
              ...fieldsValue,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            }
          : {
              ...lifecycleInfo,
              ...fieldsValue,
              fromStageId,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            };
        const { validateFlag = false, saveParams = {} } = this.getParams() || {};
        saveParams.qualifiedHeader = qualifiedHeader;
        const payload = { ...saveParams, ...qualifiedHeader, pubEdit: Number(pubEditFlag) };
        if (validateFlag) {
          switch (type) {
            case 'save':
              dispatch({
                type: 'qualifiedApplication/saveQualified',
                payload,
              }).then(res => {
                if (res) {
                  const { qualifiedHeader: { requisitionId: newRequisitionId } = {} } = res;
                  this.setState({
                    requisitionId: newRequisitionId,
                    batchGraderFlag: true,
                  });
                  this.queryDetail(newRequisitionId, true);
                  this.clearScorerSelectRow();
                  this.queryCuzTabData({ requisitionId: newRequisitionId });
                  notification.success();
                  resolve();
                } else {
                  reject(new Error(res));
                }
              });
              break;
            case 'review':
              dispatch({
                type: 'qualifiedApplication/scoreQualified',
                payload: {
                  ...saveParams,
                  qualifiedHeader: {
                    ...qualifiedHeader,
                    examineFlag: 1,
                  },
                  ...qualifiedHeader,
                  examineFlag: 1,
                },
              }).then(res => {
                if (res) {
                  this.setState({ batchGraderFlag: true });
                  this.queryDetail(requisitionId, true);
                  this.clearScorerSelectRow();
                  this.queryCuzTabData({ requisitionId });
                  notification.success();
                }
              });
              break;
            case 'backScore': // 退回评分
              dispatch({
                type: 'qualifiedApplication/saveQualified',
                payload,
              }).then(res => {
                if (res && !isUndefined(this.backScore)) {
                  backScoreSave({
                    dispatch,
                    dataSet: this.backScore.dataSet,
                    onRefresh: this.loadData,
                    ...params,
                  });
                  this.queryCuzTabData({ requisitionId });
                }
              });
              break;
            default: {
              // 默认返回true,当返回false时走二开逻辑不走标准逻辑
              const cuxRes = await qualifiedRemote.event.fireEvent('cuxHandleSubmit', {
                type,
                payload,
                dispatch,
                history,
                backPath,
                onSubmit: this.handleSubmit,
                setLoading: this.setLoading,
                onClearScorer: this.handleClearScorer,
              });
              if (!cuxRes) {
                return;
              }
              this.handleSubmit(payload);
              break;
            }
          }
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
  }

  /**
   * 更新评分人行信息
   * @param {Object} params - 评分人行信息
   */
  @Bind()
  addScorer(params) {
    const {
      dispatch,
      commonApplication: { scorerList = [], editScorerList = [] },
    } = this.props;

    const payload = {
      dispatch,
      scorerList,
      editScorerList,
      ...params,
    };

    addScorerInfo(payload);
  }

  /**
   * 保存评分人信息
   * @param {Nunber} indicateLineId - 评分人信息行 id
   */
  @Bind()
  saveScorer(indicateLineId) {
    const { requisitionId } = this.state;
    const {
      dispatch,
      commonApplication: { scorerList = [], editScorerList = [] } = {},
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;

    const params = {
      dispatch,
      indicateLineId,
      requisitionId,
      scorerList,
      editScorerList,
      scoreInfoTable: this.scoreInfoTable,
      stageCode: qualifiedInfo.stageCode,
      customizeUnitCode: queryUnitCode,
    };
    saveScorerInfo(params);
  }

  /**
   * 删除评分人人
   * @param {Array} params - 要删除的 respUserId List
   */
  @Bind()
  deleteScorer(params) {
    const { requisitionId, templateId } = this.state;
    const {
      dispatch,
      commonApplication: { scorerList = [], editScorerList = [] },
    } = this.props;
    const payload = {
      dispatch,
      requisitionId,
      templateId,
      scorerList,
      editScorerList,
      stageCode: 'QUALIFIED',
      scoreInfoTable: this.scoreInfoTable,
      ...params,
      customizeUnitCode: queryUnitCode,
    };
    deleteScorerInfo(payload);
  }

  /**
   * 清空评分信息
   */
  @Bind()
  handleClearScorer() {
    const { dispatch } = this.props;
    this.setState({
      batchGraderFlag: false,
    });
    dispatch({
      type: 'qualifiedApplication/updateState',
      payload: {
        scoreInfoList: [],
      },
    });
    this.clearScorerSelectRow();
  }

  /**
   * 清空评分勾选行
   */
  @Bind()
  clearScorerSelectRow() {
    if (this.scoreInfoTable) {
      this.scoreInfoTable.clearScorerSelectRow();
    }
  }

  /**
   * 删除合格申请单
   */
  @Bind()
  deleteQualified() {
    const { dispatch, history } = this.props;
    const { requisitionId, backPath } = this.state;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk: () => {
        dispatch({
          type: 'qualifiedApplication/deleteQualified',
          payload: {
            requisitionId,
          },
        }).then(res => {
          if (res) {
            notification.success();
            emptyTemplate(dispatch);
            this.handleClearScorer();
            history.push(backPath);
          }
        });
      },
    });
  }

  /**
   * 废弃申请单
   */
  @Bind()
  handleObsoleted() {
    const { form, dispatch } = this.props;
    const { requisitionId } = this.state;
    confirm({
      title: intl.get('sslm.commonApplication.message.confirmCancel').d('是否确认废弃?'),
      onOk: () => {
        const remark = form.getFieldValue('remark');
        dispatch({
          type: 'qualifiedApplication/obsoletedQualified',
          payload: {
            requisitionId,
            remark,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleClearScorer();
            this.props.history.push('/sslm/supplier-life-manage/manage');
          }
        });
      },
    });
  }

  /**
   * 清空附件列表
   */
  @Bind()
  clearFileList() {
    this.setState({
      fileList: [],
    });
  }

  // 附件上传确认回调
  @Bind()
  onOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      qualifiedApplication: { attachmentList = [] },
      organizationId,
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => {
          return {
            attachmentLineId: uuid(),
            attachmentDesc: file.name,
            attachmentSize: file.size,
            attachmentUrl: file.response,
            uploadUserId: id,
            loginName,
            realName,
            evalStandard: '',
            tenantId: organizationId,
            _status: 'create',
          };
        })
      : [];
    dispatch({
      type: 'qualifiedApplication/updateState',
      payload: {
        attachmentList: [...attachmentList, ...fileData],
      },
    });
    this.setState({ fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {*} file
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 更新附件表
   * @param {*} data
   */
  @Bind()
  updateEnclosure(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualifiedApplication/updateState',
      payload: {
        attachmentList: data,
      },
    });
  }

  /**
   * 删除文件回调函数
   * @param {*} file
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch, organizationId } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'commonApplication/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-lifecycle',
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          this.setState({
            fileList: fileList.filter(o => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  /**
   * 删除状态树中的数据
   * @param {*} localRows 删除的数据
   */
  @Bind()
  deleteEnclosure(localRows, attachmentLineIdList) {
    // itemLineIdList
    const { dispatch, organizationId } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(attachmentLineIdList)) {
      dispatch({
        type: 'qualifiedApplication/deleteEnclosureData',
        payload: {
          attachmentLineIdList,
          organizationId,
          requisitionId,
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
    }
    dispatch({
      type: 'qualifiedApplication/updateState',
      payload: {
        attachmentList: localRows,
      },
    });
  }

  /**
   * 下载文件
   * @param {Object} file 文件对象
   */
  @Bind()
  onDraggerUploadPreview(file) {
    const url = file.response;
    window.open(url, '_blank');
  }

  /**
   * 打印功能
   */
  @Bind()
  handleAsnPrint() {
    const {
      dispatch,
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    const { requisitionId } = this.state;
    dispatch({
      type: 'qualifiedApplication/handleAsnPrint',
      payload: {
        requisitionId,
        supplierCompanyId: qualifiedInfo.supplierCompanyId,
        supplierTenantId: qualifiedInfo.supplierTenantId,
      },
    }).then(res => {
      if (res) {
        if (res.type.indexOf('application/json') > -1) {
          notification.warning({
            description: intl
              .get(`sslm.common.view.printwarning.noTemplate`)
              .d('未设置打印模板，不可打印'),
          });
          return;
        }
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  /**
   * 保存数据到前端页面
   * @param {Array/Object} dataList 更新的数据
   * @param {String} dataName 该保存的数据字符串
   */
  @Bind()
  addReviewMaterialData(dataList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (requisitionId) {
      dispatch({
        type: 'qualifiedApplication/updateState',
        payload: {
          qualifiedSupRecList: dataList,
        },
      });
    } else {
      dispatch({
        type: 'qualifiedApplication/updateState',
        payload: {
          abilityInfoData: dataList,
        },
      });
    }
  }

  /**
   * 删除供货能力数据
   * @param {Array} localRows - 删除后的数据
   * @param {Array} idList - rowKeys
   */
  @Bind()
  deleteSupplierCapacity(localRows, itemLineIdList) {
    const { dispatch, organizationId } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(itemLineIdList) && requisitionId) {
      dispatch({
        type: `qualifiedApplication/deleteData`,
        payload: {
          itemLineIdList,
          organizationId,
          requisitionId,
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
    }
    const type = 'qualifiedApplication/updateState';
    const payload = requisitionId
      ? {
          qualifiedSupRecList: localRows,
        }
      : {
          abilityInfoData: localRows,
        };
    dispatch({
      type,
      payload,
    });
  }

  /**
   * 更新供应商分类
   */
  @Bind()
  handleUpdatClassify(dataList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (requisitionId) {
      dispatch({
        type: 'qualifiedApplication/updateState',
        payload: {
          supplierClassifyList: dataList,
        },
      });
    } else {
      dispatch({
        type: 'commonApplication/updateState',
        payload: {
          supplierClassifyData: dataList,
        },
      });
    }
  }

  /**
   * 删除供应商分类
   */
  @Bind()
  handleDeleteClassify(newList, remoteRows) {
    const { dispatch } = this.props;
    this.handleUpdatClassify(newList);
    if (!isEmpty(remoteRows)) {
      deleteClassify({ dispatch, remoteRows });
    }
  }

  @Bind()
  openOperationsRecordModal() {
    this.setState({ operationsRecordVisible: true });
  }

  // 更新模型表loading
  @Bind()
  updateModelTableLoading(flag = false) {
    this.setState({ modelTableLoading: flag });
  }

  /**
   * 批量维护评分人
   */
  @Bind()
  batchMaintainGrader(params) {
    const { requisitionId } = this.state;
    const {
      dispatch,
      commonApplication: { scorerList = [], editScorerList = [] } = {},
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    const payload = {
      dispatch,
      scorerList,
      editScorerList,
      requisitionId,
      stageCode: qualifiedInfo.stageCode,
      scoreInfoTable: this.scoreInfoTable,
      indicateLineIds: params,
    };
    batchMaintainGrader(payload);
  }

  // 退回评分弹框
  @Bind()
  backScoreModal() {
    const { requisitionId, templateId } = this.state;
    const {
      qualifiedApplication: { qualifiedInfo: { toStageCode } = {} },
    } = this.props;

    C7nModal.open({
      closable: true,
      drawer: true,
      key: C7nModal.key(),
      style: { width: 800 },
      onOk: () => this.saveOrReviewOrSubmit('backScore', { requisitionId, stageCode: toStageCode }),
      title: intl.get('sslm.common.view.button.backScore').d('退回评分'),
      children: (
        <BackScore
          stageCode={toStageCode}
          templateId={templateId}
          requisitionId={requisitionId}
          onRef={node => {
            this.backScore = node;
          }}
        />
      ),
    });
  }

  // 条件查询评分信息
  @Bind()
  handleSearchScoreInfo(params) {
    const { requisitionId } = this.state;
    const {
      dispatch,
      qualifiedApplication: { qualifiedInfo: { toStageCode } = {} },
    } = this.props;
    dispatch({
      type: 'qualifiedApplication/queryScoreInfo',
      payload: {
        requisitionId,
        stageCode: toStageCode,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE',
        ...params,
        scoreType:
          params.indicatorType && (params.indicatorType === 'SYSTEM' ? 'SYSTEM' : 'MANUAL'),
        indicatorType: params.indicatorType === 'SYSTEM' ? undefined : params.indicatorType,
      },
    });
  }

  @Bind()
  handleCuzDataSource(getDataSource) {
    this.getCuzDataSource.push(getDataSource);
  }

  @Bind()
  handleQueryCuzData(queryData) {
    this.queryCuzData.push(queryData);
  }

  @Bind()
  setLoading(flag) {
    this.setState({ cuxBtnLoading: flag });
  }

  // 清除轮循计时器
  @Bind()
  clearTimerRef() {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }
  }

  // 轮询【智能审核】结果
  @Bind()
  async getAiApproveResult() {
    const { requisitionId } = this.state;
    const res = getResponse(
      await fetchApproveStatus({
        documentType: 'LIFE_CYCLE_CHANGE_OLD_QUALIFIED',
        documentId: requisitionId,
      })
    );
    if (res) {
      this.setState({ aiApproveStatus: res.status });
      this.timerTime.current++;
      if (this.timerTime.current > 4 || res.status !== 'APPROVING') {
        this.timerTime.current = 0;
        this.clearTimerRef();
        this.setState({ reviewIsClick: false });
      }
    } else {
      this.clearTimerRef();
    }
  }

  // 【智能审核】回调
  @Bind()
  async handleIntelligentReview() {
    const { requisitionId, pubEditFlag } = this.state;
    const {
      form,
      dispatch,
      qualifiedApplication: { qualifiedInfo = {} },
    } = this.props;
    form.validateFieldsAndScroll({ force: true }, async (error, fieldsValue) => {
      if (!error) {
        const qualifiedHeader = {
          ...qualifiedInfo,
          ...fieldsValue,
          standardFlag: 1,
          pubEdit: Number(pubEditFlag),
        };
        const { validateFlag = false, saveParams = {} } = this.getParams() || {};
        saveParams.qualifiedHeader = qualifiedHeader;
        const payload = { ...saveParams, ...qualifiedHeader, pubEdit: Number(pubEditFlag) };
        if (validateFlag) {
          this.setLoading(true);
          dispatch({
            type: 'qualifiedApplication/saveQualified',
            payload,
          })
            .then(async res => {
              if (res) {
                await aiApprove({
                  documentType: 'LIFE_CYCLE_CHANGE_OLD_QUALIFIED',
                  documentId: requisitionId,
                }).then(async response => {
                  const resp = getResponse(response);
                  if (resp) {
                    notification.success();
                    this.setState({ reviewIsClick: true });
                  }
                });
              }
            })
            .finally(() => {
              this.setLoading(false);
              this.setState({
                batchGraderFlag: true,
              });
              this.queryDetail(requisitionId, true);
              this.clearScorerSelectRow();
              this.queryCuzTabData({ requisitionId });
            });
        }
      } else {
        notification.warning({
          message: intl
            .get('sslm.enterpriseInform.view.message.requiredMsg')
            .d('请检查是否有必填项未填写！'),
        });
        return true;
      }
    });
  }

  render() {
    const {
      requisitionId,
      readOnly,
      backPath,
      templateId,
      isPub,
      batchGraderFlag,
      operationsRecordVisible,
      pubEditFlag,
      modelTableLoading,
      tableList,
      sourceType,
      cuxBtnLoading,
      aiApproveStatus,
    } = this.state;

    const {
      form,
      dispatch,
      isCreateUser,
      scorerLoading,
      queryLoading,
      templateLoading,
      saveScorerLoading,
      deleteScorerLoading,
      operateLoading,
      siteInvestigateLoading,
      printLoading,
      deleteClassifyLoading,
      commonApplication: {
        code = {},
        lifecycleInfo = {},
        supplierClassifyData = [],
        scoreInfo = [],
        scorerList = [],
        editScorerList = [],
      },
      qualifiedApplication: {
        qualifiedInfo = {},
        attachmentList = [],
        qualifiedSupRecList = [], // 供货能力清单
        scoreInfoList = [], // 评分信息列表
        abilityInfoData = [],
        supplierClassifyList = [], // 供应商分类列表
        manageList = [], // 现场考察列表
        manageListPagination = {}, // 现场考察列表分页
      },
      user: { currentUser = {} },
      customizeForm,
      customizeTabPane,
      customizeBtnGroup,
      customizeTable,
      custLoading,
      history,
      queryScoreLoading,
      location,
      tabsPrimaryColor,
      qualifiedRemote,
    } = this.props;
    const hasId = requisitionId || requisitionId === 0;
    const info = isEmpty(qualifiedInfo) ? lifecycleInfo : qualifiedInfo;
    const {
      companyId,
      examineFlag, // 是否已发起过评审标识
      supplierCompanyId,
      toStageId,
      dimensionCode,
      processStatus,
      aiApproveDTOList,
      toStageDescription,
      targetStageDescription,
      supplierTenantId,
      requisitionId: newRequisitionId,
    } = info;
    const stageCode = info.toStageCode || info.stageCode;
    // 德康src-26781 二开埋点
    const reqId = qualifiedRemote
      ? qualifiedRemote.process('SSLM_SUPPLIERLIFE_QUALIFIED_OPTION', requisitionId, info)
      : requisitionId;
    const dataSourceContent = requisitionId
      ? qualifiedSupRecList
      : abilityInfoData.map(n => ({ ...n, supplyRecordId: uuid(), _status: 'create' }));
    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;
    const editProps = { requisitionId, ...info };
    const edit = !readOnly && !(hasId && !isCreateUser);
    // 德康src-26781 二开埋点
    const selfEdit = qualifiedRemote
      ? qualifiedRemote.process('SSLM_SUPPLIERLIFE_QUALIFIED_ISEDIT', edit, editProps)
      : edit;
    const isEdit = selfEdit && ['NEW', 'REJECTED', undefined].includes(processStatus);
    // 控制”删除“、”批量导入“按钮
    const showImportOrDelete = selfEdit && ['NEW', 'REJECTED'].includes(processStatus);
    // 控制”发起评审“按钮
    const showReview =
      selfEdit &&
      ((['NEW'].includes(processStatus) && form.getFieldValue('templateId')) ||
        (['REJECTED'].includes(processStatus) && form.getFieldValue('templateId') && !examineFlag));
    // 控制”提交审批“按钮
    const showSubmit =
      selfEdit &&
      ((['NEW'].includes(processStatus) && !form.getFieldValue('templateId')) ||
        processStatus === 'SCORED' ||
        (['REJECTED'].includes(processStatus) &&
          (!form.getFieldValue('templateId') || examineFlag)));
    // 控制”废弃“按钮
    const showObsoleted =
      selfEdit && ['SCORING', 'NEW', 'SCORED', 'REJECTED'].includes(processStatus);

    // 控制“退回评分”按钮
    const backScoreFlag =
      selfEdit &&
      (['SCORING', 'SCORED'].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && examineFlag));
    // 新建、拒绝后没有模板id，评分相关可编辑
    const scoreEdit =
      selfEdit &&
      (['NEW', undefined].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && !examineFlag));
    // 评分完成后可编辑
    const scoreCompleteEdit =
      selfEdit && ['NEW', 'REJECTED', 'SCORED', undefined].includes(processStatus);

    const scoreInfoProps = {
      dispatch,
      templateId,
      requisitionId,
      stageCode,
      listDataSource: isEmpty(scoreInfo) ? scoreInfoList : scoreInfo, // 评分信息列表
      scorerDataSource: mergeScorerDataSource(scorerList, editScorerList), // 评分人信息列表
      listLoading: operateLoading || templateLoading || queryScoreLoading, // 评分信息加载
      scorerLoading, // 评分人信息加载
      saveScorerLoading,
      deleteScorerLoading,
      batchGraderFlag, // 批量维护评分人是否显示
      queryScorer, // 查询评分人信息
      addScorer: this.addScorer, // 更新评分人信息
      onBatchMaintainGrader: this.batchMaintainGrader, // 批量维护评分人
      saveScorer: this.saveScorer, // 保存评分人信息
      deleteScorer: this.deleteScorer, // 删除评分人信息
      cleanState, // 关闭侧滑窗口时清空状态
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_BTN_GROUP',
    };

    const supplierAbilityTableProps = {
      history,
      location,
      requisitionId,
      pagination: false,
      stageCode: 'QUALIFIED',
      dataSource: dataSourceContent,
      onAdd: this.addReviewMaterialData,
      onDeleteRows: this.deleteSupplierCapacity,
      supplierCompanyId: qualifiedInfo.supplierCompanyId,
      isEdit,
      isImport: showImportOrDelete,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      formCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_FORM',
      tableCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_TABLE',
      btnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_BTNGROUP',
      attCustomizeCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ITEM_ATTACHMENT',
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      code,
      isEdit,
      deleteLoading: deleteClassifyLoading,
      onDeleteRows: this.handleDeleteClassify,
      dataSource: supplierClassify,
      onUpdateData: this.handleUpdatClassify,
      customizeTable,
      custLoading,
      sourceKey: stageSourceKey.qualified,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SUP_CLASSIFY_TABLE',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_CLASSIFY_BTN_GROUP',
    };

    // 供应商相关业务单据
    const supplierRelatedDocBtnProps = {
      // isPub,
      companyId,
      toStageId,
      requisitionId,
      supplierCompanyId,
      sourceTarget: 'Qualified',
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_RELATED_DOC',
      customizeUnitBtnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_RELATED_BTN_FROUP',
      customizeBtnGroup,
      dimensionCode,
    };

    // 附件
    const enclosureTableProps = {
      isEdit: scoreCompleteEdit,
      currentUser,
      onOk: this.onOk,
      remote: qualifiedRemote,
      dataSource: attachmentList,
      onUpdateRow: this.updateEnclosure,
      onDeleteRows: this.deleteEnclosure,
      onClearRows: ref => {
        this.clearRows = ref;
      },
      setFileList: this.setFileList,
      clearFileList: this.clearFileList,
      onDraggerUploadRemove: this.onDraggerUploadRemove,
      customizeTable,
      custLoading,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_LN',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_ATT_BTN_GROUP',
      otherProps: this.props,
    };

    // 现场考察
    const siteInvestigateTableProps = {
      queryLoading: siteInvestigateLoading,
      dataSource: manageList,
      managePagination: manageListPagination,
      handleonChange: this.queryManageList,
    };

    const modelTableRemoteProps = {
      _this: this,
    };

    // 模型
    const modelTableProps = {
      tableList,
      interfaceChange: true,
      relationId: newRequisitionId,
      readOnly: !isEdit,
      readyQuery: !isEmpty(info),
      queryParams: {
        companyId,
        supplierCompanyId,
        supplierTenantId,
      },
      parentRef: this,
      remote: qualifiedRemote,
      remoteProps: modelTableRemoteProps,
      updateModelTableLoading: this.updateModelTableLoading,
    };

    const titleType = toStageDescription || targetStageDescription;
    const title =
      readOnly || (hasId && !isCreateUser)
        ? `${titleType}${intl.get(`sslm.commonApplication.view.title.application`).d('申请单')}`
        : requisitionId || requisitionId === 0
        ? `${titleType}${intl
            .get(`sslm.commonApplication.view.title.applicationMaintain`)
            .d('申请单维护')}`
        : `${titleType}${intl
            .get(`sslm.commonApplication.view.title.applicationCreation`)
            .d('申请单创建')}`;
    const allLoading =
      operateLoading || queryLoading || printLoading || modelTableLoading || cuxBtnLoading || false;

    // 头按钮埋点参数
    const headerBtnProps = {
      dispatch,
      requisitionId,
      basicInfo: info,
      loading: allLoading,
      handleQuery: this.loadData,
      setLoading: this.setLoading,
      onClear: this.handleClearScorer,
    };

    const remoteRenderProps = {
      onRef: this.handleRemoteRef,
      _this: this,
    };
    return (
      <React.Fragment>
        <Header title={title} backPath={isPub ? '' : backPath}>
          <HeaderBtns
            loading={allLoading}
            readOnly={readOnly}
            reviewFlag={showReview}
            submitFlag={showSubmit}
            sourceType={sourceType}
            obsoletedFlag={showObsoleted}
            deleteFlag={showImportOrDelete}
            saveFlag={scoreCompleteEdit}
            processStatus={processStatus}
            backScoreFlag={backScoreFlag}
            qualifiedInfo={qualifiedInfo}
            customizeBtnGroup={customizeBtnGroup}
            onPrint={this.handleAsnPrint}
            jump360={handleSupplierDetail}
            onDelete={this.deleteQualified}
            onBackScore={this.backScoreModal}
            onSave={this.saveOrReviewOrSubmit}
            onObsoleted={this.handleObsoleted}
            onOperat={this.openOperationsRecordModal}
            qualifiedRemote={qualifiedRemote}
            handleQuery={this.loadData}
            basicInfo={info}
            setLoading={this.setLoading}
            aiApproveStatus={aiApproveStatus}
            onIntelligentReview={this.handleIntelligentReview}
          />
          {qualifiedRemote &&
            qualifiedRemote.render(
              'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_CUSTOMER_BUTTONS',
              <></>,
              headerBtnProps
            )}
        </Header>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <Content>
          <Spin spinning={allLoading}>
            <div style={{ marginLeft: 16 }}>
              <QualifiedHeader
                form={form}
                isEdit={isEdit}
                scoreEdit={scoreEdit}
                data={info}
                custLoading={custLoading}
                customizeForm={customizeForm}
                updateTemplate={this.updateTemplate}
                emptyTemplate={emptyTemplate}
                handleClearScorer={this.handleClearScorer}
                clearScorerSelectRow={this.clearScorerSelectRow}
                pubEditFlag={pubEditFlag}
              />
            </div>
            {/* 获取个性化页签数据 */}
            <ExternalCustomizeContext.Provider
              value={{
                getCuzDataSource: this.handleCuzDataSource,
                queryCuzData: this.handleQueryCuzData,
              }}
            >
              {customizeTabPane(
                {
                  code: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_TAB',
                },
                <Tabs
                  animated={false}
                  tabBarExtraContent={<SupplierRelatedDocBtn {...supplierRelatedDocBtnProps} />}
                >
                  <Tabs.TabPane
                    forceRender
                    tab={intl
                      .get('sslm.commonApplication.view.message.gradInformation')
                      .d('评分信息')}
                    key="scoreInfo"
                  >
                    <ScoreInfoTable
                      isEdit={scoreEdit}
                      readOnly={!!readOnly}
                      tableProps={scoreInfoProps}
                      onRef={ref => {
                        this.scoreInfoTable = ref;
                      }}
                      indicatorTypeList={code.indicatorTypeList}
                      onSearch={this.handleSearchScoreInfo}
                      customizeTable={customizeTable}
                      code="SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_SCORE_TABLE"
                    />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl
                      .get('sslm.commonApplication.view.message.tab.supplyAbility')
                      .d('供货能力清单')}
                    key="supplierCapacity"
                  >
                    <SupplyAbilityTable {...supplierAbilityTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get('sslm.commonApplication.view.supplier.class').d('供应商分类')}
                    key="supplierClassification"
                  >
                    <SupplierClassificationTable {...supplierClassificationTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <span>
                        {intl.get('sslm.commonApplication.view.message.tab.enclosure').d('附件')}
                        <Tag
                          color={tabsPrimaryColor || '#108ee9'}
                          style={{
                            height: 'auto',
                            lineHeight: '15px',
                            marginLeft: '4px',
                          }}
                        >
                          {attachmentList && Array.isArray(attachmentList)
                            ? attachmentList.length
                            : 0}
                        </Tag>
                      </span>
                    }
                    key="enclosure"
                  >
                    <EnclosureTable {...enclosureTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl
                      .get('sslm.commonApplication.view.message.tab.siteInvestigate')
                      .d('现场考察')}
                    key="siteInvestigate"
                  >
                    <SiteInvestigate {...siteInvestigateTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    forceRender
                    key="purchaseInform"
                    tab={intl
                      .get('sslm.commonApplication.view.message.purchaseInform')
                      .d('采购/财务信息')}
                  >
                    <PurchaseInform
                      isEdit={isEdit}
                      custLoading={custLoading}
                      customizeForm={customizeForm}
                      customizeTable={customizeTable}
                      dimensionCode={dimensionCode}
                      requisitionId={requisitionId}
                      onRef={node => {
                        this.purchaseInform = node;
                      }}
                      customizeBtnGroup={customizeBtnGroup}
                      customizeBtnGroupCode="SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_PUR_BTN_GROUP"
                    />
                  </Tabs.TabPane>
                  {getDynamicTable(modelTableProps)}
                  {qualifiedRemote &&
                    qualifiedRemote.process(
                      'SSLM_SUPPlIERLIFE_QUALIFIED_DETAIL_EXTRA_TABPANE',
                      null,
                      remoteRenderProps
                    )}
                </Tabs>
              )}
            </ExternalCustomizeContext.Provider>
          </Spin>
        </Content>

        {/* 操作记录-抽屉 */}
        <OperationsRecordModal
          info={info}
          visible={operationsRecordVisible}
          onClose={() => this.setState({ operationsRecordVisible: false })}
          processType="qualified"
          requisitionId={reqId}
        />
      </React.Fragment>
    );
  }
}
