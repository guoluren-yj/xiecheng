/**
 * Potential - 供应商生命周期配置 - 潜在申请单创建界面
 * @date: 2018-9-6
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import qs from 'querystring';
import uuid from 'uuid/v4';
import { isEmpty, isString, isUndefined, concat, uniqBy, isFunction, isBoolean } from 'lodash';
import { Form, Tabs, Modal, Spin, Tag } from 'hzero-ui';
import Bind from 'lodash-decorators/bind';
import { Modal as C7nModal } from 'choerodon-ui/pro';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import notification from 'utils/notification';
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
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import SupplierRelatedDocBtn from '@/routes/SupplierLife/SupplierRelatedDoc';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { checkSupLifesupplierCtgAlter } from '@/services/commonApplicationService';
import HeaderInfo from './HeaderInfo';
import HeaderBtns from './HeaderBtns';
import SupplyAbilityTable from '../Components/Detail/SupplyAbilityTable';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';
import PurchaseInform from '../Components/PurchaseInform';
import OperationsRecordModal from '../Components/OperationsRecordModal';
import BackScore from '../Components/BackScore';

const { confirm } = Modal;
const organizationId = getCurrentOrganizationId();

// 保存要传的个性化code
const customizeUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_LINE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SUP_CLASSIFY_TABLE',
];

// 查询要传的个性化code
const queryCustomizeUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_LINE',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SUP_CLASSIFY_TABLE',
];

// 供货能力清单个性化code
const supplierAbilityCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_FORM',
  'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
];

/**
 * 潜在申请单
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} potentialApplication - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ potentialApplication, commonApplication, user = {}, loading }) => {
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
    potentialApplication,
    commonApplication,
    user,
    allLoading:
      loading.effects['potentialApplication/savePotential'] ||
      loading.effects['commonApplication/queryLifecycleInfo'] ||
      loading.effects['potentialApplication/queryPotential'] ||
      loading.effects['potentialApplication/deteleForm'] ||
      loading.effects['potentialApplication/scorePotential'] ||
      loading.effects['potentialApplication/submitPotential'] ||
      loading.effects['potentialApplication/obsoletedPotential'] ||
      loading.effects['commonApplication/queryReviewDetail'] ||
      loading.effects['commonApplication/querySupplierClassification'] ||
      loading.effects['commonApplication/queryPurchaseData'] ||
      loading.effects['commonApplication/queryPurchaseHeader'] ||
      loading.effects['commonApplication/queryPurchaseLines'] ||
      loading.effects['potentialApplication/handlePrint'],
    scorerLoading: loading.effects['commonApplication/queryScorer'],
    templateLoading: loading.effects['commonApplication/queryQualifiedScoreInfo'],
    deleteScorerLoading: loading.effects['commonApplication/deleteScorer'],
    saveScorerLoading: loading.effects['commonApplication/saveScorer'],
    deleteClassifyLoading: loading.effects['commonApplication/deleteClassify'],
    queryScoreLoading: loading.effects['potentialApplication/queryScoreInfo'],
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'sslm.commonApplication',
    'sslm.common',
    'sslm.supplierInform',
    'spfm.importErp',
    'sslm.supplierDetail',
    'sslm.supplierReview',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_FORM',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_BTNGROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_LINE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SUP_CLASSIFY_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_RELATED_BTN_FROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_BTN_GROUP', // 评分信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_CLASSIFY_BTN_GROUP', // 供应商分类按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_BTN_GROUP', // 附件信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_PUR_BTN_GROUP', // 采购财务信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER_BTNGROUP', // 详情头按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_ATTACHMENT', // 供货能力行附件
  ],
})
@remote(
  {
    code: 'SSLM_SUPPlIERLIFE_POTENTIAL', // 德康src-26781 二开埋点
    name: 'potentialRemote',
  },
  {
    events: {
      cuxHandleExtraEvents() {}, // 增加额外的二开事件
    },
  }
)
export default class PotentialCreate extends PureComponent {
  constructor(props) {
    super(props);
    const { location, match, dispatch } = props;
    const readOnly = location.pathname.match('/potential-view');
    const isPub = location.pathname.includes('/pub/'); // 判断是否为pub页面
    const basePath = match.path.substring(0, match.path.indexOf('/potential'));
    const queryParams = qs.parse(location.search.substr(1)); // 是否从列表跳转
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
    const returnPath = match.path.substring(0, match.path.indexOf('/potential-view'));
    const { state: { historyBack = '' } = {} } = location; // 用于返回上一级页面
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
      isPub,
      sourceType,
      isEdit: !readOnly,
      backPath,
      requisitionId: null,
      fileList: [], // 头附件
      templateId: null, // 评分模板 id
      batchGraderFlag: true, // 批量维护评分人是否显示
      readOnly,
      historyBack,
      operationsRecordVisible: false,
      tableList: [],
      pubEditFlag: !!Number(pubEdit), // 判断工作流是否可编辑
    };
    emptyTemplate(dispatch);
  }

  scoreInfoTable; // 评分信息列表 ref

  getCuzDataSource = []; // 缓存个性化页签数据

  queryCuzData = []; // 缓存个性化页签查询方法

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
  }

  componentDidMount() {
    const { onLoad } = this.props;
    const { pubEditFlag } = this.state;
    this.init();
    this.loadData();
    // 查询配置表
    queryRelTableConfig('sslm_life_cycle_potential_req').then(res => {
      this.setState({
        tableList: res,
      });
    });

    // 处理工作流审批保存
    if (isFunction(onLoad) && pubEditFlag) {
      onLoad({
        submit: approveResult => {
          return new Promise((resolve, reject) => {
            if (approveResult === 'Approved') {
              this.saveOrReviewOrSubmit('save', {}, resolve, reject);
            } else {
              resolve();
            }
          });
        },
      });
    }
  }

  /**
   * 组件注销时，清空model
   */
  componentWillUnmount() {
    this.clearData();
  }

  /**
   * 清空model
   */
  @Bind()
  clearData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'potentialApplication/updateState',
      payload: {
        headerInfo: {},
        supplierCapacityDataSource: [],
        enclosureDataSource: [],
        scoreInfoList: [],
        supplierClassifyList: [],
      },
    });
    dispatch({
      type: 'commonApplication/updateState',
      payload: {
        code: {},
        lifecycleInfo: {},
        supplierClassifyData: [],
        reviewMaterialData: {},
        scoreInfo: [],
        scorerList: [],
        editScorerList: [],
        purchaseHeadInfo: {},
        purchaseList: [],
        purchaseListPagination: {},
      },
    });
  }

  /**
   * 值集查询
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
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
   * 清空评分信息
   */
  @Bind()
  handleClearScorer() {
    const { dispatch } = this.props;
    this.setState({
      batchGraderFlag: false,
    });
    dispatch({
      type: 'potentialApplication/updateState',
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
   * 查询页面初始数据
   * @param {Object} queryParams - 从路由上获取的查询对象
   */
  @Bind()
  loadData() {
    const { dispatch, location, potentialRemote } = this.props;
    const queryParams = qs.parse(location.search.substr(1));
    const { requisitionId: reqId } = queryParams;
    if (reqId || reqId === 0) {
      this.setState({ requisitionId: reqId });
      this.queryDetail(reqId);
    } else {
      // 查询申请单所需供应商信息
      dispatch({
        type: 'commonApplication/queryLifecycleInfo',
        payload: {
          ...queryParams,
          customizeUnitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_HEADER'],
        },
      }).then(res => {
        if (!isEmpty(res)) {
          const {
            requisitionId,
            supplierCompanyId,
            supplierTenantId,
            dimensionCode,
            companyId,
          } = res;
          this.setState({ requisitionId });
          if (requisitionId || requisitionId === 0) {
            this.queryDetail(requisitionId);
          } else {
            const payload = {
              supplierCompanyId,
              customizeUnitCode: supplierAbilityCode,
              companyId: dimensionCode === 'GROUP' ? null : companyId,
            };
            // 查询”供货能力清单“历史数据
            this.queryAbilityHistory(payload);
            // 查询”供应商分类“历史数据
            querySupplierClassification({ dispatch, supplierCompanyId, supplierTenantId });
            // 查询”采购/财务“历史数据
            queryPurchaseHistory({ dispatch, companyId, supplierCompanyId });
            // 埋点增加额外事件
            potentialRemote.event.fireEvent('cuxHandleExtraEvents', {
              supplierCompanyId,
              toStageCode: res.toStageCode,
              stageCode: res.stageCode,
              updateAttachment: this.updateEnclosure,
              otherProps: this.props,
            });
          }
        }
      });
    }
  }

  /**
   * 查询申请单信息
   */
  @Bind()
  queryDetail(requisitionId) {
    const {
      form,
      dispatch,
      user: {
        currentUser: { id },
      },
      commonApplication: { purchaseListPagination },
    } = this.props;
    dispatch({
      type: 'potentialApplication/queryPotential',
      payload: {
        requisitionId,
        organizationId,
        customizeUnitCode: queryCustomizeUnitCode,
      },
    }).then(data => {
      if (!isEmpty(data)) {
        const { potentialHeader: { createdBy, templateId } = {} } = data;
        if (createdBy !== id) {
          this.setState({ isEdit: false });
        }
        emptyTemplate(dispatch);
        // 重置表单值，解决调用validate后，值不干净问题
        form.resetFields();
        this.setState({
          templateId,
        });
      }
    });
    // 查询”采购财务“头信息
    queryPurchaseHeader({ dispatch, requisitionId });
    // 查询”采购/财务“行信息
    queryPurchaseLines({ dispatch, requisitionId, page: purchaseListPagination });
  }

  /**
   * 查询供货能力清单历史数据
   */
  @Bind()
  queryAbilityHistory(params) {
    const { dispatch } = this.props;
    dispatch({
      type: 'commonApplication/queryReviewDetail',
      payload: {
        ...params,
        page: 0,
        size: 0,
      },
    });
  }

  /**
   * 更新附件表数据
   * @param {Array} data - 更新后的数据
   */
  @Bind()
  updateEnclosure(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'potentialApplication/updateState',
      payload: {
        enclosureDataSource: data,
      },
    });
  }

  /**
   * 保存数据到前端页面
   * @param {Array/Object} dataList 更新的数据
   * @param {String} dataName 该保存的数据字符串
   */
  @Bind()
  addReviewMaterialData(dataList) {
    const {
      dispatch,
      commonApplication: { reviewMaterialData = {} },
    } = this.props;
    const { requisitionId } = this.state;
    if (requisitionId) {
      dispatch({
        type: 'potentialApplication/updateState',
        payload: {
          supplierCapacityDataSource: dataList,
        },
      });
    } else {
      dispatch({
        type: 'commonApplication/updateState',
        payload: {
          reviewMaterialData: {
            ...reviewMaterialData,
            content: dataList,
          },
        },
      });
    }
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
        type: 'potentialApplication/updateState',
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

  /**
   * 删除供货能力数据
   * @param {Array} localRows - 删除后的数据
   * @param {Array} idList - rowKeys
   */
  @Bind()
  deleteSupplierCapacity(localRows, itemLineIdList) {
    // itemLineIdList
    const {
      dispatch,
      commonApplication: { reviewMaterialData = {} },
    } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(itemLineIdList) && requisitionId) {
      dispatch({
        type: `potentialApplication/deleteData`,
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
    const type = requisitionId
      ? 'potentialApplication/updateState'
      : 'commonApplication/updateState';
    const payload = requisitionId
      ? {
          supplierCapacityDataSource: localRows,
        }
      : {
          reviewMaterialData: {
            ...reviewMaterialData,
            content: localRows,
            totalElements: reviewMaterialData.totalElements - 1,
          },
        };
    dispatch({
      type,
      payload,
    });
  }

  /**
   * 删除状态树中的数据
   * @param {Array} localRows 删除后数据
   * @param {Array} attachmentLineIdList rowKeys
   */
  @Bind()
  deleteEnclosure(localRows, attachmentLineIdList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(attachmentLineIdList)) {
      dispatch({
        type: 'potentialApplication/deleteEnclosureData',
        payload: {
          attachmentLineIdList,
          organizationId,
          requisitionId,
        },
      }).then(res => {
        if (res) {
          this.clearRows();
          notification.success();
        }
      });
    }
    dispatch({
      type: 'potentialApplication/updateState',
      payload: {
        enclosureDataSource: localRows,
      },
    });
  }

  /**
   * 获取保存所需参数
   * @param {*} standardFlag - 是否标准单据 用于后端区分标准/二开
   */
  @Bind()
  getParams() {
    const {
      commonApplication: {
        reviewMaterialData: { content = [] },
        scoreInfo = [],
        supplierClassifyData = [],
      },
      potentialApplication: {
        supplierCapacityDataSource = [],
        enclosureDataSource = [],
        scoreInfoList = [],
        supplierClassifyList = [],
      },
    } = this.props;
    const { requisitionId, tableList } = this.state;

    // 存储需保存的数据
    const saveParams = { requisitionId, organizationId, customizeUnitCode };
    // 校验标识
    let validateFlag = true;

    // 获取评分信息
    const scoreLines = isEmpty(scoreInfo) ? scoreInfoList : scoreInfo;
    const scoreFormItems = isUndefined(this.scoreInfoTable) ? [] : getEditTableData(scoreLines); // 获得评分信息表单项值
    saveParams.kpiEvalTplIndDTOS = scoreFormItems;

    // 获取供货能力清单定义
    const newDataSources = requisitionId ? supplierCapacityDataSource : content;
    const potentialLines = newDataSources.map(source => {
      const { _status, isLocal = false, ...others } = source;
      const { potentialLineId, ...otherSource } = others;
      const finalResult = requisitionId ? others : otherSource;
      switch (_status) {
        case 'update': {
          if (isLocal) {
            delete finalResult.potentialLineId;
          }
          return { ...finalResult, updateFlag: 1 };
        }
        case 'create': {
          delete others.potentialLineId;
          delete others.supplyRecordId;
          return others;
        }
        default: {
          return { ...finalResult, updateFlag: finalResult.updateFlag || 0 };
        }
      }
    });
    saveParams.potentialLines = potentialLines;

    // 获取供应商分类
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

    // 获取附件(附件没有带出历史逻辑)
    const editAttachment = getEditTableData(enclosureDataSource, ['_status', 'attachmentLineId']);
    const isModify = !!enclosureDataSource.find(
      n => n._status === 'update' || n._status === 'create'
    );
    if (isModify && isEmpty(editAttachment)) {
      validateFlag = false;
      notification.warning({
        message: intl
          .get('sslm.commonApplication.view.message.attachmentWarnMsg')
          .d('请维护【附件】页签信息'),
      });
      return;
    } else {
      saveParams.potentialAttachmentLines = editAttachment;
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

    // 校验模型表数据
    let modelDatas = [];
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        const tableData = this[n.tableCode].checkData();
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        } else {
          validateFlag = false;
          return false;
        }
      }
    });

    // 校验个性化页签数据
    const cuzData = this.checkCuzTabData();
    if (!cuzData) {
      validateFlag = false;
      return;
    }
    if (validateFlag) {
      saveParams.modelDatas = [...modelDatas, ...cuzData];
    }

    return { validateFlag, saveParams };
  }

  /**
   * 保存、审批、提交
   */
  @Bind()
  saveOrReviewOrSubmit(type, params, resolve = () => {}, reject = () => {}) {
    const {
      dispatch,
      history,
      form,
      potentialRemote,
      commonApplication: { lifecycleInfo = {} },
      potentialApplication: { headerInfo },
    } = this.props;
    const { requisitionId, backPath, pubEditFlag } = this.state;
    // 校验头信息，防止个性化配置附件必输校验异步问题
    form.validateFieldsAndScroll({ force: true }, (err, fieldsValues) => {
      if (!err) {
        const potentialHeader = requisitionId
          ? {
              ...headerInfo,
              ...fieldsValues,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            }
          : {
              ...lifecycleInfo,
              ...fieldsValues,
              fromStageId: lifecycleInfo.stageId,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            };
        const { validateFlag, saveParams } = this.getParams() || {};
        const payloads = {
          ...saveParams,
          potentialHeader,
          pubEdit: Number(pubEditFlag),
        };
        const payload = potentialRemote.process(
          'SSLM_SUPPlIERLIFE_POTENTIAL_DETAIL_SAVE_PARAMS',
          payloads,
          { _this: this }
        );
        if (validateFlag) {
          switch (type) {
            case 'save':
              dispatch({
                type: 'potentialApplication/savePotential',
                payload,
              }).then(res => {
                if (res) {
                  this.loadData();
                  this.setState({ batchGraderFlag: true });
                  const { potentialHeader: { requisitionId: newRequisitionId } = {} } = res;
                  this.fetchModelTableData(newRequisitionId);
                  // 个性化tab查询
                  this.queryCuzTabData({ requisitionId: newRequisitionId });
                  this.clearScorerSelectRow();
                  notification.success();
                  resolve();
                } else {
                  reject(new Error(res));
                }
              });
              break;
            case 'review':
              dispatch({
                type: 'potentialApplication/scorePotential',
                payload: {
                  ...payload,
                  potentialHeader: {
                    ...potentialHeader,
                    examineFlag: 1, // 是否发起评审标识
                  },
                },
              }).then(res => {
                if (res) {
                  this.loadData();
                  this.setState({ batchGraderFlag: true });
                  this.fetchModelTableData(requisitionId);
                  this.queryCuzTabData({ requisitionId });
                  this.clearScorerSelectRow();
                  notification.success();
                }
              });
              break;
            case 'backScore': // 退回评分
              dispatch({
                type: 'potentialApplication/savePotential',
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
            default:
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
                        type: 'potentialApplication/submitPotential',
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
              break;
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
   * 删除申请单
   */
  @Bind()
  handleDeteleForm() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    confirm({
      title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk: () => {
        dispatch({
          type: 'potentialApplication/deteleForm',
          payload: { requisitionId, organizationId },
        }).then(res => {
          if (res) {
            notification.success();
            emptyTemplate(dispatch);
            this.handleClearScorer();
            this.props.history.push('/sslm/supplier-life-manage/manage');
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
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    confirm({
      title: intl.get('sslm.commonApplication.message.confirmCancel').d('是否确认废弃?'),
      onOk: () => {
        dispatch({
          type: 'potentialApplication/obsoletedPotential',
          payload: { requisitionId, organizationId },
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

  /**
   * 上传modal确定按钮
   */
  @Bind()
  onOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      potentialApplication: { enclosureDataSource = [] },
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => ({
          loginName,
          realName,
          attachmentLineId: uuid(),
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          uploadUserId: id,
          remark: '',
          tenantId: organizationId,
          _status: 'create',
        }))
      : [];
    dispatch({
      type: 'potentialApplication/updateState',
      payload: {
        enclosureDataSource: [...enclosureDataSource, ...fileData],
      },
    });
    this.setState({ fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {Object} file - 上传的文件
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'commonApplication/onDraggerUploadRemove',
        payload: {
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-supplier',
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter(o => o.uid !== file.uid),
      });
    }
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
      potentialApplication: { headerInfo = {} },
    } = this.props;
    const params = {
      dispatch,
      indicateLineId,
      requisitionId,
      scorerList,
      editScorerList,
      scoreInfoTable: this.scoreInfoTable,
      stageCode: headerInfo.stageCode,
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
      scoreInfoTable: this.scoreInfoTable,
      ...params,
    };
    deleteScorerInfo(payload);
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
        queryScoreInfo(dispatch, templateId);
      }
    );
  }

  /**
   * 打印
   */
  @Bind()
  handlePrint() {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    dispatch({
      type: 'potentialApplication/handlePrint',
      payload: {
        requisitionId,
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

  @Bind()
  openOperationsRecordModal() {
    this.setState({ operationsRecordVisible: true });
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
      potentialApplication: { headerInfo = {} },
    } = this.props;
    const payload = {
      dispatch,
      scorerList,
      editScorerList,
      requisitionId,
      stageCode: headerInfo.stageCode,
      scoreInfoTable: this.scoreInfoTable,
      indicateLineIds: params,
    };
    batchMaintainGrader(payload);
  }

  // 退回评分确认回调
  @Bind()
  handleBackScoreOk(params) {
    const { dispatch } = this.props;
    if (!isUndefined(this.backScore)) {
      return backScoreSave({
        dispatch,
        dataSet: this.backScore.dataSet,
        onRefresh: this.loadData,
        ...params,
      });
    }
  }

  // 退回评分弹框
  @Bind()
  backScoreModal() {
    const { requisitionId, templateId } = this.state;
    const {
      potentialApplication: { headerInfo: { stageCode } = {} },
    } = this.props;

    C7nModal.open({
      closable: true,
      drawer: true,
      key: C7nModal.key(),
      style: { width: 800 },
      onOk: () => this.saveOrReviewOrSubmit('backScore', { requisitionId, stageCode }),
      title: intl.get('sslm.common.view.button.backScore').d('退回评分'),
      children: (
        <BackScore
          stageCode={stageCode}
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
      potentialApplication: { headerInfo: { stageCode } = {} },
    } = this.props;
    dispatch({
      type: 'potentialApplication/queryScoreInfo',
      payload: {
        requisitionId,
        stageCode,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE',
        ...params,
        scoreType:
          params.indicatorType && (params.indicatorType === 'SYSTEM' ? 'SYSTEM' : 'MANUAL'),
        indicatorType: params.indicatorType === 'SYSTEM' ? undefined : params.indicatorType,
      },
    });
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

  @Bind()
  handleCuzDataSource(getDataSource) {
    this.getCuzDataSource.push(getDataSource);
  }

  @Bind()
  handleQueryCuzData(queryData) {
    this.queryCuzData.push(queryData);
  }

  render() {
    const queryParams = qs.parse(this.props.location.search.substr(1));
    const {
      isEdit,
      requisitionId,
      backPath,
      templateId,
      isPub,
      batchGraderFlag,
      readOnly,
      historyBack,
      operationsRecordVisible,
      pubEditFlag,
      tableList,
      sourceType,
    } = this.state;
    const {
      form,
      dispatch,
      allLoading,
      scorerLoading,
      templateLoading,
      saveScorerLoading,
      deleteScorerLoading,
      deleteClassifyLoading,
      commonApplication: {
        code = {},
        lifecycleInfo = {},
        reviewMaterialData: { content = [] },
        scoreInfo = [],
        scorerList = [],
        editScorerList = [],
        supplierClassifyData = [],
      },
      potentialApplication: {
        supplierCapacityDataSource = [],
        enclosureDataSource = [],
        headerInfo = {},
        scoreInfoList = [],
        supplierClassifyList = [],
      },
      user: { currentUser = {} },
      custLoading,
      customizeForm,
      customizeTable,
      customizeTabPane,
      customizeBtnGroup,
      history,
      location,
      queryScoreLoading,
      tabsPrimaryColor,
      potentialRemote,
    } = this.props;
    const newHeaderInfo = isEmpty(headerInfo) ? lifecycleInfo : headerInfo;
    // 德康src-26781 二开埋点
    const reqId = potentialRemote
      ? potentialRemote.process('SSLM_SUPPLIERLIFE_POTENTIAL_OPTION', requisitionId, newHeaderInfo)
      : requisitionId;
    const {
      companyId,
      examineFlag, // 是否已发起过评审标识
      supplierCompanyId,
      toStageId,
      dimensionCode,
      processStatus,
      toStageDescription,
      targetStageDescription,
      supplierTenantId,
      requisitionId: newRequisitionId,
    } = newHeaderInfo;
    const newSupplierCapacityDataSource = requisitionId
      ? supplierCapacityDataSource
      : content.map(n => ({ ...n, potentialLineId: uuid(), _status: 'create' }));
    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;
    const editProps = { requisitionId, ...newHeaderInfo };
    // 德康src-26781 二开埋点
    const isEditRemote = potentialRemote
      ? potentialRemote.process('SSLM_SUPPLIERLIFE_POTENTIAL_ISEDIT', isEdit, editProps)
      : isEdit;
    const newEdit = isEditRemote && ['NEW', 'REJECTED', undefined].includes(processStatus);
    // 控制”删除“、”批量导入“按钮
    const showImportOrDelete = isEditRemote && ['NEW', 'REJECTED'].includes(processStatus);
    // 控制”发起评审“按钮
    const showReview =
      isEditRemote &&
      ((['NEW'].includes(processStatus) && form.getFieldValue('templateId')) ||
        (['REJECTED'].includes(processStatus) && form.getFieldValue('templateId') && !examineFlag));
    // 控制”提交审批“按钮
    const showSubmit =
      isEditRemote &&
      ((['NEW'].includes(processStatus) && !form.getFieldValue('templateId')) ||
        processStatus === 'SCORED' ||
        (['REJECTED'].includes(processStatus) &&
          (!form.getFieldValue('templateId') || examineFlag)));
    // 控制”废弃“按钮
    const showObsoleted =
      isEditRemote && ['SCORING', 'NEW', 'SCORED', 'REJECTED'].includes(processStatus);
    // 控制“退回评分”按钮
    const backScoreFlag =
      isEditRemote &&
      (['SCORING', 'SCORED'].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && examineFlag));
    // 新建、拒绝后没有模板id，评分相关可编辑
    const scoreEdit =
      isEditRemote &&
      (['NEW', undefined].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && !examineFlag));
    // 评分完成后可编辑
    const scoreCompleteEdit =
      isEditRemote && ['NEW', 'REJECTED', 'SCORED', undefined].includes(processStatus);

    // 供货能力
    const supplyAbilityTableProps = {
      history,
      location,
      requisitionId,
      queryParams,
      stageCode: 'POTENTIAL',
      isEdit: newEdit,
      isImport: showImportOrDelete,
      pagination: false,
      dataSource: newSupplierCapacityDataSource,
      onAdd: this.addReviewMaterialData,
      onDeleteRows: this.deleteSupplierCapacity,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      formCode: supplierAbilityCode[0],
      tableCode: supplierAbilityCode[1],
      btnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_BTNGROUP',
      attCustomizeCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ITEM_ATTACHMENT',
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      code,
      isEdit: newEdit,
      deleteLoading: deleteClassifyLoading,
      onDeleteRows: this.handleDeleteClassify,
      dataSource: supplierClassify,
      onUpdateData: this.handleUpdatClassify,
      customizeTable,
      custLoading,
      sourceKey: stageSourceKey.potential,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SUP_CLASSIFY_TABLE',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_CLASSIFY_BTN_GROUP',
    };
    // 附件
    const enclosureTableProps = {
      isEdit: scoreCompleteEdit,
      currentUser,
      onOk: this.onOk,
      remote: potentialRemote,
      dataSource: enclosureDataSource,
      onUpdateRow: this.updateEnclosure,
      onDeleteRows: this.deleteEnclosure,
      onClearRows: ref => {
        this.clearRows = ref;
      },
      setFileList: this.setFileList,
      clearFileList: this.clearFileList,
      onDraggerUploadRemove: this.onDraggerUploadRemove,
      customizeTable,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_LINE',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_ATT_BTN_GROUP',
      otherProps: this.props,
    };
    // 供应商相关业务单据
    const supplierRelatedDocBtnProps = {
      // isPub,
      companyId,
      toStageId,
      requisitionId,
      supplierCompanyId,
      sourceTarget: 'Potential',
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_RELATED_DOC',
      customizeUnitBtnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_RELATED_BTN_FROUP',
      customizeBtnGroup,
      dimensionCode,
    };

    const scoreInfoProps = {
      dispatch,
      templateId,
      requisitionId,
      stageCode: headerInfo.stageCode,
      listDataSource: isEmpty(scoreInfo) ? scoreInfoList : scoreInfo, // 评分信息列表
      scorerDataSource: mergeScorerDataSource(scorerList, editScorerList), // 评分人信息列表
      listLoading: templateLoading || queryScoreLoading, // 评分信息加载
      saveScorerLoading,
      deleteScorerLoading,
      scorerLoading, // 评分人信息加载
      batchGraderFlag, // 批量维护评分人是否显示
      queryScorer, // 查询评分人信息
      addScorer: this.addScorer, // 更新评分人信息
      onBatchMaintainGrader: this.batchMaintainGrader, // 批量维护评分人
      saveScorer: this.saveScorer, // 保存评分人信息
      deleteScorer: this.deleteScorer, // 删除评分人信息
      cleanState, // 关闭侧滑窗口时清空状态
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_BTN_GROUP',
    };
    // 模型
    const modelTableProps = {
      tableList,
      interfaceChange: true,
      relationId: newRequisitionId,
      readOnly: !newEdit,
      readyQuery: !isEmpty(newHeaderInfo),
      queryParams: {
        supplierCompanyId,
        companyId,
        supplierTenantId,
      },
      parentRef: this,
    };

    const titleType = toStageDescription || targetStageDescription;

    const titlte = isEdit
      ? requisitionId
        ? `${titleType}${intl
            .get(`sslm.commonApplication.view.title.applicationMaintain`)
            .d('申请单维护')}`
        : `${titleType}${intl
            .get(`sslm.commonApplication.view.title.applicationCreation`)
            .d('申请单创建')}`
      : `${titleType}${intl.get(`sslm.commonApplication.view.title.application`).d('申请单')}`;
    return (
      <React.Fragment>
        <Header title={titlte} backPath={isPub ? '' : historyBack || backPath}>
          <HeaderBtns
            loading={allLoading}
            readOnly={readOnly}
            sourceType={sourceType}
            saveFlag={scoreCompleteEdit}
            deleteFlag={showImportOrDelete}
            reviewFlag={showReview}
            submitFlag={showSubmit}
            headerInfo={headerInfo}
            processStatus={processStatus}
            backScoreFlag={backScoreFlag}
            obsoletedFlag={showObsoleted}
            customizeBtnGroup={customizeBtnGroup}
            onSave={this.saveOrReviewOrSubmit}
            onDetele={this.handleDeteleForm}
            onObsoleted={this.handleObsoleted}
            onBackScore={this.backScoreModal}
            onPrint={this.handlePrint}
            jump360={handleSupplierDetail}
            onOperat={this.openOperationsRecordModal}
          />
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <div style={{ marginLeft: 16 }}>
              <HeaderInfo
                isEdit={newEdit}
                form={form}
                scoreEdit={scoreEdit}
                remote={potentialRemote}
                headerInfo={newHeaderInfo}
                custLoading={custLoading}
                customizeForm={customizeForm}
                emptyTemplate={emptyTemplate}
                updateTemplate={this.updateTemplate}
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
                  code: 'SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_TAB',
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
                      tableProps={scoreInfoProps}
                      onRef={ref => {
                        this.scoreInfoTable = ref;
                      }}
                      indicatorTypeList={code.indicatorTypeList}
                      onSearch={this.handleSearchScoreInfo}
                      customizeTable={customizeTable}
                      code="SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_SCORE_TABLE"
                    />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl
                      .get('sslm.commonApplication.view.message.tab.supplyAbility')
                      .d('供货能力清单')}
                    key="supplyAbility"
                  >
                    <SupplyAbilityTable {...supplyAbilityTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                    key="supplierClassification"
                  >
                    <SupplierClassificationTable {...supplierClassificationTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    tab={
                      <span>
                        {intl.get('hzero.common.upload.modal.title').d('附件')}
                        <Tag
                          color={tabsPrimaryColor || '#108ee9'}
                          style={{
                            height: 'auto',
                            lineHeight: '15px',
                            marginLeft: '4px',
                          }}
                        >
                          {enclosureDataSource && Array.isArray(enclosureDataSource)
                            ? enclosureDataSource.length
                            : 0}
                        </Tag>
                      </span>
                    }
                    key="enclosure"
                  >
                    <EnclosureTable {...enclosureTableProps} />
                  </Tabs.TabPane>
                  <Tabs.TabPane
                    forceRender
                    key="purchaseInform"
                    tab={intl
                      .get('sslm.commonApplication.view.message.purchaseInform')
                      .d('采购/财务信息')}
                  >
                    <PurchaseInform
                      isEdit={newEdit}
                      custLoading={custLoading}
                      customizeForm={customizeForm}
                      customizeTable={customizeTable}
                      dimensionCode={dimensionCode}
                      requisitionId={requisitionId}
                      onRef={node => {
                        this.purchaseInform = node;
                      }}
                      customizeBtnGroup={customizeBtnGroup}
                      customizeBtnGroupCode="SSLM.SUPPLIER_LIFE_MANAGE.POTENTIAL_PUR_BTN_GROUP"
                    />
                  </Tabs.TabPane>
                  {getDynamicTable(modelTableProps)}
                </Tabs>
              )}
            </ExternalCustomizeContext.Provider>
          </Spin>
        </Content>

        {/* 操作记录-抽屉 */}
        <OperationsRecordModal
          visible={operationsRecordVisible}
          onClose={() => this.setState({ operationsRecordVisible: false })}
          processType="potential"
          requisitionId={reqId}
        />
      </React.Fragment>
    );
  }
}
