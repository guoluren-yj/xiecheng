/**
 * model 寻源服务/招标大厅
 * @date: 2018-12-25
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty, isArray } from 'lodash';
import { queryMapIdpValue, queryUUID } from 'services/api';
import {
  querySetting,
  fetchDataList,
  quotationFeedBack,
  fetchMaintainList,
  fetchClarList,
  queryIssueHeader,
  queryIssueLine,
  fetchClarifyViewDataList,
  fetchInquiryHeaderDetail,
  fetchItemLine,
  fetchItemDimensionHeader,
  fetchSupplierLine,
  fetchSupplierLineCheckPrice,
  fetchScoringElementData,
  fetchTempelateDetailData,
  fetchExpertAllocationData,
  fetchChangeTemplateData,
  changeCompany,
  submitWinningResult,
  deleteScoringElement,
  deleteScoringNoneTempelate,
  deleteScoringNoneExpert,
  saveScoringElement,
  saveScoringNoneTempelate,
  saveScoringNoneExpert,
  saveAllScoringTemplate,
  submitReturnToPretrial,
  fetchQuoteLine,
  saveItemLine,
  saveSupplierLine,
  deleteItemLines,
  deleteSupplierLines,
  savebidHallUpdate,
  releasebidHall,
  fetchBidMembers,
  fetchScoreDetails,
  fetchSupplierDimensionHeader,
  saveBidMembers,
  deleteBidMembers,
  fetchPretrialPanel,
  savePretrialPanel,
  deletePretrialPanel,
  fetchBulkSupplierData,
  createBid,
  fetchSupplier,
  saveSupplierRecordLine,
  openingBid,
  sendExpertScore,
  bidOpenList,
  operateBidList,
  resendPassword,
  quotationControll,
  saveSupplier,
  changeSubjectMatterRule,
  fetchEvaluateIndicAssign,
  saveEvaluateIndicAssign,
  fetchClarifyScrapped,
  fetchClarifyRelease,
  fetchClarifySave,
  fetchClarifyDetail,
  fetchClarifyReferIssue,
  fetchSectionList,
  fetchBidEvalProgress,
  fetchSupplierList,
  fetchExpertList,
  fetchExpertScoreInfo,
  reScoring,
  fetchScoreLine,
  saveEvaluateSummary,
  submitEvaluateSummary,
  fetchAloneItemLine,
  fetchAloneSupplierItemLine,
  fetchEvaluateSummary,
  fetchScoreDetail,
  saveBidCandidate,
  submitBidCandidate,
  saveCalibrationManagNot,
  submitCalibrationManagNot,
  queryCalibMangeYes,
  fetchBidEvaluateExpertScoring,
  fetchCalibrationQuotation,
  saveCalibrationManagYes,
  submitCalibrationManagYes,
  getSupplierList,
  fetchClarifyNotifyDataList,
  fetchBidIssueHeader,
  fetchClarifyIssueHeader,
  fetchQuestionRows,
  deleteQuestionRows,
  saveQuestRowLine,
  saveQuestion,
  submitQuestion,
  deleteNotice,
  openScaling,
  closeScaling,
  createApplyToInquiry,
  checkApplyToInquiry,
  fetchSectionDetailData,
  saveSectionDetailData,
  fetchMoveSectionData,
  moveOtherSectionData,
  deleteTabPane,
  reScoringAll,
  cancelbidHallUpdate,
  fetchCreatedUnitName,
  fetchItemLineQuotationDetail,
  fetchItemSupplierLineQuotationDetail,
  exportData,
  sourcingItemCreate,
  querySupplierExchangeEdit,
  saveExchangeEdit,
  fetchMatterRequireFlag,
  fetchHistoryApproval,
  transferCalibration,
  queryCenterPopData,
  saveCenterPopData,
  bidProcessAttachments,
  bidEvaluationDetails, // 评分阶段评分明细
  fetchSumScore, //  确认候选人总分
  queryRfxTemplateDetail,
  validateBeforeSubmit,
  validateDiffBeforeSubmit,
  saveReviewEvaluateSummary,
  submitReviewEvaluateSummary,
  queryUnitCustConfig,
  queryPriceInfo,
  priceList,
  fetchBidIPCoincidenceRate,
  wholePackage,
  allowAddItemSupplier,
} from '@/services/bidHallService';

import {
  queryClarifyNotifyDetailList,
  queryClarifyNotifyDetailHeader,
} from '@/services/expertScoringService';
import {
  fetchApplyToInquiry,
  fetchIPCoincidenceRate,
  fetchQuotationDetail,
  fetchElementsDetailLine,
  saveElementsDetail,
  deleteElementsDetail,
} from '@/services/inquiryHallService';

import {
  fetchHeaderInfo,
  prequalDetailHeaderBidDetail,
  prequalDetailBidDetail,
  openBidDetail,
  quotationDetailBidDetail,
  fetchBidDetailProcessAll,
  fetchLineNoneDetail,
  fetchLinePackDetail,
} from '@/services/bidEventQueryService';

import { fetchListData } from '@/services/projectSetupService';

import { getResponseParse } from '@/utils/utils';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

function dealDataStateRecursive(data) {
  let config = [];

  config = data.map((item) => {
    if (item.children) {
      let subConfig = [];
      subConfig = item.children.map((subItem) => {
        return {
          ...subItem,
          _status: 'update',
        };
      });

      // eslint-disable-next-line
      item.children = subConfig;
    }

    return {
      ...item,
      _status: 'update',
    };
  });

  return config;
}

/**
 * 更新数据源 - quotationLineId
 * @param {Array} newData - 新数据
 * @param {Array} originData - 源数据
 * @param {string} fieldName - 字段名
 */
function updateDataState(newData = [], originData = [], fieldName) {
  // 把源数据 =》map, ps: 数据源巨大时, 可看出巨大时间差异
  const dataMap = {};
  newData.forEach((item) => {
    dataMap[item.quotationLineId] = item.value;
  });
  return originData.map((r) => {
    return {
      ...r,
      [fieldName]: dataMap[r.quotationLineId],
    };
  });
}

