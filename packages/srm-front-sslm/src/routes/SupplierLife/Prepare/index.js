/**
 * Prepare - 供应商生命周期配置 - 预留申请单查询界面
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Tabs, Spin, Modal, Tag } from 'hzero-ui';
import { isEmpty, isString, isUndefined, uniqBy, concat, isFunction, isBoolean } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import qs from 'querystring';
import Bind from 'lodash-decorators/bind';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getEditTableData, getResponse } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import remote from 'hzero-front/lib/utils/remote';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { ExternalCustomizeContext } from 'srm-front-cuz/lib/utils';
import { Modal as C7nModal } from 'choerodon-ui/pro';

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
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import SupplierRelatedDocBtn from '@/routes/SupplierLife/SupplierRelatedDoc';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { checkSupLifesupplierCtgAlter } from '@/services/commonApplicationService';
import PrepareHeader from './Header';
import HeaderBtns from './HeaderBtns';
import SupplierClassificationTable from '../Components/Detail/SupplierClassificationTable';
import EnclosureTable from '../Components/Detail/EnclosureTable';
import ScoreInfoTable from '../Components/Score/ScoreInfoTable';
import SupplyAbilityTable from '../Components/Detail/SupplyAbilityTable';
import PurchaseInform from '../Components/PurchaseInform';
import OperationsRecordModal from '../Components/OperationsRecordModal';
import BackScore from '../Components/BackScore';

const { confirm } = Modal;
const organizationId = getCurrentOrganizationId();

// 保存时所需的个性化code
const saveUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_FORM',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SUP_CLASSIFY_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_LN',
];

// 查询时所需的个性化code
const queryCustomizeUnitCode = [
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_FORM',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SUP_CLASSIFY_TABLE',
  'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_LN',
];

@connect(({ loading, prepareApplication, commonApplication, user = {} }) => {
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
    prepareApplication,
    isCreateUser:
      user.currentUser.id ===
      (prepareApplication.prepareHeader && prepareApplication.prepareHeader.createdBy),
    allLoading:
      loading.effects['prepareApplication/savePrepare'] ||
      loading.effects['prepareApplication/queryPrepareDetail'] ||
      loading.effects['prepareApplication/deletePrepare'] ||
      loading.effects['prepareApplication/scorePrepare'] ||
      loading.effects['prepareApplication/submitPrepare'] ||
      loading.effects['prepareApplication/obsoletedPrepare'] ||
      loading.effects['commonApplication/querySupplierClassification'] ||
      loading.effects['commonApplication/queryLifecycleInfo'] ||
      loading.effects['commonApplication/queryPurchaseHeader'] ||
      loading.effects['commonApplication/queryPurchaseLines'] ||
      loading.effects['prepareApplication/querySupplierAbility'],
    scorerLoading: loading.effects['commonApplication/queryScorer'],
    templateLoading: loading.effects['commonApplication/queryQualifiedScoreInfo'],
    deleteScorerLoading: loading.effects['commonApplication/deleteScorer'],
    saveScorerLoading: loading.effects['commonApplication/saveScorer'],
    deleteClassifyLoading: loading.effects['commonApplication/deleteClassify'],
    queryScoreLoading: loading.effects['prepareApplication/queryScoreInfo'],
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
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_TAB',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_HEADER',
    'SSLM.SUPPLIER_LIFE_MANAGE.PURCHASE_LINES',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_BTNGROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_FORM',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SUP_CLASSIFY_TABLE',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_RELATED_BTN_FROUP',
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_SCORE_BTN_GROUP', // 评分信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_CLASSIFY_BTN_GROUP', // 供应商分类按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_BTN_GROUP', // 附件信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_PUR_BTN_GROUP', // 采购财务信息按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER_BTNGROUP', // 头信息-按钮组
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_ATTACHMENT', // 供货能力行附件
    'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_LN',
  ],
})
@remote(
  {
    code: 'SSLM_SUPPlIERLIFE_PREPARE', // 德康src-26781 二开埋点
    name: 'preparedRemote',
  },
  {
    events: {
      cuxSave() {}, // 二开保存
      cuxSubmit() {}, // 二开提交
      cuxHandleExtraEvents() {}, // 增加额外的二开事件
    },
  }
)
export default class Prepare extends PureComponent {
  constructor(props) {
    super(props);
    const { location, match, dispatch } = props;
    const isPub = location.pathname.includes('/pub/'); // 判断是否为pub页面
    const readOnly = location.pathname.match('/prepare-view');
    const basePath = match.path.substring(0, match.path.indexOf('/prepare'));
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
    const returnPath = match.path.substring(0, match.path.indexOf('/prepare-view'));
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
      readOnly,
      backPath,
      sourceType,
      requisitionId: queryParams.requisitionId, // 申请单 id
      fileList: [], // 上传附件列表
      templateId: null, // 评分模板 id
      batchGraderFlag: true, // 批量维护评分人是否显示
      historyBack,
      operationsRecordVisible: false,
      tableList: [], // 用于配置表
      abilityDataSource: [], // 供货能力清单数据源
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
    queryRelTableConfig('sslm_life_cycle_prepare_req').then(res => {
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
      type: 'prepareApplication/updateState',
      payload: {
        prepareHeader: {},
        attachmentList: [],
        scoreInfoList: [],
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
   * 查询页面初始数据
   * @param {Object} queryParams - 从路由上获取的查询对象
   */
  @Bind()
  loadData() {
    const { dispatch, location, preparedRemote } = this.props;
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
          customizeUnitCode: ['SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER'],
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
            // 查询历史供货能力清单
            this.querySupplierAbility();
            // 查询”供应商分类“历史数据
            querySupplierClassification({ dispatch, supplierCompanyId, supplierTenantId });
            // 查询”采购/财务“历史数据
            queryPurchaseHistory({ dispatch, companyId, supplierCompanyId });
            // 埋点增加额外事件
            preparedRemote.event.fireEvent('cuxHandleExtraEvents', {
              supplierCompanyId,
              toStageCode: res.toStageCode,
              stageCode: res.stageCode,
              updateAttachment: this.updateAttachment,
              otherProps: this.props,
            });
          }
        }
      });
    }
  }

  // 查询历史供货能力清单
  @Bind()
  querySupplierAbility() {
    const {
      dispatch,
      commonApplication: { lifecycleInfo = {} },
      prepareApplication: { prepareHeader = {} },
    } = this.props;
    const { supplierCompanyId, companyId } = isEmpty(lifecycleInfo) ? prepareHeader : lifecycleInfo;
    dispatch({
      type: 'prepareApplication/querySupplierAbility',
      payload: {
        supplierCompanyId,
        companyId,
        customizeUnitCode: [
          'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_FORM',
          'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
        ],
      },
    }).then(res => {
      if (res) {
        this.setState({
          abilityDataSource: res.content.map(n => ({
            ...n,
            supplyRecordId: uuid(),
            _status: 'create',
          })),
        });
      }
    });
  }

  // 新增供货能力清单定义
  @Bind()
  handleAddAbility(dataList) {
    this.setState({ abilityDataSource: dataList });
  }

  // 删除供货能力数据
  @Bind()
  deleteSupplierCapacity(localRows, itemLineIdList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(itemLineIdList) && requisitionId) {
      dispatch({
        type: `prepareApplication/deleteAbilityData`,
        payload: itemLineIdList,
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
    }
    this.setState({ abilityDataSource: localRows });
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
   * 查询申请单详情
   * @param {Number} requisitionId - 申请单 id
   */
  @Bind()
  queryDetail(requisitionId) {
    const {
      form,
      dispatch,
      commonApplication: { purchaseListPagination },
    } = this.props;
    dispatch({
      type: 'prepareApplication/queryPrepareDetail',
      payload: {
        requisitionId,
        customizeUnitCode: queryCustomizeUnitCode,
      },
    }).then(res => {
      if (res) {
        const { prepareHeader: { templateId } = {} } = res;
        emptyTemplate(dispatch);
        this.setState({
          templateId,
          abilityDataSource: res.prepareSupplyRecList,
        });
      }
      // 重置表单值，解决调用validate后，值不干净问题
      form.resetFields();
    });
    // 查询”采购财务“头信息
    queryPurchaseHeader({ dispatch, requisitionId });
    // 查询”采购/财务“行信息
    queryPurchaseLines({ dispatch, requisitionId, page: purchaseListPagination });
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
   * 获取保存所需参数
   * @param {*} standardFlag - 是否标准单据 用于后端区分标准/二开
   */
  @Bind()
  getParams() {
    const {
      prepareApplication: { attachmentList = [], scoreInfoList = [], supplierClassifyList = [] },
      commonApplication: { scoreInfo = [], supplierClassifyData = [], lifecycleInfo = {} },
    } = this.props;
    const { supplierCompanyId } = lifecycleInfo;
    const { requisitionId, abilityDataSource } = this.state;
    // 存储需保存的数据
    const saveParams = { requisitionId, customizeUnitCode: saveUnitCode };
    // 校验标识
    let validateFlag = true;

    // 获取评分信息
    const scoreLines = isEmpty(scoreInfo) ? scoreInfoList : scoreInfo;
    const scoreFormItems = isUndefined(this.scoreInfoTable) ? [] : getEditTableData(scoreLines);
    saveParams.kpiEvalTplIndDTOS = scoreFormItems;

    // 供货能力清单
    const prepareSupRecLists = abilityDataSource.map(source => {
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
    saveParams.prepareSupplyRecList = prepareSupRecLists.map(v => ({ ...v, supplierCompanyId }));

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

    // 获取附件
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
      saveParams.prepareAttachmentLines = editAttachment;
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

    return { validateFlag, saveParams };
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
   * 保存／发起评审／提交
   */
  @Bind()
  saveOrReviewOrSubmit(type, params, resolve = () => {}, reject = () => {}) {
    const {
      dispatch,
      form,
      preparedRemote,
      prepareApplication: { prepareHeader = {} },
      commonApplication: { lifecycleInfo = {} },
    } = this.props;
    const { requisitionId, pubEditFlag } = this.state;
    // 校验头信息，防止个性化配置附件必输校验异步问题
    form.validateFieldsAndScroll({ force: true }, (err, fieldsValues) => {
      if (!err) {
        const fieldsValuesRemote = preparedRemote.process(
          'SSLM_SUPPlIERLIFE_PREPARE.PREPARE_HEADER_VALUES',
          fieldsValues
        );
        const newPrepareHeader = requisitionId
          ? {
              ...prepareHeader,
              ...fieldsValuesRemote,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            }
          : {
              ...lifecycleInfo,
              ...fieldsValuesRemote,
              fromStageId: lifecycleInfo.stageId,
              standardFlag: 1,
              pubEdit: Number(pubEditFlag),
            };
        const { validateFlag, saveParams } = this.getParams() || {};
        const payload = {
          ...saveParams,
          prepareHeader: newPrepareHeader,
          pubEdit: Number(pubEditFlag),
        };
        if (validateFlag) {
          switch (type) {
            case 'save': {
              const savePayload = {
                resolve,
                reject,
                saveParam: payload,
              };
              this.handleSaveRemote(savePayload);
              break;
            }
            case 'review':
              dispatch({
                type: 'prepareApplication/scorePrepare',
                payload: {
                  ...payload,
                  prepareHeader: {
                    ...newPrepareHeader,
                    examineFlag: 1, // 是否发起评审标识
                  },
                },
              }).then(res => {
                if (res) {
                  notification.success();
                  this.setState({ batchGraderFlag: true });
                  this.queryDetail(requisitionId);
                  // 刷新配置表数据
                  this.fetchModelTableData(requisitionId);
                  this.queryCuzTabData({ requisitionId });
                  this.clearScorerSelectRow();
                }
              });
              break;
            case 'backScore': // 退回评分
              dispatch({
                type: 'prepareApplication/savePrepare',
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
                      const submitPayload = {
                        submitParam: payload,
                      };
                      this.handleSubmitRemote(submitPayload);
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

  // 处理保存埋点
  @Bind()
  async handleSaveRemote(params = {}) {
    const { preparedRemote } = this.props;
    const { isPub } = this.state;
    const eventProps = {
      // 保存方法入参
      saveProps: params,
      onSave: this.handleSave,
      otherPram: { isPub },
    };
    const result = await preparedRemote.event.fireEvent('cuxSave', eventProps);
    // 执行二开逻辑要返回false， 默认返回true
    if (result) {
      this.handleSave(params);
    }
  }

  /**
   * 处理保存
   */
  @Bind()
  handleSave(params = {}) {
    if (isEmpty(params)) {
      return;
    }
    const { dispatch } = this.props;
    const { resolve, reject, saveParam } = params;
    dispatch({
      type: 'prepareApplication/savePrepare',
      payload: saveParam,
    }).then(res => {
      if (res) {
        const { prepareHeader: { requisitionId: newRequisitionId } = {} } = res;
        if (newRequisitionId || newRequisitionId === 0) {
          this.setState({
            requisitionId: newRequisitionId,
            batchGraderFlag: true,
          });
          this.queryDetail(newRequisitionId);
          // 刷新配置表数据
          this.fetchModelTableData(newRequisitionId);
          this.queryCuzTabData({ requisitionId: newRequisitionId });
        }
        this.clearScorerSelectRow();
        notification.success();
        resolve(true);
      } else {
        reject(new Error(res));
      }
    });
  }

  // 处理提交埋点
  @Bind()
  async handleSubmitRemote(params = {}) {
    const { preparedRemote } = this.props;
    const { submitParam } = params;
    const eventProps = {
      submitParam,
      onSubmit: this.handleSubmit,
    };
    const result = await preparedRemote.event.fireEvent('cuxSubmit', eventProps);
    // 执行二开逻辑要返回false， 默认返回true
    if (result) {
      this.handleSubmit(params);
    }
  }

  /**
   * 处理提交
   */
  @Bind()
  handleSubmit(params = {}) {
    if (isEmpty(params)) {
      return;
    }
    const { history, dispatch } = this.props;
    const { backPath } = this.state;
    const { submitParam } = params;
    dispatch({
      type: 'prepareApplication/submitPrepare',
      payload: submitParam,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleClearScorer();
        history.push(backPath);
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
      type: 'prepareApplication/updateState',
      payload: {
        scoreInfoList: [],
      },
    });
    this.clearScorerSelectRow();
  }

  /**
   * 删除
   */
  @Bind()
  deletePrepare() {
    const { dispatch, history } = this.props;
    const { requisitionId, backPath } = this.state;
    dispatch({
      type: 'prepareApplication/deletePrepare',
      payload: {
        requisitionId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleClearScorer();
        emptyTemplate(dispatch);
        history.push(backPath);
      }
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
          type: 'prepareApplication/obsoletedPrepare',
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

  @Bind()
  onOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      prepareApplication: { attachmentList = [] },
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
            remark: '',
            tenantId: organizationId,
            _status: 'create',
          };
        })
      : [];
    dispatch({
      type: 'prepareApplication/updateState',
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
   */
  @Bind()
  updateAttachment(data) {
    const { dispatch } = this.props;
    dispatch({
      type: 'prepareApplication/updateState',
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
    const { dispatch } = this.props;
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
  deleteAttachment(localRows, attachmentLineIdList) {
    // itemLineIdList
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (!isEmpty(attachmentLineIdList)) {
      dispatch({
        type: 'prepareApplication/deleteEnclosureData',
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
      type: 'prepareApplication/updateState',
      payload: {
        attachmentList: localRows,
      },
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
      prepareApplication: { prepareHeader: { stageCode = '' } = {} },
    } = this.props;
    const params = {
      dispatch,
      indicateLineId,
      requisitionId,
      scorerList,
      editScorerList,
      scoreInfoTable: this.scoreInfoTable,
      stageCode,
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
   * 更新供应商分类
   */
  @Bind()
  handleUpdatClassify(dataList) {
    const { dispatch } = this.props;
    const { requisitionId } = this.state;
    if (requisitionId) {
      dispatch({
        type: 'prepareApplication/updateState',
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
   * 打印
   */
  @Bind()
  handlePrint() {
    const {
      dispatch,
      prepareApplication: { prepareHeader = {} },
    } = this.props;
    const { requisitionId } = this.state;
    dispatch({
      type: 'prepareApplication/handlePrint',
      payload: {
        requisitionId,
        supplierCompanyId: prepareHeader.supplierCompanyId,
        supplierTenantId: prepareHeader.supplierTenantId,
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
      prepareApplication: { prepareHeader = {} },
    } = this.props;
    const payload = {
      dispatch,
      scorerList,
      editScorerList,
      requisitionId,
      stageCode: prepareHeader && prepareHeader.stageCode,
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
      prepareApplication: { prepareHeader: { stageCode } = {} },
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

  /**
   * 清空评分勾选行
   */
  @Bind()
  clearScorerSelectRow() {
    if (this.scoreInfoTable) {
      this.scoreInfoTable.clearScorerSelectRow();
    }
  }

  // 条件查询评分信息
  @Bind()
  handleSearchScoreInfo(params) {
    const { requisitionId } = this.state;
    const {
      dispatch,
      prepareApplication: { prepareHeader: { stageCode } = {} },
    } = this.props;
    dispatch({
      type: 'prepareApplication/queryScoreInfo',
      payload: {
        requisitionId,
        stageCode,
        customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE',
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
    const {
      requisitionId,
      readOnly,
      backPath,
      templateId,
      isPub,
      batchGraderFlag,
      historyBack,
      operationsRecordVisible,
      abilityDataSource,
      pubEditFlag,
      tableList,
      sourceType,
    } = this.state;
    const {
      form,
      dispatch,
      history,
      location,
      isCreateUser,
      allLoading,
      scorerLoading,
      templateLoading,
      saveScorerLoading,
      deleteScorerLoading,
      deleteClassifyLoading,
      custLoading,
      customizeForm,
      customizeTabPane,
      customizeTable,
      customizeBtnGroup,
      commonApplication: {
        code = {},
        lifecycleInfo = {},
        supplierClassifyData = [],
        scoreInfo = [],
        scorerList = [],
        editScorerList = [],
      },
      prepareApplication: {
        attachmentList = [],
        scoreInfoList = [],
        supplierClassifyList = [],
        prepareHeader = {},
      },
      user: { currentUser = {} },
      queryScoreLoading,
      tabsPrimaryColor,
      preparedRemote,
    } = this.props;
    const hasId = requisitionId || requisitionId === 0;
    const headerInfo = isEmpty(prepareHeader) ? lifecycleInfo : prepareHeader;
    const reqId = preparedRemote
      ? preparedRemote.process('SSLM_SUPPLIERLIFE_PREPARE_OPTION', requisitionId, headerInfo)
      : requisitionId;
    const {
      companyId,
      supplierCompanyId,
      toStageId,
      dimensionCode,
      supplierTenantId,
      requisitionId: newRequisitionId,
    } = headerInfo;
    const {
      processStatus,
      toStageDescription,
      targetStageDescription,
      stageCode,
      examineFlag, // 是否已发起过评审标识
    } = headerInfo;

    // 判断是否是自己的单据
    const selfEdit = !readOnly && !(hasId && !isCreateUser);
    const editProps = { ...headerInfo, requisitionId };
    // 德康src-26781 二开埋点
    const eidtRemote = preparedRemote
      ? preparedRemote.process('SSLM_SUPPLIERLIFE_PREPARE_ISEDIT', selfEdit, editProps)
      : selfEdit;
    const isEdit = eidtRemote && ['NEW', 'REJECTED', undefined].includes(processStatus);
    // 控制”删除“按钮
    const showImportOrDelete = eidtRemote && ['NEW', 'REJECTED'].includes(processStatus);
    // 控制”发起评审“按钮
    const showReview =
      eidtRemote &&
      ((['NEW'].includes(processStatus) && form.getFieldValue('templateId')) ||
        (['REJECTED'].includes(processStatus) && form.getFieldValue('templateId') && !examineFlag));
    // 控制”提交审批“按钮
    const showSubmit =
      eidtRemote &&
      ((['NEW'].includes(processStatus) && !form.getFieldValue('templateId')) ||
        processStatus === 'SCORED' ||
        (['REJECTED'].includes(processStatus) &&
          (!form.getFieldValue('templateId') || examineFlag)));
    // 控制”废弃“按钮
    const showObsoleted =
      eidtRemote && ['SCORING', 'NEW', 'SCORED', 'REJECTED'].includes(processStatus);
    // 控制“退回评分”按钮
    const backScoreFlag =
      eidtRemote &&
      (['SCORING', 'SCORED'].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && examineFlag));
    // 新建、拒绝后没有模板id，评分相关可编辑
    const scoreEdit =
      eidtRemote &&
      (['NEW', undefined].includes(processStatus) ||
        (['REJECTED'].includes(processStatus) && !examineFlag));
    // 评分完成后可编辑
    const scoreCompleteEdit =
      eidtRemote && ['NEW', 'REJECTED', 'SCORED', undefined].includes(processStatus);

    const supplierClassify = requisitionId ? supplierClassifyList : supplierClassifyData;

    const resultListRemoteProps = {
      supplierCompanyId,
      allLoading,
      requisitionId,
      isEdit: showSubmit,
      targetStageDescription,
      history,
      handSaveOrSubmit: this.saveOrReviewOrSubmit,
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
      sourceKey: stageSourceKey.prepare,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SUP_CLASSIFY_TABLE',
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_CLASSIFY_BTN_GROUP',
    };

    // 供应商相关业务单据
    const supplierRelatedDocBtnProps = {
      // isPub,
      companyId,
      toStageId,
      requisitionId,
      supplierCompanyId,
      sourceTarget: 'Prepare',
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_RELATED_DOC',
      customizeUnitBtnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_RELATED_BTN_FROUP',
      customizeBtnGroup,
      dimensionCode,
    };

    // 附件
    const enclosureTableProps = {
      isEdit: scoreCompleteEdit,
      currentUser,
      onOk: this.onOk,
      remote: preparedRemote,
      dataSource: attachmentList,
      onUpdateRow: this.updateAttachment,
      onDeleteRows: this.deleteAttachment,
      onClearRows: ref => {
        this.clearRows = ref;
      },
      setFileList: this.setFileList,
      clearFileList: this.clearFileList,
      onDraggerUploadRemove: this.onDraggerUploadRemove,
      customizeBtnGroup,
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_BTN_GROUP',
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_ATT_LN',
      customizeTable,
      otherProps: this.props,
    };

    const scoreInfoProps = {
      dispatch,
      templateId,
      requisitionId,
      stageCode,
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
      customizeBtnGroupCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARED_SCORE_BTN_GROUP',
    };

    const supplierAbilityTableProps = {
      history,
      location,
      requisitionId,
      pagination: false,
      supplierCompanyId,
      stageCode: 'PREPARE',
      dataSource: abilityDataSource,
      onAdd: this.handleAddAbility,
      onDeleteRows: this.deleteSupplierCapacity,
      isEdit,
      isImport: showImportOrDelete,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      formCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_FORM',
      tableCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_TABLE',
      btnCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_BTNGROUP',
      attCustomizeCode: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_ITEM_ATTACHMENT',
    };

    // 模型
    const modelTableProps = {
      tableList,
      interfaceChange: true,
      relationId: newRequisitionId,
      readOnly: !isEdit,
      readyQuery: !isEmpty(headerInfo),
      queryParams: {
        companyId,
        supplierCompanyId,
        supplierTenantId,
      },
      parentRef: this,
    };

    const titleType = toStageDescription || targetStageDescription;

    return (
      <React.Fragment>
        <Header
          title={
            readOnly || (hasId && !isCreateUser)
              ? `${titleType}${intl
                  .get(`sslm.commonApplication.view.title.application`)
                  .d('申请单')}`
              : hasId
              ? `${titleType}${intl
                  .get(`sslm.commonApplication.view.title.applicationMaintain`)
                  .d('申请单维护')}`
              : `${titleType}${intl
                  .get(`sslm.commonApplication.view.title.applicationCreation`)
                  .d('申请单创建')}`
          }
          backPath={isPub ? '' : historyBack || backPath}
        >
          <HeaderBtns
            readOnly={readOnly}
            loading={allLoading}
            reviewFlag={showReview}
            submitFlag={showSubmit}
            sourceType={sourceType}
            saveFlag={scoreCompleteEdit}
            processStatus={processStatus}
            prepareHeader={prepareHeader}
            obsoletedFlag={showObsoleted}
            backScoreFlag={backScoreFlag}
            requisitionId={requisitionId}
            deleteFlag={showImportOrDelete}
            customizeBtnGroup={customizeBtnGroup}
            onPrint={this.handlePrint}
            onDelete={this.deletePrepare}
            jump360={handleSupplierDetail}
            onBackScore={this.backScoreModal}
            onObsoleted={this.handleObsoleted}
            onSave={this.saveOrReviewOrSubmit}
            onOperat={this.openOperationsRecordModal}
          />
          {/* 宇培供应链埋点 */}
          {preparedRemote &&
            preparedRemote.render('PREPARED_INATE_HEADER_BTN', <></>, {
              resultListRemoteProps,
            })}
        </Header>
        <Content>
          <Spin spinning={allLoading || false}>
            <div style={{ marginLeft: 16 }}>
              <PrepareHeader
                form={form}
                custLoading={custLoading}
                customizeForm={customizeForm}
                isEdit={isEdit}
                scoreEdit={scoreEdit}
                prepareHeader={headerInfo}
                preparedRemote={preparedRemote}
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
                  code: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_TAB',
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
                      code="SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_SCORE_TABLE"
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
                    tab={intl
                      .get('sslm.commonApplication.view.message.tab.supplierClassificat')
                      .d('供应商分类')}
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
                      customizeBtnGroupCode="SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_PUR_BTN_GROUP"
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
          processType="prepare"
          requisitionId={reqId}
        />
      </React.Fragment>
    );
  }
}