function addDataStateForBidSectionList(data = {}) {
  const mapData = data.evaluateSummaryMap || {};

  Object.keys(mapData).forEach((item) => {
    if (!Array.isArray(mapData[item]) || !mapData[item].length) {
      return;
    }

    const subConfig = mapData[item].map((child) => {
      return {
        ...child,
        _status: 'update',
      };
    });

    mapData[item] = subConfig;
  });

  return {
    ...data,
    evaluateSummaryMap: mapData,
  };
}

// 评标管理--分标段-专家查询-处理专家数据
function formatExpertList(result, bidLineItemId, bidList, bidPagination) {
  let expertBidList = {};
  let expertBidPagination = {};
  if (isArray(bidLineItemId)) {
    // 初始化查询专家
    bidLineItemId.forEach((item) => {
      expertBidList = { ...expertBidList, [item]: result.content };
      expertBidPagination = { ...expertBidPagination, [item]: createPagination(result) };
    });
  } else {
    // 点击分页查询
    expertBidList = { ...bidList, [bidLineItemId]: result.content };
    expertBidPagination = { ...bidPagination, [bidLineItemId]: createPagination(result) };
  }
  const payload = { expertBidList, expertBidPagination, expertList: result.content };
  return payload;
}

// 评标管理-单个专家-评分信息查询-处理专家对供应商打分数据
function formatScoreList(result, bidLineItemId, expertUserId, expertScore) {
  let expertScoreList = {};
  expertScoreList = { ...expertScore, [`${bidLineItemId}#${expertUserId}`]: result };
  return expertScoreList;
}

const getModel = (modelName = 'bidHall') => ({
  namespace: modelName,
  state: {
    list: [], // 询价大厅数据列表
    bidList: [], // 招标大厅列表
    bidPagination: {}, // 招标大厅分页
    controllerList: [], // 招投标控制数据列表
    controllerPagination: {}, // 询投标控制分页
    code: {}, // 值集
    bidMembersList: [], // 招标小组列表
    scoreDetailsData: [], // 评分明细列表
    pagination: {}, // 分页器
    quotationFeedBackList: [], // 投标响应列表
    fetchMaintainList: [], // 投标澄清维护列表
    maintainListPagination: {}, // 投标澄清维护列表分页
    fetchClarList: [], // 投标澄清所有问题列表
    fetchClarListPagination: {}, // 投标澄清所有问题列表分页
    issueHeader: {}, // 问题查看头数据
    issueLineList: [],
    itemLineQuotationDetail: [], // 物品明细报价详情
    supplierLineQuotationDetail: [], // 供应商查询报价明细
    pretrialPanelList: [], // 预审小组数据
    issueLinePagination: {},
    clarifyViewList: [], // 投标澄清查看列表
    clarifyViewPagination: {}, // // 投标澄清查看列表分页
    header: {}, // 招标大厅维护页面头
    changeTemplateData: {}, // 改变寻源模板获取招标头信息
    examinationHeader: {}, // 资格审查 详情页面
    sourceHeader: {}, // 专家评分头信息
    bidClarificationHeader: {}, // 招投标澄清维护 头信息
    bidTenderQueryHeader: {}, // 招投标澄清查询 头信息
    itemLine: [], // 物品明细数据
    itemDimensionHeaderData: [], // 物品维度头数据
    itemLineExpandedKeys: [], // 物品明细行展开keys
    supplierData: [], // 物品明细供应商数据
    examinationItemLine: [], // 资格审查 物品行明细数据
    examinationItemLinePagination: [], // 资格审查 物品行明细分页
    sourceItemLine: [], // 专家评分 物品行明细数据
    sourceItemLinePagination: [], // 专家评分 物品行明细分页
    bidClarificationItemLine: [], // 招投标澄清维护 物品行明细数据
    bidClarificationItemLinePagination: [], // 招投标澄清维护 物品行明细分页
    bidTenderQueryItemLine: [], // 招投标澄清查询 物品行明细数据
    bidTenderQueryItemLinePagination: [], // 招投标澄清查询 物品行明细分页
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {}, // 供应商列表数据分页
    examinationSupplierLine: [], // 资格审查 供应商列表
    examinationSupplierLinePagination: {}, // 资格审查 供应商列表分页
    sourceSupplierLine: [], // 专家评分 供应商列表
    sourceSupplierLinePagination: {}, // 专家评分 供应商列表分页
    bidClarificationSupplierLine: [], // 招投标澄清维护 供应商列表
    bidClarificationSupplierLinePagination: {}, // 招投标澄清维护 供应商列表分页
    bidTenderQuerySupplierLine: [], // 招投标澄清查询 供应商列表
    bidTenderQuerySupplierLinePagination: {}, // 招投标澄清查询 供应商列表分页
    itemQuoteLine: [], // 核价物品投标明细
    itemQuoteLinePagination: {}, // 核价物品投标明细分页
    supplierQuoteLine: [], // 核价供应商投标
    supplierQuoteLinePagination: {}, // 核价供应商投标分页
    quoteLine: [], // 核价全部投标明细
    quoteLinePagination: {}, // 核价全部投标明细分页
    operationData: [], // 操作记录数据
    priceChartsData: [], // 缩略图数据
    ladderLevelData: [], // 阶梯投标数据
    barginLadderLevelData: [], // 阶梯还价数据
    quotaLadderLevelData: [], // 核价/初审阶梯等级数据
    ipCoincidenceRate: [], // 核价-ip重合率数据
    operationPagination: {}, // 操作记录分页
    bidHolderList: [], // 开标人数据
    bidHolderPagination: {}, // 开标人分页
    allLine: [], // 所有投标明细
    allLinePagination: {}, // 全部投标明细分页
    aloneItemLine: {}, // 定标：根据物料头id获取物料明细列表
    aloneSupplierItemLine: {}, // 定标：根据供应商id获取供应商列表
    itemLineChange: false, // 物料行是否发生改变
    LadderLevelChange: false, // 阶梯投标是否发生变化
    supplierLineChange: false, // 供应商行是否发生改变
    allLineChange: false, // 全部明细是否发生改变
    itemContentChange: {}, // 物料行table是否发生改变
    supplierContentChange: {}, // 供应商行table是否发生改变
    bulkSupplierList: [], // 批量添加供应商列表数据
    bulkSupplierListPagination: {}, // 批量添加供应商列表数据分页
    stageData: [], // 工作流节点
    bidOpenData: [], // 开标入口数据
    operateBidData: [], // 开标操作数据
    examinationStageData: [], // 审查工作流节点
    sourceStageData: [], // 专家评分工作流节点
    bidClarificationStageData: [], // 招投标澄清维护工作流节点
    bidTenderQueryStageData: [], // 招投标澄清澄清工作流节点
    addSupplierLine: [],
    quotationPriceLine: [], // 比价助手投标(最新投标/历史投标/历史轮次投标)数据
    quotationPricePagination: {}, // 比价助手投标(最新投标/历史投标/历史轮次投标)数据分页
    recordList: [], // 招标监控台投标历史记录
    recordListPagination: {}, // 招标监控台投标历史记录分页
    lineData: [], // 招标监控台监控台折线图数据
    applyToInquiryLine: [], // 申请转招标行数据
    applyToInquiryPagination: {}, // 申请转招标分页
    scoringElement: [], // 评分要素数据
    scoringNoneTempelate: [], // 模板明细不区分数据
    scoringBusinessTempelate: [], // 模板明细商务组数据
    scoringTechnologyTempelate: [], // 模板明细技术组数据
    evaluateExpertList: [], // none/diff 合并
    currentScoringExperts: [], // 当前评分要素专家数据
    clarificationQuestionList: [], // 澄清函引用问题列表
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    clarificationDetails: {}, // 澄清函详情
    attachmentUUId: '', // 澄清函附件上传
    supplierDimensionHeaderList: [], // 定标供应商维度头信息
    // supplierDimensionHeaderPagination: [], // 定标供应商维度头信息查询
    clarificationContext: undefined,
    sectionInfo: {}, // 评标管理--标段信息
    supplierList: {}, // 评标管理--分标段/不分标段-供应商维度信息
    expertList: [], // 评标管理--不分标段-专家信息
    expertPagination: {}, // 评标管理--不分标段-专家信息分页
    expertBidList: {}, // 评标管理--分标段-专家信息
    expertBidPagination: {}, // 评标管理--分标段-专家信息分页
    bidEvalProgress: [], // 评标管理-招标评标进度条信息
    expertScoreList: [], // 评标管理-单个专家-评分信息
    scoreLine: {}, // 评分管理-单个专家-供应商评分细项查询
    // rfxScoreLine: {}, // rfx-评分管理-单个专家-供应商评分细项查询
    bidSectionList: {}, // 确认中标候选人 - 标段列表
    scoreDetailList: [], // 确认中标候选人 - 评分明细列表
    scoreDetailPagination: {}, // 确认中标候选人 - 评分明细列表pagination
    bidEvaluateExpertScoringList: [], // 评标管理专家评分
    evaluateSectionList: [], // 定标管理供应商数据
    calibQuotationList: [], // 定标供应商下物品列表
    calibQuotPagination: {}, // 定标管理供应商下物品列表
    historys: '', // 页面路由记录
    supplierDimensionList: [], // 评标过程管理供应商维度数据
    ClarifyNotifyDataList: [], // 澄清单列表数据
    questionInformationHeader: {}, // 创建评标问题头信息
    questionRowsList: [], // 创建澄清问题列表
    questionRowsPagination: {}, // 创建澄清列表分页
    clarifyNotifyDataList: [], // 澄清单列表数据
    clarifyNotifyDataListPagination: {}, // 澄清单列表分页
    clarifyNotifyDetailList: [], // 澄清详情列表数据
    clarifyNotifyDetailListPagination: {}, // 澄清详情列表分页数据
    clarifyNotifyDetailHeader: {}, // 澄清单详情头信息
    backPath: {}, // 路由跳转记录对象
    setionDetailList: {}, // 单个标段信息
    moveSectionDetailList: [], // 某个标书下面的所有标段信息
    settings: {}, // 配置中心配置项
    cHallHeader: {}, // 询价大厅创建页面头
    itemQuotationPagination: {}, // 物品行报价明细分页
    itemQuotationDetail: [], // 物品行报价明细
    QuotationDetailDataSource: {}, // 物品行报价明细总数据

    quoteApprovalList: [], // 立项转招投标列表数据
    quoteApprovalPagination: {}, // 立项转招投标分页
    exchangeEditSupplierList: [], // 核价/汇率编辑/供应商查询list
    headerInfo: [], // 招标简单头
    bidDetailPrequalHeader: {}, // bid明细 资格预审头信息
    prequalDetailList: [], // bid明细 资格预审详情数据
    prequalDetailPagination: {}, // bid明细 资格预审详情数据分页
    bidDetailOpenBidList: [], // 开标信息
    bidDetailQuotationList: [], // 投标详情
    bidDetailQuotationPagination: {}, // 投标分页
    LineNoneList: [],
    centerPopData: [], // 定标物料补充中心弹窗数据
    bidProcessAttachments: [], // 招标过程附件
    bidProcessPagination: {}, // 招标过程附件分页
    scoreDetails: {}, // 评分明细
    sumScoreData: [], // 总分
    elementsDetailLineList: [], // 评分要素细项列表
    elementsDetailLinePagination: {}, // 评分要素细项分页
  },
  effects: {
    // 核价-汇率编辑-保存
    *saveExchangeEdit({ payload }, { call }) {
      const result = getResponse(yield call(saveExchangeEdit, payload));
      return result;
    },
    // 核价-汇率编辑-供应商查询
    *querySupplierExchangeEdit({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierExchangeEdit, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            exchangeEditSupplierList: dealDataState(res),
          },
        });
      }
      return res;
    },

    // 查询配置中心配置项
    *querySetting({ payload }, { call, put }) {
      const settings = getResponse(yield call(querySetting, payload));
      if (settings) {
        yield put({
          type: 'updateState',
          payload: {
            settings,
          },
        });
      }
    },
    // 申请转招标列表查询
    *fetchApplyToInquiry({ payload }, { call, put }) {
      let result = yield call(fetchApplyToInquiry, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            applyToInquiryLine: result.content,
            applyToInquiryPagination: createPagination(result),
          },
        });
      }
    },
    // 获取列表
    *fetchDataList({ payload }, { call, put }) {
      let result = yield call(fetchDataList, payload);

      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidList: result.content,
            bidPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 获取澄清详情列表数据
    *queryClarifyNotifyDetailList({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyDetailList, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDetailList: result.content,
            clarifyNotifyDetailListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取澄清单详情头信息
    *queryClarifyNotifyDetailHeader({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyDetailHeader, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDetailHeader: result,
          },
        });
      }
      return result;
    },

    // 投标响应
    *quotationFeedBack({ payload }, { call, put }) {
      const result = getResponse(yield call(quotationFeedBack, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationFeedBackList: result,
          },
        });
      }
      return result;
    },
    // 采购方澄清维护list
    *fetchMaintainList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMaintainList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchMaintainList: dealDataState(result.content),
            maintainListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 采购方引用问题list
    *fetchClarList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClarList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchClarList: dealDataState(result.content),
            fetchClarListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 采购方澄清函查看list
    *fetchClarifyViewDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClarifyViewDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyViewList: dealDataState(result.content),
            clarifyViewPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 澄清函问题详情头数据
    *queryIssueHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(queryIssueHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            issueHeader: result,
          },
        });
      }
      return result;
    },
    // 澄清函问题详情行数据
    *queryIssueLine({ payload }, { call, put }) {
      const result = getResponse(yield call(queryIssueLine, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            issueLineList: dealDataState(result.content),
            issueLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取招标大厅维护头
    *fetchBidHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInquiryHeaderDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },

    // 获取物品明细列表
    *fetchItemLine({ payload }, { call, put }) {
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },
    // 获取物品明细列表
    *fetchItemDimensionHeader({ payload }, { call, put }) {
      let result = yield call(fetchItemDimensionHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemDimensionHeaderData: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },
    // 获取供应商列表
    *fetchSupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content),
            supplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 评标过程管理供应商维度查询
    *querySupplierDimensionList({ payload }, { call, put }) {
      let result = yield call(getSupplierList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDimensionList: result,
          },
        });
      }
      return result;
    },
    // 查询澄清通知列表
    *fetchClarifyNotifyDataList({ payload }, { call, put }) {
      let result = yield call(fetchClarifyNotifyDataList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyDataList: result.content,
            clarifyNotifyDataListPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 获取招标小组
    *fetchBidMembers({ payload }, { call, put }) {
      let result = yield call(fetchBidMembers, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidMembersList: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 获取招标小组
    *fetchScoreDetails({ payload }, { call, put }) {
      let result = yield call(fetchScoreDetails, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetailsData: dealDataState(result.content),
          },
        });
      }
      return result;
    },
    // 保存招标小组
    *saveBidMembers({ payload }, { call }) {
      let result = yield call(saveBidMembers, payload);
      result = getResponse(result);
      return result;
    },

    // 删除招标小组
    *deleteBidMembers({ payload }, { call }) {
      let result = yield call(deleteBidMembers, payload);
      result = getResponse(result);
      return result;
    },

    // 预审小组-查询
    *fetchPretrialPanel({ payload }, { call, put }) {
      const response = yield call(fetchPretrialPanel, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            pretrialPanelList: dealDataState(data),
          },
        });
      }
    },

    // 预审小组-保存
    *savePretrialPanel({ payload }, { call }) {
      const response = yield call(savePretrialPanel, payload);
      return getResponse(response);
    },

    // 预审小组-删除
    *deletePretrialPanel({ payload }, { call }) {
      const response = yield call(deletePretrialPanel, payload);
      return getResponse(response);
    },

    // 获取模板信息
    *fetchBulkSupplierData({ payload }, { call, put }) {
      let result = yield call(fetchBulkSupplierData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bulkSupplierList: result.content,
            bulkSupplierListPagination: createPagination(result),
          },
        });
      }
    },
    // 获取供应商列表
    *fetchSupplierLineCheckPrice({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLineCheckPrice, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content),
            supplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取评分要素定义数据
    *fetchScoringElementData({ payload }, { call, put }) {
      let result = yield call(fetchScoringElementData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringElement: dealDataState(result),
          },
        });
      }
    },
    // 获取模板明细数据
    *fetchTempelateDetailData({ payload }, { call, put }) {
      let result = yield call(fetchTempelateDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringNoneTempelate: dealDataState(result.otherIndicList),
            scoringBusinessTempelate: dealDataState(result.businessIndicList),
            scoringTechnologyTempelate: dealDataState(result.technologyIndicList),
          },
        });
      }
      return result;
    },
    // 获取专家分配数据
    *fetchExpertAllocationData({ payload }, { call, put }) {
      let result = yield call(fetchExpertAllocationData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evaluateExpertList: dealDataState(result.evaluateExpertList),
          },
        });
      }
    },
    // 改变招标大厅寻源模板获取招标大厅维护头
    *fetchChangeTemplateData({ payload }, { call, put }) {
      const { routerParam } = payload;
      const result = getResponse(yield call(fetchChangeTemplateData, payload));
      if (result) {
        if (routerParam) {
          yield put({
            type: 'updateState',
            payload: {
              changeTemplateData: result,
            },
          });
        }
      }
      return result;
    },
    // 改变招标大厅公司获取供应商信息
    *changeCompany({ payload }, { call }) {
      const result = getResponse(yield call(changeCompany, payload));
      return result;
    },
    // 中标结果确认 - 提交
    *submitWinningResult({ payload }, { call }) {
      const result = getResponse(yield call(submitWinningResult, payload));
      return result;
    },
    // 专家分配-保存
    *saveScoringNoneExpert({ payload }, { call }) {
      const result = getResponse(yield call(saveScoringNoneExpert, payload));
      return result;
    },
    // 专家要素参考模板保存
    *saveAllScoringTemplate({ payload }, { call }) {
      const result = getResponse(yield call(saveAllScoringTemplate, payload));
      return result;
    },
    // 评分要素-专家分配-查询
    *fetchEvaluateIndicAssign({ payload }, { call, put }) {
      let result = yield call(fetchEvaluateIndicAssign, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentScoringExperts: dealDataState(result),
          },
        });
      }
    },
    *saveEvaluateIndicAssign({ payload }, { call }) {
      const result = getResponse(yield call(saveEvaluateIndicAssign, payload));
      return result;
    },
    // 专家分配-批量删除
    *deleteScoringNoneExpert({ payload }, { call }) {
      const result = getResponse(yield call(deleteScoringNoneExpert, payload));
      return result;
    },
    // 模板明细-保存
    *saveScoringNoneTempelate({ payload }, { call }) {
      const result = getResponse(yield call(saveScoringNoneTempelate, payload));
      return result;
    },
    // 申请转招标创建保存API
    *createApplyToInquiry({ payload }, { call }) {
      const result = getResponseParse(yield call(createApplyToInquiry, payload));
      return result;
    },
    // 申请转招标创建前校验API
    *checkApplyToInquiry({ payload }, { call }) {
      const result = getResponse(yield call(checkApplyToInquiry, payload));
      return result;
    },
    // 模板明细-批量删除
    *deleteScoringNoneTempelate({ payload }, { call }) {
      const result = getResponse(yield call(deleteScoringNoneTempelate, payload));
      return result;
    },
    // 评分要素-批量删除
    *deleteScoringElement({ payload }, { call }) {
      const result = getResponse(yield call(deleteScoringElement, payload));
      return result;
    },
    // 评分要素-保存
    *saveScoringElement({ payload }, { call }) {
      const result = getResponse(yield call(saveScoringElement, payload));
      return result;
    },
    // 核价 - 退回至初审
    *submitReturnToPretrial({ payload }, { call }) {
      const result = getResponse(yield call(submitReturnToPretrial, payload));
      return result;
    },
    // 获取核价全部投标明细
    *fetchQuoteLine({ payload }, { call, put }) {
      let result = yield call(fetchQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteLine: dealDataState(result.content),
            quoteLinePagination: createPagination(result),
          },
        });
      }
      return dealDataState(result.content);
    },
    // 核价 - 查看供应商ip重合率
    *fetchIPCoincidenceRate({ payload }, { call, put }) {
      let result = yield call(fetchIPCoincidenceRate, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ipCoincidenceRate: result,
          },
        });
      }
    },
    // 新增物品明细行
    *saveItemLine({ payload }, { call }) {
      const result = getResponse(yield call(saveItemLine, payload));
      return result;
    },
    // 新增供应商列表行
    *saveSupplierLine({ payload }, { call }) {
      const result = getResponse(yield call(saveSupplierLine, payload));
      return result;
    },
    // 物品明细行-批量删除
    *deleteItemLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteItemLines, payload));
      return result;
    },
    // 供应商列表行-批量删除
    *deleteSupplierLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteSupplierLines, payload));
      return result;
    },
    // 维护页面-保存
    *savebidHallUpdate({ payload }, { call }) {
      const result = getResponse(yield call(savebidHallUpdate, payload));
      return result;
    },
    // 维护页面-取消
    *cancelbidHallUpdate({ payload }, { call }) {
      const result = getResponse(yield call(cancelbidHallUpdate, payload));
      return result;
    },
    // 维护页面-发布
    *releasebidHall({ payload }, { call }) {
      const result = getResponse(yield call(releasebidHall, payload));
      return result;
    },
    // 招标单创建
    *createBid({ payload }, { call }) {
      const result = yield call(createBid, payload);
      return getResponse(result);
    },
    // 供应商list
    *supplierRecord({ payload }, { call, put }) {
      let result = yield call(fetchSupplier, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierData: dealDataState(result),
          },
        });
      }
    },
    // 筛选供应商修改保存
    *saveSupplierRecordLine({ payload }, { call }) {
      const response = yield call(saveSupplierRecordLine, payload);
      return getResponse(response);
    },
    // 开标入口list
    *bidOpenList({ payload }, { call, put }) {
      let result = yield call(bidOpenList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidOpenData: result,
          },
        });
      }
    },
    // 开标入口list
    *operateBidList({ payload }, { call, put }) {
      let result = yield call(operateBidList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operateBidData: result,
          },
        });
      }
    },
    // 开标
    *openingBid({ payload }, { call }) {
      return getResponse(yield call(openingBid, payload));
    },
    // 下发专家评分
    *sendExpertScore({ payload }, { call }) {
      return getResponse(yield call(sendExpertScore, payload));
    },
    // 重发密码
    *resendPassword({ payload }, { call }) {
      return getResponse(yield call(resendPassword, payload));
    },
    // 暂停招投标
    *pause({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 关闭招投标
    *close({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 关闭定标
    *closeScaling({ payload }, { call }) {
      const res = yield call(closeScaling, payload);
      return getResponse(res);
    },
    // 开始定标
    *openScaling({ payload }, { call }) {
      const res = yield call(openScaling, payload);
      return getResponse(res);
    },
    // 重启招投标
    *resume({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 结束
    *over({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 保存
    *saveSupplier({ payload }, { call }) {
      const result = yield call(saveSupplier, payload);
      return getResponse(result);
    },
    // 改变标的规则
    *changeSubjectMatterRule({ payload }, { call }) {
      const result = yield call(changeSubjectMatterRule, payload);
      return getResponse(result);
    },
    // 澄清函上传附件的uuid
    *getAttachmentUUId({ payload }, { call, put }) {
      const response = yield call(queryUUID, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentUUId: list.content,
          },
        });
      }
    },
    // 澄清函删除
    *fetchClarifyScrapped({ payload }, { call }) {
      const response = yield call(fetchClarifyScrapped, payload);
      return getResponse(response);
    },
    // 澄清函提交
    *fetchClarifyRelease({ payload }, { call }) {
      const response = yield call(fetchClarifyRelease, payload);
      return getResponse(response);
    },
    // 澄清函保存
    *fetchClarifySave({ payload }, { call }) {
      const response = yield call(fetchClarifySave, payload);
      return getResponse(response);
    },
    // 澄清函关联问题查询
    *fetchClarifyReferIssue({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchClarifyReferIssue, payload));
      yield put({
        type: 'updateState',
        payload: {
          clarificationQuestionList: dealDataState(result.content),
          clarificationQuestionPagination: createPagination(result),
        },
      });
      return result;
    },
    // 澄清函详情
    *fetchClarifyDetail({ payload }, { call, put }) {
      let result = yield call(fetchClarifyDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarificationDetails: result,
            clarificationContext: result.context,
          },
        });
      }
      return result;
    },
    // 评标管理-招标评标进度条
    *fetchBidEvalProgress({ payload }, { call, put }) {
      let result = yield call(fetchBidEvalProgress, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidEvalProgress: result,
          },
        });
      }
    },
    // 评标管理--标段查询
    *fetchSectionList({ payload }, { call, put }) {
      let result = yield call(fetchSectionList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sectionInfo: result,
          },
        });
      }
      return result;
    },
    // 评标管理--分标段/不分标段-供应商查询
    *fetchSupplierList({ payload }, { call, put }) {
      let result = yield call(fetchSupplierList, payload);
      result = getResponse(result);
      if (result) {
        const { sourceStatus = '' } = payload || {};
        let supplierListState = result;
        // 符合性检查结果确认 处理成h0可编辑模式
        if (sourceStatus === 'RFX_INITIAL_REVIEW_PENDING') {
          const dealData = dealDataState(result[result.subjectMatterRule] || []);
          supplierListState = {
            ...result,
            [result.subjectMatterRule]: dealData,
          };
        }
        yield put({
          type: 'updateState',
          payload: {
            supplierList: supplierListState,
          },
        });
      }
    },
    // 评标管理--不分标段-专家查询
    *fetchExpertList({ payload }, { call, put }) {
      let result = yield call(fetchExpertList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            expertList: result.content,
            expertPagination: createPagination(result),
          },
        });
      }
    },
    // 评标管理--分标段-专家查询
    *fetchBidExpertList({ payload }, { call, put }) {
      const {
        bidLineItemId,
        expertBidList = {},
        expertBidPagination = {},
        ...otherPayload
      } = payload;
      let result = yield call(fetchExpertList, otherPayload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: formatExpertList(result, bidLineItemId, expertBidList, expertBidPagination),
        });
      }
    },
    // 评标管理-单个专家-评分信息查询
    *fetchExpertScoreInfo({ payload }, { call, put }) {
      const { expertUserId, bidLineItemId, expertScoreList, ...otherPayload } = payload;
      let result = yield call(fetchExpertScoreInfo, { ...otherPayload, bidLineItemId });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            expertScoreList: formatScoreList(result, bidLineItemId, expertUserId, expertScoreList),
          },
        });
      }
      return result;
    },
    // 评标管理-重新评分
    *reScoring({ payload }, { call }) {
      const response = yield call(reScoring, payload);
      return getResponse(response);
    },
    // 评分管理-单个专家-供应商评分细项查询
    *fetchScoreLine({ payload }, { call, put }) {
      const { sourceFrom, ...otherPayload } = payload;
      let result = yield call(fetchScoreLine, otherPayload);
      result = getResponse(result);
      if (result) {
        // const data = sourceFrom === 'RFX' ? 'rfxScoreLine' : 'scoreLine';
        yield put({
          type: 'updateState',
          payload: {
            scoreLine: result,
          },
        });
      }
    },
    // 评标管理-标段-评分汇总保存
    *saveEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(saveEvaluateSummary, payload));
      return result;
    },
    // 评标管理-整单提交
    *submitEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(submitEvaluateSummary, payload));
      return result;
    },
    // 评分过程管理-全部重新评分
    *reScoringAll({ payload }, { call }) {
      const result = yield call(reScoringAll, payload);
      return getResponse(result);
    },
    // 定标获取供应商维度
    *fetchSupplierDimensionHeader({ payload }, { call, put }) {
      let result = yield call(fetchSupplierDimensionHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDimensionHeaderList: dealDataState(result),
            // supplierDimensionHeaderPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 定标--单独获取物料行
    *fetchAloneItemLine({ payload }, { call, put }) {
      const { bidLineItemId } = payload;
      let result = yield call(fetchAloneItemLine, payload);
      result = getResponse(result);
      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateItemList',
          payload: {
            bidLineItemId,
            pagination,
            list: dealDataState(result.content),
          },
        });
        return dealDataState(result.content);
      }
    },
    // 定标--单独获取物料行
    *fetchAloneSupplierItemLine({ payload }, { call, put }) {
      const { supplierCompanyId } = payload;
      let result = yield call(fetchAloneSupplierItemLine, payload);
      result = getResponse(result);
      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateSupplierItemList',
          payload: {
            supplierCompanyId,
            pagination,
            list: dealDataState(result.content),
          },
        });
        return dealDataState(result.content);
      }
    },
    // 确认中标候选人 - 获取标段下供应商详情
    *fetchEvaluateSummary({ payload }, { call, put }) {
      let result = yield call(fetchEvaluateSummary, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidSectionList: addDataStateForBidSectionList(result),
          },
        });
      }
      return result;
    },
    // 确认中标候选人 - 获取标段下供应商的评分明细,
    *fetchScoreDetail({ payload }, { call, put }) {
      let result = yield call(fetchScoreDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetailList: dealDataState(result.content),
            scoreDetailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 确认中标候选人 - 保存
    *saveBidCandidate({ payload }, { call }) {
      const response = yield call(saveBidCandidate, payload);
      return getResponse(response);
    },
    // 确认中标候选人 - 提交
    *submitBidCandidate({ payload }, { call }) {
      const response = yield call(submitBidCandidate, payload);
      return getResponse(response);
    },
    // 定标管理 - 保存
    *saveCalibrationManagNot({ payload }, { call }) {
      const response = yield call(saveCalibrationManagNot, payload);
      return getResponse(response);
    },
    // 定标管理 - 提交
    *submitCalibrationManagNot({ payload }, { call }) {
      const response = yield call(submitCalibrationManagNot, payload);
      return getResponse(response);
    },
    // 定标管理获取供应商评分信息--区分标段
    *queryCalibMangeYes({ payload }, { call, put }) {
      let result = yield call(queryCalibMangeYes, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evaluateSectionList: result,
          },
        });
      }
      return result;
    },
    // 定标管理区分标段 - 保存
    *saveCalibrationManagYes({ payload }, { call }) {
      const response = yield call(saveCalibrationManagYes, payload);
      return getResponse(response);
    },
    // 定标管理区分标段 - 提交
    *submitCalibrationManagYes({ payload }, { call }) {
      const response = yield call(submitCalibrationManagYes, payload);
      return getResponse(response);
    },
    // 评标管理-专家评分情况
    *fetchBidEvaluateExpertScoring({ payload }, { call, put }) {
      let result = yield call(fetchBidEvaluateExpertScoring, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidEvaluateExpertScoringList: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 定标管理区分标段供应商投标物料行查询API  ===> 展开物料行信息
    *fetchCalibrationQuotation({ payload }, { call, put }) {
      const { quotationHeaderId, sectionId } = payload;
      let result = yield call(fetchCalibrationQuotation, payload);
      result = getResponse(result);
      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateCalibItemList',
          payload: {
            quotationHeaderId,
            list: dealDataState(result.content),
            pagination,
            sectionId,
          },
        });
      }
      return result;
    },
    // 问题头查询
    *fetchBidIssueHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchBidIssueHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
    },

    // 澄清评审保存后问题头查询
    *fetchClarifyIssueHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchClarifyIssueHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
    },
    // 问题行查询
    *fetchQuestionRows({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuestionRows, payload));
      const questionRowsPagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            questionRowsList: dealDataState(result.content),
            questionRowsPagination,
          },
        });
      }
    },
    // 评审澄清删除问题行
    *deleteQuestionRows({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuestionRows, payload));
      return result;
    },
    // 评审澄清保存问题
    *saveQuestRowLine({ payload }, { call }) {
      const result = getResponse(yield call(saveQuestRowLine, payload));
      return result;
    },

    // 评审澄清头行总体保存
    *saveQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveQuestion, payload));
      return result;
    },
    // 评审澄清头行总体提交
    *submitQuestion({ payload }, { call }) {
      const result = getResponse(yield call(submitQuestion, payload));
      return result;
    },
    // 评审澄清通知删除
    *deleteNotice({ payload }, { call }) {
      const result = getResponse(yield call(deleteNotice, payload));
      return result;
    },
    // 获取单个标段数据
    *fetchSectionDetailData({ payload }, { call, put }) {
      let result = yield call(fetchSectionDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            setionDetailList: result,
          },
        });
      }
    },
    // 新建/修改单个标段信息
    *saveSectionDetailData({ payload }, { call }) {
      const result = yield call(saveSectionDetailData, payload);
      return getResponse(result);
    },
    // 获取某个标书下面的所有标段
    *fetchMoveSectionData({ payload }, { call, put }) {
      let result = yield call(fetchMoveSectionData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            moveSectionDetailList: dealDataState(result),
          },
        });
      }
    },
    // 移到其它标段操作
    *moveOtherSectionData({ payload }, { call }) {
      const result = yield call(moveOtherSectionData, payload);
      return getResponse(result);
    },
    // 删除某个标段及其下面的物料
    *deleteTabPane({ payload }, { call }) {
      const result = getResponse(yield call(deleteTabPane, payload));
      return result;
    },
    // 招标大厅-创建页面头
    *fetchCreatedUnitName({ payload }, { call, put }) {
      let result = yield call(fetchCreatedUnitName, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            cHallHeader: result,
          },
        });
      }
    },
    // 获取物品行报价详情
    *fetchItemLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLineQuotationDetail: dealDataState(result),
          },
        });
      }

      return dealDataState(result);
    },

    *fetchItemSupplierLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemSupplierLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLineQuotationDetail: result,
          },
        });
      }
      return result;
    },
    // 采购方物料报价明细
    *fetchQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetail, payload);
      result = getResponse(result);
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            QuotationDetailDataSource: result,
            itemQuotationDetail: dealDataState(result.supQuotationDetailPage.content),
            itemQuotationPagination: createPagination(result.supQuotationDetailPage),
          },
        });
        return dealDataState(result.supQuotationDetailPage.content || []) || [];
      } else {
        return null;
      }
    },
    // 确认及汇总 - 导出
    *exportData({ payload }, { call }) {
      const result = getResponse(yield call(exportData, payload));
      return result;
    },

    // 立项转招投标
    *fetchListData({ payload }, { call, put }) {
      let result = yield call(fetchListData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteApprovalList: result.content,
            quoteApprovalPagination: createPagination(result),
          },
        });
      }
    },
    // 立项转招投标创建
    *sourcingItemCreate({ payload }, { call }) {
      const result = getResponse(yield call(sourcingItemCreate, payload));
      return result;
    },

    // 寻源事项查询
    *fetchMatterRequireFlag({ payload }, { call }) {
      const result = getResponse(yield call(fetchMatterRequireFlag, payload));
      return result;
    },

    // Bid明细 进度条查询
    *fetchBidDetailProcessAll({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchBidDetailProcessAll, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            bidDetailProcessList: res,
          },
        });
      }
      return res || [];
    },

    // 行信息-不分标段查询
    *fetchLineNoneDetail({ payload }, { call, put }) {
      let result = yield call(fetchLineNoneDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            LineNoneList: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },

    // 简单头信息查询
    *fetchHeaderInfo({ payload }, { call, put }) {
      let result = yield call(fetchHeaderInfo, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: result,
          },
        });
      }
      return result;
    },
    // bid明细 资格预审 预审头查询
    *prequalDetailHeaderBidDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(prequalDetailHeaderBidDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            bidDetailPrequalHeader: res,
          },
        });
      }
      return res;
    },

    // bid明细 资格预审 预审详情
    *prequalDetailBidDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(prequalDetailBidDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            prequalDetailList: res.content,
            prequalDetailPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // bid明细 投标
    *quotationDetailBidDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(quotationDetailBidDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            bidDetailQuotationList: res.content,
            bidDetailQuotationPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // bid明细 资格预审 开标详情
    *openBidDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(openBidDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            bidDetailOpenBidList: res,
          },
        });
      }
      return res;
    },

    // 行信息--区分标段查询
    *fetchLinePackDetail({ payload }, { call, put }) {
      let result = yield call(fetchLinePackDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            LinePackList: result,
          },
        });
      }
      return result;
    },

    // 查询审批历史记录
    *fetchHistoryApproval({ params }, { call }) {
      const res = yield call(fetchHistoryApproval, params) || [];
      return getResponse(res || []);
    },

    // 转交定标
    *transferCalibration({ payload }, { call }) {
      const res = yield call(transferCalibration, payload) || [];
      return getResponse(res || []);
    },
    // 查询物料补充弹窗数据
    *fetchQueryCenterPopData({ payload }, { call, put }) {
      const response = yield call(queryCenterPopData, payload);
      const { sectionFlag } = payload;
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            centerPopData:
              sectionFlag === 1
                ? data.map((item) => ({
                    ...item,
                    children: dealDataState(item.children),
                  }))
                : dealDataState(data),
          },
        });
        return data;
      }
    },
    // 保存物料补充弹窗数据
    *fetchSaveCenterPopData({ payload }, { call }) {
      return getResponse(yield call(saveCenterPopData, payload));
    },
    // 查询招标过程附件
    *bidProcessAttachments({ payload }, { call, put }) {
      const result = getResponse(yield call(bidProcessAttachments, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidProcessAttachments: result.content,
            bidProcessPagination: createPagination(result),
          },
        });
      }
    },
    // 评标阶段 评分明细
    *bidEvaluationDetails({ payload }, { call, put }) {
      const result = getResponse(yield call(bidEvaluationDetails, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetails: result,
          },
        });
      }
      return result;
    },
    // 确认中标候选人
    *fetchConfirmCandidates({ payload }, { call, put }) {
      let result = yield call(fetchEvaluateSummary, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidSectionList: addDataStateForBidSectionList(result),
          },
        });
      }
      return result;
    },
    // 确认候选人 - 总分
    *fetchSumScore({ payload }, { call, put }) {
      let result = yield call(fetchSumScore, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sumScoreData: result,
          },
        });
      }
      return result;
    },
    *fetchQueryRfxTemplateDetail({ payload }, { call }) {
      return getResponse(yield call(queryRfxTemplateDetail, payload));
    },
    // 定标管理不区分标段提交前校验
    *validateBeforeSubmit({ payload }, { call }) {
      const result = getResponse(yield call(validateBeforeSubmit, payload));
      return result;
    },
    // 定标管理区分标段提交前校验
    *validateDiffBeforeSubmit({ payload }, { call }) {
      const result = getResponse(yield call(validateDiffBeforeSubmit, payload));
      return result;
    },
    // 符合性检查_保存 - 初步评审
    *saveReviewEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(saveReviewEvaluateSummary, payload));
      return result;
    },
    // 符合性检查_提交 - 初步评审
    *submitReviewEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(submitReviewEvaluateSummary, payload));
      return result;
    },
    // 查询个性化单元配置
    *fetchQueryUnitCustConfig({ payload }, { call }) {
      const result = getResponse(yield call(queryUnitCustConfig, payload));
      return result;
    },
    // 查询价格服务历史最低价/历史最新价
    *fetchQueryPriceInfo({ payload }, { call, put, select }) {
      const { fieldName, parentId, queryType } = payload;
      const result = getResponse(yield call(queryPriceInfo, payload));
      if (result) {
        const bidHall = yield select((state) => state.bidHall);
        if (queryType === 'supplier') {
          const supplierList = bidHall.aloneSupplierItemLine[parentId].list;
          yield put({
            type: 'updateSupplierItemList',
            payload: {
              supplierCompanyId: parentId,
              list: updateDataState(result, supplierList, fieldName),
            },
          });
        } else {
          const itemList = bidHall.aloneItemLine[parentId].list;
          yield put({
            type: 'updateItemList',
            payload: {
              bidLineItemId: parentId,
              list: updateDataState(result, itemList, fieldName),
            },
          });
        }
      }
    },
    *priceList({ payload }, { call }) {
      const result = getResponse(yield call(priceList, payload));
      return result;
    },
    // 评分要素细项-行-查询
    *fetchElementsDetailLine({ payload }, { call, put }) {
      const { templateEleDetailFlag, ...otherPayload } = payload;
      const response = yield call(fetchElementsDetailLine, otherPayload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            elementsDetailLineList: templateEleDetailFlag
              ? dealDataState(data.content)
              : data.content,
            elementsDetailLinePagination: createPagination(data),
          },
        });
      }
    },
    // 评分要素细项-行-保存
    *saveElementsDetail({ payload }, { call }) {
      const response = yield call(saveElementsDetail, payload);
      return getResponse(response);
    },

    // 评分要素细项-行-删除
    *deleteElementsDetail({ payload }, { call }) {
      const response = yield call(deleteElementsDetail, payload);
      return getResponse(response);
    },

    // 定标管理 - 查看供应商ip重合率
    *fetchBidIPCoincidenceRate({ payload }, { call, put }) {
      let result = yield call(fetchBidIPCoincidenceRate, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ipCoincidenceRate: result,
          },
        });
      }
    },
    // 整包中标
    *wholePackage({ payload }, { call }) {
      const result = getResponse(yield call(wholePackage, payload));
      return result;
    },
    // 是否允许新增物料供应商
    *allowAddItemSupplier({ payload }, { call }) {
      const result = getResponse(yield call(allowAddItemSupplier, payload));
      return result;
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateItemList(state, { payload }) {
      const { aloneItemLine } = state;
      const { bidLineItemId, list, pagination } = payload;
      const page = pagination || aloneItemLine[bidLineItemId].pagination;
      return {
        ...state,
        aloneItemLine: {
          ...aloneItemLine,
          [`${bidLineItemId}`]: {
            list,
            pagination: page,
          },
        },
      };
    },
    updateSupplierItemList(state, { payload }) {
      const { aloneSupplierItemLine } = state;
      const { supplierCompanyId, list, pagination } = payload;
      const page = pagination || aloneSupplierItemLine[supplierCompanyId].pagination;
      return {
        ...state,
        aloneSupplierItemLine: {
          ...aloneSupplierItemLine,
          [`${supplierCompanyId}`]: {
            list,
            pagination: page,
          },
        },
      };
    },
    updateCalibItemList(state, { payload }) {
      const { calibQuotationList } = state;
      const { quotationHeaderId, list, pagination, sectionId } = payload;
      return {
        ...state,
        calibQuotationList: {
          ...calibQuotationList,
          [`${quotationHeaderId}${sectionId}`]: {
            list,
            pagination,
          },
        },
      };
    },
  },
});

export default getModel;
