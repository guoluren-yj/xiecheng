/**
 * model 寻源服务/寻源大厅
 * @date: 2018-12-25
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { isEmpty, isArray } from 'lodash';
import {
  cancelInquiryHallUpdate,
  changeCompany,
  changeRfxDetailLayout,
  checkApplyToInquiry,
  closeRfx,
  createApplyToInquiry,
  createNewRoundQuotation,
  createRfx,
  deleteElementsDetail,
  deleteItemLines,
  deleteLadderLevelLines,
  deleteScoringElement,
  deleteSupplierLines,
  exportCheckPriceData,
  exportPdf,
  fetchAddSupplierLine,
  fetchAllLine,
  fetchAllRoundQuotationData,
  fetchAloneItemLine,
  fetchAloneSupplierItemLine,
  fetchApplyToInquiry,
  fetchBarginLadderLevelyTable,
  fetchBidholderDelete,
  fetchBidholderList,
  fetchBidholderUpdate,
  fetchBulkSupplierData,
  fetchChangetemplateHeaderData,
  fetchCreatedUnitName,
  fetchDataList,
  fetchElementsDetailLine,
  fetchEvalProgress,
  fetchEvaluateSummary,
  fetchHeaderInfo,
  fetchInquiryHeaderDetail,
  fetchRFHeader,
  fetchIPCoincidenceRate,
  fetchItemLine,
  fetchItemLineQuotationDetail,
  fetchItemQuoteLine,
  fetchItemSupplierLineQuotationDetail,
  fetchPretrialPanel,
  savePretrialPanel,
  deletePretrialPanel,
  fetchLadderLevelTable,
  fetchLadderLevelyTable,
  fetchLineData,
  fetchMonitorHeaderDetail,
  fetchOpenBargain,
  fetchOperation,
  fetchPriceChartsData,
  fetchQuotationDetail,
  fetchQuoteLine,
  fetchRecord,
  fetchRfxDetailLayout,
  fetchRfxDetailProcessAll,
  fetchScoreDetail,
  fetchScoringElementData,
  fetchSupplier,
  fetchSupplierLine,
  fetchSupplierLineBarginPrice,
  fetchSupplierLineCheckPrice,
  fetchSupplierQuoteLine,
  getStage,
  handleAdjustTime,
  handleSaveCounterOffersBulk,
  inquiryAgain,
  linkRiskScan,
  openingBid,
  prequalDetailHeaderInInquiryDetail,
  prequalDetailInInquiryDetail,
  pricingSave,
  pricingChangePageSave,
  queryCenterPop,
  querySupplierExchangeEdit,
  quotationControll,
  quotationDetailInInquiryDetail,
  quotationFeedBack,
  releaseInquiryHall,
  resendPassword,
  saveBarginLadderLevel,
  saveCheckPrice,
  saveElementsDetail,
  saveExchangeEdit,
  saveInquiryHallFullQuation,
  saveInquiryHallUpdate,
  saveItemLine,
  saveLadderLevel,
  savePretrial,
  saveRfxCandidate,
  saveScoringElement,
  saveSupplier,
  saveSupplierLine,
  saveSupplierRecordLine,
  selectTransferOk,
  sendExpertScore,
  sourcingCreate,
  startCheckPrice,
  startNextRfxStatus,
  startPretrial,
  submitCheckPrice,
  submitInquiryHallFullQuation,
  supplierRelationMap,
  submitRfxCandidate,
  sureRoundQuotationEnd,
  saveSuggestedRemark,
  submitPretrial,
  submitReturnToPretrial,
  supplierAttachment,
  fetchInquiryGroup,
  saveInquiryGroup,
  deleteInquiryGroup,
  backToCheckPrice,
  fetchMatterRequireFlag,
  fetchTenderNotice,
  previewTenderNotice,
  publishWInnerBidNotice,
  saveWInnerBidNotice,
  fetchWInnerBidNotice,
  previewWInnerBidNotice,
  copyHistoryOrderModal,
  batchEditQuotationLine,
  validateBeforeSubmit,
  allowAddItems,
  batchChangeChooseReson,
  batchChangeChooseStrategy,
  batchMaintainItemLine,
  batchMaintainItemQuotationLine,
  fetchMonitorSupplierLine,
  startRFA,
  turnPageSave,
  queryUnitCustConfig,
  // queryChangePercent,
  saveReviewEvaluateSummary,
  submitReviewEvaluateSummary,
  processAttachments,
  fetchDetailAttachments,
  queryPrint, // 打印
  priceList,
  fetchAllRoundQuotationList,
  fetchSupplierRoundQuotationList,
  fetchItemLineRoundQuotationList,
  eliminateRfx,
  checkPriceSectionSubmit,
  checkPriceSectionSubmitValidate,
  batchCreateNewRoundQuotation,
  batchSureRoundQuotationEnd,
  insertScoringOperationRecord,
  saveBarginLadderLevelOffline,
  fetchCheckPriceExpertScore,
  createPurchaseRequest,
  queryCheckPriceInfo,
} from '@/services/inquiryHallService';

import {
  fetchScoreDetailLevelTwoOfQuotationController,
  updateScoreDetailLevelTwoOfQuotationController,
  deleteScoreDetailLevelTwoOfQuotationController,
  getClearLogic,
} from '@/services/inquiryHallNewService';

import {
  deleteNotice,
  deleteQuestionRows,
  exportData,
  fetchBidEvalProgress,
  fetchBidEvaluateExpertScoring,
  fetchBidIssueHeader,
  fetchClarifyDetail,
  fetchClarifyIssueHeader,
  fetchClarifyNotifyDataList,
  fetchClarifyReferIssue,
  fetchClarifyRelease,
  fetchClarifySave,
  fetchClarifyScrapped,
  fetchClarList,
  fetchEvaluateIndicAssign,
  fetchExpertAllocationData,
  fetchExpertList,
  fetchMaintainList,
  fetchQuestionRows,
  fetchSectionList,
  fetchSupplierList,
  fetchTempelateDetailData,
  getSupplierList,
  queryIssueHeader,
  queryIssueLine,
  querySetting,
  reScoringAll,
  saveEvaluateSummary,
  saveQuestion,
  saveQuestRowLine,
  submitEvaluateSummary,
  submitEvaluateSummaryStartQuotationScore,
  submitQuestion,
  submitEvalSumRoundQuotationOrScoringSection,
} from '@/services/bidHallService';
import {
  beginRoundQuotation,
  sectionBeginRoundQuotation,
  fetchExpertScoreItemLines,
  queryClarifyNotifyDetailHeader,
  queryClarifyNotifyDetailList,
  roundBeginScore,
  fetchExpertScoreDetails,
} from '@/services/expertScoringService';

import { fetchListData } from '@/services/projectSetupService';
import { getResponseParse } from '@/utils/utils';
import { queryFileListOrg, queryMapIdpValue, queryUUID, removeFileOrg } from 'services/api';

function dealDataState(data = []) {
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

function orDealDataState(data = [], allowChangeItemsFlag, sourceFrom) {
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    if (allowChangeItemsFlag === 0 && sourceFrom === 'PROJECT') {
      config = data.map((item) => {
        return {
          ...item,
        };
      });
    } else {
      config = data.map((item) => {
        return {
          ...item,
          _status: 'update',
        };
      });
    }
  }
  return config;
}

// 数据 关联行id
function relatedLineId(data = [], lineId = null) {
  let config = [];
  if (data) {
    config = data.map((item) => {
      return {
        ...item,
        rfxLineItemId: lineId,
      };
    });
  }
  return config;
}

// 数据 关联行id
function relatedSupplierLineId(data, lineId) {
  let config = [];
  if (data) {
    config = data.map((item) => {
      return {
        ...item,
        rfxLineSupplierId: lineId,
      };
    });
  }
  return config;
}

// 分页 关联行id
function relatedLineIdPagination(data, lineId) {
  const newData = {};
  newData[lineId] = data;
  return newData;
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

export default {
  namespace: 'newBidHall',
  state: {
    cacheMap: {}, // 缓存
    list: [], // 询价大厅数据列表
    controllerList: [], // 旬报价控制数据列表
    controllerPagination: {}, // 询报价控制分页
    code: {}, // 值集
    pagination: {}, // 分页器
    quotationFeedBackList: [], // 报价响应列表
    header: {}, // 询价大厅维护页面头
    changeTempHeader: {}, // 改变寻源模板获取询价头信息
    examinationHeader: {}, // 资格审查 详情页面
    itemLine: [], // 物品明细数据
    examinationItemLine: [], // 资格审查 物品行明细数据
    examinationItemLinePagination: [], // 资格审查 物品行明细分页
    pretrialPanelList: [], // 预审小组数据
    supplierLine: [], // 供应商列表数据
    examinationSupplierLine: [], // 资格审查 供应商列表
    examinationSupplierLinePagination: {}, // 资格审查 供应商列表分页
    itemLinePagination: {}, // 物品明细分页
    itemLineQuotationDetail: [], // 物品明细报价详情
    supplierLineQuotationDetail: [], // 供应商查询报价明细
    supplierLinePagination: {}, // 供应商列表数据分页
    itemQuoteLine: [], // 核价物品报价明细
    itemQuoteLinePagination: {}, // 核价物品报价明细分页
    supplierQuoteLine: [], // 核价供应商报价
    supplierQuoteLinePagination: {}, // 核价供应商报价分页
    quoteLine: [], // 核价全部报价明细
    quoteLinePagination: {}, // 核价全部报价明细分页
    operationData: [], // 操作记录数据
    priceChartsData: [], // 缩略图数据
    ladderLevelData: [], // 阶梯报价数据
    barginLadderLevelData: [], // 阶梯还价数据
    quotaLadderLevelData: [], // 核价/初审阶梯等级数据
    ipCoincidenceRate: [], // 核价-ip重合率数据
    operationPagination: {}, // 操作记录分页
    bidHolderList: [], // 开标人数据
    bidHolderPagination: {}, // 开标人分页
    allLine: [], // 所有报价明细
    allLinePagination: {}, // 全部报价明细分页
    aloneItemLine: {}, // 还比价：根据物料头id获取物料明细列表
    aloneSupplierItemLine: {}, // 还比价：根据供应商id获取供应商列表
    itemLineChange: false, // 物料行是否发生改变
    LadderLevelChange: false, // 阶梯报价是否发生变化
    supplierLineChange: false, // 供应商行是否发生改变
    allLineChange: false, // 全部明细是否发生改变
    itemContentChange: {}, // 物料行table是否发生改变
    supplierContentChange: {}, // 供应商行table是否发生改变
    bulkSupplierList: [], // 批量添加供应商列表数据
    scoringNoneTempelate: [], // 模板明细不区分数据
    scoringBusinessTempelate: [], // 模板明细商务组数据
    scoringTechnologyTempelate: [], // 模板明细技术组数据
    elementsDetailLineList: [], // 评分要素细项列表
    elementsDetailLinePagination: {}, // 评分要素细项分页
    currentScoringExperts: [], // 当前评分要素专家数据
    bulkSupplierListPagination: {}, // 批量添加供应商列表数据分页
    stageData: [], // 工作流节点
    examinationStageData: [], // 审查工作流节点
    addSupplierLine: [],
    recordList: [], // 询价监控台报价历史记录
    recordListPagination: {}, // 询价监控台报价历史记录分页
    lineData: [], // 询价监控台监控台折线图数据
    applyToInquiryLine: [], // 申请转询价行数据
    applyToInquiryPagination: {}, // 申请转询价分页
    applyToInquirySearchData: {}, // 申请转询价搜索数据
    scoringElement: [], // 评分要素数据
    evalProgress: [], // 评标管理步骤
    bidSectionList: {}, // 确认候选人 - 标段列表
    scoreDetailList: {}, // 确认候选人 - 评分明细列表
    historys: '', // 路由历史
    bidEvalProgress: [], // 评分管理-询价评分进度条信息
    sectionInfo: {}, // 评分管理--标段信息
    supplierList: {}, // 评分管理--供应商维度信息
    expertList: [], // 评分管理--专家信息
    expertPagination: {}, // 评分管理--专家信息分页
    bidEvaluateExpertScoringList: [], // 评分管理专家评分
    supplierDimensionList: [], // 评分过程管理供应商维度数据
    ClarifyNotifyDataList: [], // 澄清单列表数据
    questionInformationHeader: {}, // 创建评标问题头信息
    questionRowsList: [], // 创建澄清问题列表
    questionRowsPagination: {}, // 创建澄清列表分页
    clarifyNotifyDataList: [], // 澄清单列表数据
    clarifyNotifyDataListPagination: {}, // 澄清单列表分页
    clarifyNotifyDetailList: [], // 澄清详情列表数据
    clarifyNotifyDetailListPagination: {}, // 澄清详情列表分页数据
    clarifyNotifyDetailHeader: {}, // 澄清单详情头信息
    centerPopData: [], // 核价中心弹窗数据
    centerPopDataPagination: {}, // 核价中心弹框分页
    verifyResult: [], // 核价提交返回数据
    fetchMaintainList: [], // 投标澄清维护列表
    fetchClarList: [], // 投标澄清所有问题列表
    fetchClarListPagination: {}, // 投标澄清所有问题列表分页
    clarificationDetails: {}, // 澄清函详情
    clarificationContext: undefined,
    clarificationQuestionList: [], // 澄清函引用问题列表
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    issueHeader: {}, // 问题查看头数据
    issueLineList: [], // 问题查看行数据
    issueLinePagination: {}, // 问题查看行数据分页
    settings: {}, // 配置中心配置项
    quotationDetailList: {}, // 评分过程管理全部报价明细
    cHallHeader: {}, // 询价大厅创建页面头
    rfxScoreItemLineList: [], // 询价单评分列表
    rfxScoreItemPagination: {}, // 询价单评分列表分页
    headerInfo: {}, // 简单头查询信息
    itemQuotationDetail: [], // 询价物料报价明细重构
    itemQuotationPagination: {}, // 询价物料报价明细重构分页
    quoteApprovalList: [], // 立项转招寻源列表数据
    quoteApprovalPagination: {}, // 立项转招寻源分页
    exchangeEditSupplierList: [], // 核价/汇率编辑/供应商查询list
    quotationFeedBackLackList: [], // 报价响应不足数据
    rfxDetailProcessList: [], // rfx明细 进度条查询
    rfxDetailPrequalHeader: {}, // rfx明细 资格预审头信息
    prequalDetailList: [], // rfx明细 资格预审详情数据
    prequalDetailPagination: {}, // rfx明细 资格预审详情数据分页
    rfxDetailQuotationList: [], // rfx明细 报价详情数据
    rfxDetailQuotationPagination: {}, // rfx明细 报价详情分页
    rfxDetailOpenBidList: [], // rfx明细 开标明细数据
    rfxDetailLayouts: {}, // rfx明细横竖版布局
    rfxDetailLayoutsSingle: {}, // rfx明细核价方式-单据
    inquiryGroupList: [], // 寻源小组信息
    tenderNoticeInfo: {}, // 招标公告
    tenderNoticePreview: {}, // 招标公告预览
    winBidNoticeInfo: {}, // 中标公告详情
    previewWinNoticeInfo: {}, // 中标公告预览数据
    monitorSupplierLine: [], // 询价监控台供应商列表
    monitorSupplierLinePagination: {}, // 询价监控台供应商列表分页
    eliItemDetail: [],
    eliItemDetailPagination: {},
    eliSupplierDetail: [],
    eliSupplierDetailPagination: {},
    eliItemLine: [], // 淘汰物料行
    eliItemLinePagination: {},
    eliSupplierLine: [], // 淘汰供应商行
    eliSupplierLinePagination: {},
    eliQuoteLine: [], // 淘汰全部报价行
    eliQuoteLinePagination: {},

    newInquiryHallUI: '', // 新-寻源大厅UI
    newInquiryHallTab: '', // 新-寻源大厅当前TAB
    processAttachments: [], // 寻源过程附件
    processPagination: {}, // 寻源过程附件分页
    detailAttachments: [],
    detailPagination: {},
    quotationAllList: [], // 多轮报价全部Tab报价明细
    quotationAllListPagination: {},
    quotationSupplierList: [], // 多轮报价供应商Tab列表信息
    quotationSupplierListPagination: {},
    quotationSupplierDetailPagination: {}, // 供应商的物料行信息分页
    quotationItemList: [], // 多轮报价物料Tab物料信息
    quotationItemListPagination: {},
    quotationItemDetailPagination: {}, // 物料下的供应商报价行信息分页
    sectionRoundQuotaion: {},
    sectionSubmit: {},
  },
  effects: {
    // 物料行批量维护
    *batchMaintainItemLine({ payload }, { call }) {
      const result = yield call(batchMaintainItemLine, payload);
      return getResponse(result);
    },
    // 物料报价行批量维护
    *batchMaintainItemQuotationLine({ payload }, { call }) {
      const result = yield call(batchMaintainItemQuotationLine, payload);
      return getResponse(result);
    },
    // 招标公告预览－查询
    *previewTenderNotice({ payload }, { call, put }) {
      let result = yield call(previewTenderNotice, payload);
      result = getResponse(result) || {};
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            tenderNoticePreview: result,
          },
        });
      }
      return result;
    },
    // 招标公告－查询
    *fetchTenderNotice({ payload }, { call, put }) {
      let result = yield call(fetchTenderNotice, payload);
      result = getResponse(result) || {};
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            tenderNoticeInfo: result,
          },
        });
      }
      return result;
    },
    // 中标公告预览
    *previewWInnerBidNotice({ payload }, { call, put }) {
      let result = yield call(previewWInnerBidNotice, payload);
      result = getResponse(result) || {};
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            previewWinNoticeInfo: result,
          },
        });
      }
      return result;
    },
    // 中标公告详情-查询
    *fetchWInnerBidNotice({ payload }, { call, put }) {
      let result = yield call(fetchWInnerBidNotice, payload);
      result = getResponse(result) || {};
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            winBidNoticeInfo: result,
          },
        });
      }
      return result;
    },
    // 中标公告保存
    *saveWInnerBidNotice({ payload }, { call }) {
      const result = yield call(saveWInnerBidNotice, payload);
      return getResponse(result);
    },
    // 中标公告发布
    *publishWInnerBidNotice({ payload }, { call }) {
      const result = yield call(publishWInnerBidNotice, payload);
      return getResponse(result);
    },
    // 获取寻源小组信息
    *fetchInquiryGroup({ payload }, { call, put }) {
      let result = yield call(fetchInquiryGroup, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            inquiryGroupList: payload.readOnly ? result : dealDataState(result),
          },
        });
      }
      return result;
    },
    // 保存寻源小组
    *saveInquiryGroup({ payload }, { call }) {
      let result = yield call(saveInquiryGroup, payload);
      result = getResponse(result);
      return result;
    },

    // 删除寻源小组
    *deleteInquiryGroup({ payload }, { call }) {
      let result = yield call(deleteInquiryGroup, payload);
      result = getResponse(result);
      return result;
    },
    // 完成状态寻源单回退至核价状态
    *backToCheckPrice({ payload }, { call }) {
      return getResponse(yield call(backToCheckPrice, payload));
    },
    // 专家评分详情
    *fetchExpertScoreDetails({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchExpertScoreDetails, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            expertScoreDetails: res,
          },
        });
      }
      return res;
    },
    // 选用理由保存
    *saveSuggestedRemark({ payload }, { call }) {
      const result = getResponse(yield call(saveSuggestedRemark, payload));
      return result;
    },
    // rfx明细 资格预审 预审头查询
    *prequalDetailHeaderInInquiryDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(prequalDetailHeaderInInquiryDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailPrequalHeader: res,
          },
        });
      }
      return res;
    },
    // rfx明细 进度条查询
    *fetchRfxDetailProcessAll({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailProcessAll, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailProcessList: res,
          },
        });
      }
      return res || [];
    },
    // rfx明细 资格预审 开标详情
    *openBidDetailInInquiryDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchInquiryGroup, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailOpenBidList: res,
          },
        });
      }
      return res;
    },
    // rfx明细 报价中 报价详情
    *quotationDetailInInquiryDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(quotationDetailInInquiryDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailQuotationList: res.content,
            rfxDetailQuotationPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // rfx明细 资格预审 预审详情
    *prequalDetailInInquiryDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(prequalDetailInInquiryDetail, payload));
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
    // rfx明细 横竖版布局查询
    *fetchRfxDetailLayout({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailLayouts: res,
          },
        });
      }
      return res;
    },
    // rfx明细 横竖版布局查询-单据
    *fetchRfxDetailLayoutSingle({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailLayoutsSingle: res,
          },
        });
      }
      return res;
    },
    // 核价批量发起多轮报价的用户记忆
    *fetchSectionRoundQuotation({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            sectionRoundQuotaion: res,
          },
        });
      }
      return res;
    },
    // 核价批量提交的用户记忆
    *fetchSectionBatchSubmit({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            sectionSubmit: res,
          },
        });
      }
      return res;
    },
    // rfx明细 横竖版布局改变
    *changeRfxDetailLayout({ payload }, { call, put }) {
      const res = getResponse(yield call(changeRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailLayouts: res,
          },
        });
      }
      return res;
    },
    // rfx明细 横竖版布局改变
    *changeRfxDetailLayoutSingle({ payload }, { call, put }) {
      const res = getResponse(yield call(changeRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            rfxDetailLayoutsSingle: res,
          },
        });
      }
      return res;
    },
    // 新寻源大厅 布局UI
    *fetchNewInquiryHallUI({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            newInquiryHallUI: res,
          },
        });
      }
      return res;
    },
    // rfx明细 横竖版布局改变
    *changeNewInquiryHallUI({ payload }, { call, put }) {
      const res = getResponse(yield call(changeRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            newInquiryHallUI: res,
          },
        });
      }
      return res;
    },
    // 新寻源大厅 当前选择的TAb
    *fetchNewInquiryHallTab({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            newInquiryHallTab: res,
          },
        });
      }
      return res;
    },
    // rfx明细 横竖版布局改变
    *changeNewInquiryHallTab({ payload }, { call, put }) {
      const res = getResponse(yield call(changeRfxDetailLayout, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            newInquiryHallTab: res,
          },
        });
      }
      return res;
    },
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
      return settings;
    },
    // 核价中心弹窗查询
    *fetchCenterPopData({ payload }, { call, put }) {
      const response = yield call(queryCenterPop, payload);
      const data = getResponse(response);
      let centerPopData;
      if (isArray(data) && data.length > 0) {
        centerPopData = dealDataState(data);
      } else {
        centerPopData = dealDataState(data.content);
      }
      const centerPopDataPagination = createPagination(data);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            centerPopData,
            centerPopDataPagination,
          },
        });
      }
      return centerPopData;
    },

    // 核价中心弹窗保存
    *prcingSaveSheet({ payload }, { call }) {
      return getResponse(yield call(pricingSave, payload));
    },

    // 核价中心弹窗分页保存
    *pricingChangePageSave({ payload }, { call }) {
      return getResponse(yield call(pricingChangePageSave, payload));
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
            header: result,
          },
        });
      }
    },

    // 议价界面
    *fetchOpenBargain({ payload }, { call }) {
      const result = getResponse(yield call(fetchOpenBargain, payload));
      return result;
    },

    // 评审澄清头行总体提交
    *submitQuestion({ payload }, { call }) {
      const result = getResponse(yield call(submitQuestion, payload));
      return result;
    },
    // 澄清评审保存后问题头查询
    *fetchClarifyIssueHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchClarifyIssueHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
    },
    // 评审澄清头行总体保存
    *saveQuestion({ payload }, { call }) {
      const result = getResponse(yield call(saveQuestion, payload));
      return result;
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
    // 评审澄清通知删除
    *deleteNotice({ payload }, { call }) {
      const result = getResponse(yield call(deleteNotice, payload));
      return result;
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
    // 问题头查询
    *fetchBidIssueHeader({ payload }, { call, put }) {
      const questionInformationHeader = getResponse(yield call(fetchBidIssueHeader, payload));
      yield put({
        type: 'updateState',
        payload: { questionInformationHeader },
      });
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
    // 开启多轮报价
    *beginRoundQuotation({ payload }, { call }) {
      const result = yield call(beginRoundQuotation, payload);
      return getResponse(result);
    },

    // 批量开启多轮报价
    *sectionBeginRoundQuotation({ payload }, { call }) {
      const result = yield call(sectionBeginRoundQuotation, payload);
      return getResponse(result);
    },

    // 开始评分
    *roundBeginScore({ payload }, { call }) {
      const result = getResponse(yield call(roundBeginScore, payload));
      return getResponse(result);
    },
    // 专家评分－供应商物品相关信息
    *fetchRfxScoreItemLines({ payload }, { call, put }) {
      let result = yield call(fetchExpertScoreItemLines, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            rfxScoreItemLineList: dealDataState(result.content),
            rfxScoreItemPagination: createPagination(result),
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
    // 获取列表
    *fetchDataList({ payload }, { call, put }) {
      let result = yield call(fetchDataList, payload);
      result = getResponse(result);
      if (result) {
        const { path = null } = payload;
        let objParams;
        if (path.includes('quotation-controller')) {
          objParams = {
            controllerList: result.content,
            controllerPagination: createPagination(result),
          };
        } else {
          objParams = {
            list: result.content,
            pagination: createPagination(result),
          };
        }
        yield put({
          type: 'updateState',
          payload: objParams,
        });
      }
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
    // 报价响应
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
    // 报价响应不足
    *quotationFeedBackLack({ payload }, { call, put }) {
      const result = getResponse(yield call(quotationFeedBack, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationFeedBackLackList: result,
          },
        });
      }
      return result;
    },
    // 操作-下发专家评分
    *sendExpertScore({ payload }, { call }) {
      const result = getResponse(yield call(sendExpertScore, payload));
      return result;
    },
    // 操作-关闭询价单
    *closeRfx({ payload }, { call }) {
      const result = getResponse(yield call(closeRfx, payload));
      return result;
    },
    // 操作-开始初审
    *startPretrial({ payload }, { call }) {
      const result = getResponse(yield call(startPretrial, payload));
      return result;
    },
    // 操作-开始核价
    *startCheckPrice({ payload }, { call }) {
      const result = getResponse(yield call(startCheckPrice, payload));
      return result;
    },
    // 操作-进入下一个状态
    *startNextRfxStatus({ payload }, { call }) {
      const result = getResponse(yield call(startNextRfxStatus, payload));
      return result;
    },
    // 获取询价大厅维护头
    *fetchInquiryHeaderDetail({ payload }, { call, put }) {
      const { routerParam } = payload;
      const result = getResponse(yield call(fetchInquiryHeaderDetail, payload));
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationHeader: result,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                header: result,
                headerInfo: result,
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              header: result,
              headerInfo: result, // 由于model是持久层, 主要为了解决 [专家评分_评分管理], 简单头和复杂头数据混乱, 所以保持数据同步
            },
          });
        }
      }
      return result;
    },
    // 获取RF维护头
    *fetchRFHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchRFHeader, payload));
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
    // 改变询价大厅寻源模板获取询价大厅维护头
    *fetchChangetemplateHeaderData({ payload }, { call, put }) {
      const { routerParam } = payload;
      const result = getResponse(yield call(fetchChangetemplateHeaderData, payload));
      if (result) {
        if (routerParam) {
          yield put({
            type: 'updateState',
            payload: {
              changeTempHeader: result,
            },
          });
        }
      }
      return result;
    },
    // 改变询价大厅公司清空对应物品供应商数据
    *changeCompany({ payload }, { call }) {
      const result = getResponse(yield call(changeCompany, payload));
      return result;
    },
    // 获取询价监控台头
    *fetchMonitorHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMonitorHeaderDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
            headerInfo: result,
          },
        });
      }
      return result;
    },
    // 获取物品明细列表
    *fetchInquiryItemLine({ payload }, { call, put }) {
      const { routerParam } = payload;
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationItemLine: dealDataState(result.content),
                examinationItemLinePagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                itemLine: dealDataState(result.content),
                itemLinePagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              itemLine: dealDataState(result.content),
              itemLinePagination: createPagination(result),
            },
          });
        }
      }
      return result;
    },
    // 其它页面-获取物品明细列表
    *fetchItemLine({ payload }, { call, put }) {
      const { routerParam, allowChangeItemsFlag, sourceFrom, ...otherParams } = payload;
      let result = yield call(fetchItemLine, otherParams);
      result = getResponse(result);
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationItemLine: dealDataState(result.content),
                examinationItemLinePagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                itemLine: orDealDataState(result.content, allowChangeItemsFlag, sourceFrom),
                itemLinePagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              itemLine: orDealDataState(result.content, allowChangeItemsFlag, sourceFrom),
              itemLinePagination: createPagination(result),
            },
          });
        }
      }
      return result;
    },
    // 采购方物料报价明细重构
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
        return dealDataState(result);
      } else {
        return null;
      }
    },
    // 获取供应商物品行报价详情
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

    // 获取供应商物品行报价详情
    *fetchItemSupplierLineQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemSupplierLineQuotationDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLineQuotationDetail: dealDataState(result),
          },
        });
      }

      return dealDataState(result);
    },

    // 获取供应商列表
    *fetchInquirySupplierLine({ payload }, { call, put }) {
      const { routerParam } = payload;
      let result = yield call(fetchSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationSupplierLine: dealDataState(result.content),
                examinationSupplierLinePagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                supplierLine: dealDataState(result.content),
                supplierLinePagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              supplierLine: dealDataState(result.content),
              supplierLinePagination: createPagination(result),
            },
          });
        }
      }
      return result;
    },
    // 其它页面-获取供应商列表
    *fetchSupplierLine({ payload }, { call, put }) {
      const { routerParam, allowChangeSupplyFlag, sourceFrom, ...otherParams } = payload;
      let result = yield call(fetchSupplierLine, otherParams);
      result = getResponse(result);
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationSupplierLine: dealDataState(result.content),
                examinationSupplierLinePagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                supplierLine: orDealDataState(result.content, allowChangeSupplyFlag, sourceFrom),
                supplierLinePagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              supplierLine: orDealDataState(result.content, allowChangeSupplyFlag, sourceFrom),
              supplierLinePagination: createPagination(result),
            },
          });
        }
      }
      return result;
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
    // 获取供应商核价列表
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
    // 获取供应商还比价列表
    *fetchSupplierLineBarginPrice({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLineBarginPrice, payload);
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
    // 寻源过程控制-new-评分要素细项-行-查询
    *fetchScoreDetailLevelTwoOfQuotationController({ payload }, { call, put }) {
      const { templateEleDetailFlag, ...otherPayload } = payload;
      const response = yield call(fetchScoreDetailLevelTwoOfQuotationController, otherPayload);
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
    // 寻源过程控制-new-评分要素细项-行-删除
    *deleteScoreDetailLevelTwoOfQuotationController({ payload }, { call }) {
      const response = yield call(deleteScoreDetailLevelTwoOfQuotationController, payload);
      return getResponse(response);
    },
    // 寻源过程控制-new-评分要素细项-行-保存
    *updateScoreDetailLevelTwoOfQuotationController({ payload }, { call }) {
      const response = yield call(updateScoreDetailLevelTwoOfQuotationController, payload);
      return getResponse(response);
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
    // 核价 - 退回至初审
    *submitReturnToPretrial({ payload }, { call }) {
      const result = getResponse(yield call(submitReturnToPretrial, payload));
      return result;
    },
    // 获取核价物品报价明细
    *fetchItemQuoteLine({ payload }, { call, put }) {
      let result = yield call(fetchItemQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateItemQuoteLineData',
          payload: {
            itemQuoteLine: relatedLineId(dealDataState(result.content), payload.rfxLineItemId),
            itemQuoteLinePagination: relatedLineIdPagination(
              createPagination(result),
              payload.rfxLineItemId
            ),
          },
        });
      }
      return result;
    },
    // 获取核价供应商报价明细
    *fetchSupplierQuoteLine({ payload }, { call, put }) {
      let result = yield call(fetchSupplierQuoteLine, payload);
      result = getResponse(result);
      const supplierQuoteLine = relatedSupplierLineId(
        dealDataState(result.content),
        payload.rfxLineSupplierId
      );
      if (result) {
        yield put({
          type: 'updateSupplierQuoteLineData',
          payload: {
            supplierQuoteLine,
            supplierQuoteLinePagination: relatedLineIdPagination(
              createPagination(result),
              payload.rfxLineSupplierId
            ),
          },
        });
      }
      return supplierQuoteLine;
    },
    // 获取核价全部报价明细
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
      result = result || {};
      return dealDataState(result.content);
    },
    // 再次询价
    *inquiryAgain({ payload }, { call }) {
      const result = getResponse(yield call(inquiryAgain, payload));
      return result;
    },
    // 核价 - 保存
    *saveCheckPrice({ payload }, { call }) {
      const result = getResponse(yield call(saveCheckPrice, payload));
      return result;
    },
    // 核价 - 提交
    *submitCheckPrice({ payload }, { call }) {
      const result = getResponse(yield call(submitCheckPrice, payload));
      return result;
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
    // 初审 - 保存
    *savePretrial({ payload }, { call }) {
      const result = getResponse(yield call(savePretrial, payload));
      return result;
    },
    // 初审 - 提交
    *submitPretrial({ payload }, { call }) {
      const result = getResponse(yield call(submitPretrial, payload));
      return result;
    },
    // 初审 - 转交
    *selectTransferOk({ payload }, { call }) {
      const result = getResponse(yield call(selectTransferOk, payload));
      return result;
    },
    // 新增物品明细行
    *saveItemLine({ payload }, { call }) {
      const result = getResponse(yield call(saveItemLine, payload));
      return result;
    },
    // 保存阶梯报价行
    *saveLadderLevel({ payload }, { call }) {
      const result = getResponse(yield call(saveLadderLevel, payload));
      return result;
    },
    // 保存还比价阶梯报价行
    *saveBarginLadderLevel({ payload }, { call }) {
      const result = getResponse(yield call(saveBarginLadderLevel, payload));
      return result;
    },
    // 线下议价-阶梯报价-保存
    *saveBarginLadderLevelOffline({ payload }, { call }) {
      const result = getResponse(yield call(saveBarginLadderLevelOffline, payload));
      return result;
    },
    // 阶梯报价-批量删除
    *deleteLadderLevelLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderLevelLines, payload));
      return result;
    },
    // 新增供应商列表行
    *saveSupplierLine({ payload }, { call }) {
      const result = getResponse(yield call(saveSupplierLine, payload));
      return result;
    },
    // 供应商资质查询
    *supplierAttachment({ payload }, { call }) {
      const result = getResponse(yield call(supplierAttachment, payload));
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
    *saveInquiryHallUpdate({ payload }, { call }) {
      const result = getResponse(yield call(saveInquiryHallUpdate, payload));
      return result;
    },
    // 维护页面-取消
    *cancelInquiryHallUpdate({ payload }, { call }) {
      const result = getResponse(yield call(cancelInquiryHallUpdate, payload));
      return result;
    },
    // 维护页面-发布
    *releaseInquiryHall({ payload }, { call }) {
      const result = getResponse(yield call(releaseInquiryHall, payload));
      return result;
    },
    // 操作记录
    *operationRecord({ payload }, { call, put }) {
      let result = yield call(fetchOperation, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationData: result.content,
            operationPagination: createPagination(result),
          },
        });
      }
    },
    // 询价阶梯报价
    *fetchLadderLevelyTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelyTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderLevelData: dealDataState(result.content),
            quotaLadderLevelData: dealDataState(result.content),
          },
        });
      }
    },
    // 阶梯还价
    *fetchBarginLadderLevelyTable({ payload }, { call, put }) {
      let result = yield call(fetchBarginLadderLevelyTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            barginLadderLevelData: dealDataState(result),
          },
        });
      }
    },
    // 核价/初审阶梯等级数据查询
    *fetchLadderLevelTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotaLadderLevelData: dealDataState(result.content),
          },
        });
        return result;
      }
    },
    // 缩略图数据查询
    *fetchPriceChartsData({ payload }, { call, put }) {
      let result = yield call(fetchPriceChartsData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceChartsData: result,
          },
        });
      }
      return result;
    },
    // 获取uuid
    *queryUuid({ payload }, { call }) {
      const result = yield call(queryUUID, payload);
      return getResponse(result);
    },
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 询价单创建
    *createRfx({ payload }, { call }) {
      const result = yield call(createRfx, payload);
      return getResponse(result);
    },
    // 开标人弹框表格
    *fetchBidholderList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBidholderList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidHolderList: dealDataState(result),
            bidHolderPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 开标人弹框新增或更新
    *fetchBidholderUpdate({ payload }, { call }) {
      const result = getResponse(yield call(fetchBidholderUpdate, payload));
      return result;
    },
    // 开标人弹框批量删除
    *fetchBidholderDelete({ payload }, { call }) {
      const result = getResponse(yield call(fetchBidholderDelete, payload));
      return result;
    },
    // 获取所有
    *fetchAllLine({ payload }, { call, put }) {
      let result = yield call(fetchAllLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            allLine: dealDataState(result.content),
            allLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 还比价--单独获取物料行
    *fetchAloneItemLine({ payload }, { call, put }) {
      const { rfxLineItemId } = payload;
      let result = yield call(fetchAloneItemLine, payload);
      result = getResponse(result);
      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateItemList',
          payload: {
            rfxLineItemId,
            pagination,
            list: dealDataState(result.content),
          },
        });
      }
    },
    // 还比价--单独获取供应商行
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
      }
    },
    // 还比价-保存
    *saveInquiryHallFullQuation({ payload }, { call }) {
      const result = getResponse(yield call(saveInquiryHallFullQuation, payload));
      return result;
    },
    // 还比价-提交
    *submitInquiryHallFullQuation({ payload }, { call }) {
      const result = getResponse(yield call(submitInquiryHallFullQuation, payload));
      return result;
    },
    // 一键还价
    *handleSaveCounterOffersBulk({ payload }, { call }) {
      const result = getResponse(yield call(handleSaveCounterOffersBulk, payload));
      return result;
    },
    // 供应商list
    *supplierInquiryRecord({ payload }, { call, put }) {
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
    // 供应商关系图谱
    *supplierRelationMap({ payload }, { call }) {
      const response = yield call(supplierRelationMap, payload);
      return getResponse(response);
    },
    // 开标
    *openingBid({ payload }, { call }) {
      return getResponse(yield call(openingBid, payload));
    },
    // 重发密码
    *resendPassword({ payload }, { call }) {
      return getResponse(yield call(resendPassword, payload));
    },
    // 请求stage
    *getStage({ payload }, { call, put }) {
      const { routerParam = null } = payload;
      let res = yield call(getStage, payload);
      res = getResponse(res);
      if (res) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                examinationStageData: dealDataState(res),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                stageData: dealDataState(res),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              stageData: dealDataState(res),
            },
          });
        }

        return res;
      }
    },
    // 暂停询报价
    *pause({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 关闭询报价
    *close({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 重启询报价
    *resume({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 结束
    *over({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 调整时间
    *handleAdjustTime({ payload }, { call }) {
      const res = yield call(handleAdjustTime, payload);
      return getResponse(res);
    },
    // 添加供应商
    *fetchAddSupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchAddSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            addSupplierLine: dealDataState(result.content),
          },
        });
      }
    },
    // fetchRecord
    *fetchRecord({ payload }, { call, put }) {
      let result = yield call(fetchRecord, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            recordList: dealDataState(result.content),
            recordListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // fetchLineData
    *fetchLineData({ payload }, { call, put }) {
      let result = yield call(fetchLineData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            lineData: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 保存
    *saveSupplier({ payload }, { call }) {
      const result = yield call(saveSupplier, payload);
      return getResponse(result);
    },
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
    *createApplyToInquiry({ payload }, { call }) {
      let result = yield call(createApplyToInquiry, payload);
      result = getResponseParse(result);
      return result;
    },
    *createPurchaseRequest({ payload }, { call }) {
      let result = yield call(createPurchaseRequest, payload);
      result = getResponseParse(result);
      return result;
    },
    // 申请转询价创建前校验API
    *checkApplyToInquiry({ payload }, { call }) {
      const result = getResponse(yield call(checkApplyToInquiry, payload));
      return result;
    },
    // 风险监控
    *linkRiskScan({ payload }, { call }) {
      const res = yield call(linkRiskScan, payload);
      return getResponse(res);
    },
    // 评标管理-招标评标进度条
    *fetchEvalProgress({ payload }, { call, put }) {
      let result = yield call(fetchEvalProgress, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evalProgress: result,
          },
        });
      }
    },
    // 确认rfx候选人 - 获取标段下供应商详情
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
    // 确认rfx候选人 - 获取标段下供应商的评分明细,
    *fetchScoreDetail({ payload }, { call, put }) {
      let result = yield call(fetchScoreDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetailList: result,
          },
        });
      }
      return result;
    },
    // 确认候选人 - 保存
    *saveRfxCandidate({ payload }, { call }) {
      const response = yield call(saveRfxCandidate, payload);
      return getResponse(response);
    },
    // 确认候选人 - 提交
    *submitRfxCandidate({ payload }, { call }) {
      const response = yield call(submitRfxCandidate, payload);
      return getResponse(response);
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
      return result;
    },
    // 评分管理--标段查询
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
    // 评分管理---供应商查询
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
    // 评分管理--专家查询
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
    // 评分管理--评分汇总保存
    *saveEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(saveEvaluateSummary, payload));
      return result;
    },
    // 评分管理-整单提交-并且发起多轮报价或开始评分
    *submitEvaluateSummaryStartQuotationScore({ payload }, { call }) {
      const result = getResponse(yield call(submitEvaluateSummaryStartQuotationScore, payload));
      return result;
    },
    // 评分管理-整单提交-并且发起多轮报价或开始评分 - 分标段
    *submitEvalSumRoundQuotationOrScoringSection({ payload }, { call }) {
      const result = getResponse(yield call(submitEvalSumRoundQuotationOrScoringSection, payload));
      return result;
    },
    // 评分管理-整单提交
    *submitEvaluateSummary({ payload }, { call }) {
      const result = getResponse(yield call(submitEvaluateSummary, payload));
      return result;
    },
    // 评分管理-专家评分情况
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
    // 评分过程管理供应商维度查询
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
    // 获取多轮报价所有供应商报价数据
    *fetchAllRoundQuotationData({ payload }, { call, put }) {
      let result = yield call(fetchAllRoundQuotationData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailList: result,
          },
        });
      }
      return result;
    },
    // 获取多轮报价全部报价Tab报价数据
    *fetchAllRoundQuotationList({ payload }, { call, put }) {
      let result = yield call(fetchAllRoundQuotationList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationAllList: result.content,
            quotationAllListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取多轮报价供应商Tab报价数据
    *fetchSupplierRoundQuotationList({ payload }, { call, put }) {
      let result = yield call(fetchSupplierRoundQuotationList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationSupplierList: result.content,
            quotationSupplierListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取多轮报价物料Tab报价数据
    *fetchItemLineRoundQuotationList({ payload }, { call, put }) {
      let result = yield call(fetchItemLineRoundQuotationList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationItemList: result.content,
            quotationItemListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取多轮报价物料Tab物料信息
    *fetchItemRoundQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchAllRoundQuotationList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateItemRoundQuotaion',
          payload: {
            itemRoundQuotationDetail: result.content || [],
            itemRoundQuotationDetailtPagination: relatedLineIdPagination(
              createPagination(result),
              payload.rfxLineItemId
            ),
          },
        });
      }
      return result;
    },
    // 获取多轮报价供应商Tab物料信息
    *fetchSupplierRoundQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchAllRoundQuotationList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateSupplierRoundQuotaion',
          payload: {
            supplierRoundQuotationDetail: result.content || [],
            supplierRoundQuotationDetailtPagination: relatedLineIdPagination(
              createPagination(result),
              payload.supplierCompanyId
            ),
          },
        });
      }
      return result;
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
    // 澄清函保存
    *fetchClarifySave({ payload }, { call }) {
      const response = yield call(fetchClarifySave, payload);
      return getResponse(response);
    },
    // 澄清函提交
    *fetchClarifyRelease({ payload }, { call }) {
      const response = yield call(fetchClarifyRelease, payload);
      return getResponse(response);
    },
    // 澄清函删除
    *fetchClarifyScrapped({ payload }, { call }) {
      const response = yield call(fetchClarifyScrapped, payload);
      return getResponse(response);
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
    // 评分过程管理-全部重新评分
    *reScoringAll({ payload }, { call }) {
      const result = yield call(reScoringAll, payload);
      return getResponse(result);
    },
    // 多轮报价 发起新一轮报价
    *createNewRoundQuotation({ payload }, { call }) {
      const result = getResponse(yield call(createNewRoundQuotation, payload));
      return result;
    },
    // 多轮报价，确定终轮报价结束
    *sureRoundQuotationEnd({ payload }, { call }) {
      const res = getResponse(yield call(sureRoundQuotationEnd, payload));
      return res;
    },
    // 多轮报价 发起新一轮报价-批量
    *batchCreateNewRoundQuotation({ payload }, { call }) {
      const result = getResponse(yield call(batchCreateNewRoundQuotation, payload));
      return result;
    },
    // 多轮报价，确定终轮报价结束-批量
    *batchSureRoundQuotationEnd({ payload }, { call }) {
      const res = getResponse(yield call(batchSureRoundQuotationEnd, payload));
      return res;
    },
    // 寻源大厅-创建页面头
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
    // 确认及汇总 - 导出
    *exportData({ payload }, { call }) {
      const result = getResponse(yield call(exportData, payload));
      return result;
    },
    // demo -导出pdf
    *exportPdf({ payload }, { call }) {
      const result = getResponse(yield call(exportPdf, payload));
      return result;
    },
    // 核价-导出
    *exportCheckPriceData({ payload }, { call }) {
      const result = getResponse(yield call(exportCheckPriceData, payload));
      return result;
    },

    // 立项转寻源
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

    // 立项转招寻源创建
    *sourcingCreate({ payload }, { call }) {
      const result = getResponse(yield call(sourcingCreate, payload));
      return result;
    },

    // 寻源事项查询
    *fetchMatterRequireFlag({ payload }, { call }) {
      const result = getResponse(yield call(fetchMatterRequireFlag, payload));
      return result;
    },

    // 复制历史单据确定
    *copyHistoryOrderModal({ payload }, { call }) {
      const result = getResponse(yield call(copyHistoryOrderModal, payload));
      return result;
    },

    // 核价/批量维护选用信息
    *batchEditQuotationLine({ payload }, { call }) {
      const result = getResponse(yield call(batchEditQuotationLine, payload));
      return result;
    },
    // 核价提交前校验
    *validateBeforeSubmit({ payload }, { call }) {
      const result = getResponse(yield call(validateBeforeSubmit, payload));
      return result;
    },
    // 申请转询价是否允许新增物料
    *allowAddItems({ payload }, { call }) {
      const result = getResponse(yield call(allowAddItems, payload));
      return result;
    },
    // 全部报价明细批量维护选用理由
    *batchChangeChooseReson({ payload }, { call }) {
      const result = getResponse(yield call(batchChangeChooseReson, payload));
      return result;
    },
    // 全部报价明细选用策略
    *batchChangeChooseStrategy({ payload }, { call }) {
      const result = getResponse(yield call(batchChangeChooseStrategy, payload));
      return result;
    },
    // 获取监控台供应商信息
    *fetchMonitorSupplierLine({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMonitorSupplierLine, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            monitorSupplierLine: result.content,
            monitorSupplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 开始竞价
    *startRFA({ payload }, { call }) {
      const result = getResponse(yield call(startRFA, payload));
      return result;
    },
    // 核价翻页保存
    *turnPageSave({ payload }, { call }) {
      const result = getResponse(yield call(turnPageSave, payload));
      return result;
    },
    // 查询个性化单元配置
    *fetchQueryUnitCustConfig({ payload }, { call }) {
      const result = getResponse(yield call(queryUnitCustConfig, payload));
      return result;
    },
    // 查询价格服务涨跌幅/历史最低价/历史最新价
    *fetchQueryPriceInfo({ payload }, { call, put, select }) {
      const result = getResponse(yield call(queryCheckPriceInfo, payload));
      if (result) {
        const { quoteLine = [] } = yield select((state) => state.newBidHall);
        yield put({
          type: 'updateState',
          payload: {
            quoteLine: updateDataState(result, quoteLine, payload.fieldName),
          },
        });
      }
      return result;
    },
    // 查询价格服务涨跌幅/历史最低价/历史最新价
    *fetchQueryCheckPriceInfo({ payload }, { call, put, select }) {
      const result = getResponse(yield call(queryCheckPriceInfo, payload));
      if (result) {
        const { quoteLine = [] } = yield select((state) => state.newBidHall);
        yield put({
          type: 'updateState',
          payload: {
            quoteLine: updateDataState(result, quoteLine, payload.fieldName),
          },
        });
      }
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
    // 多轮报价淘汰物料行详情查询
    *fetchEliItemDetail({ payload }, { call, put }) {
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            eliItemDetail: orDealDataState(result.content),
            eliItemDetailPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    *fetchElSupplierDetail({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLineCheckPrice, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            eliSupplierDetail: dealDataState(result.content),
            eliSupplierDetailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 多轮报价淘汰物料行查询
    *fetchEliminateItem({ payload }, { call, put }) {
      let result = yield call(fetchItemQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateEliItemData',
          payload: {
            eliItemLine: relatedLineId(dealDataState(result.content), payload.rfxLineItemId),
            eliItemLinePagination: relatedLineIdPagination(
              createPagination(result),
              payload.rfxLineItemId
            ),
          },
        });
      }
      return result;
    },
    // 多轮报价淘汰供应商列表
    *fetchElSupplier({ payload }, { call, put }) {
      let result = yield call(fetchSupplierQuoteLine, payload);
      result = getResponse(result);
      const eliSupplierLine = relatedSupplierLineId(
        dealDataState(result.content),
        payload.rfxLineSupplierId
      );
      if (result) {
        yield put({
          type: 'updateElSupplierData',
          payload: {
            eliSupplierLine,
            eliSupplierLinePagination: relatedLineIdPagination(
              createPagination(result),
              payload.rfxLineSupplierId
            ),
          },
        });
      }
      return eliSupplierLine;
    },
    // 多轮报价淘汰 全部报价明细
    *fetchEliQuoteLine({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuoteLine, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            eliQuoteLine: dealDataState(result.content),
            eliQuoteLinePagination: createPagination(result),
          },
        });
      }
    },
    // 确认淘汰
    *eliminateRfx({ payload }, { call }) {
      const result = getResponse(yield call(eliminateRfx, payload));
      return result;
    },
    // 查询招标过程附件
    *processAttachments({ payload }, { call, put }) {
      const result = getResponse(yield call(processAttachments, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            processAttachments: result.content,
            processPagination: createPagination(result),
          },
        });
      }
    },
    // 查询招标过程附件
    *fetchDetailAttachments({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDetailAttachments, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailAttachments: result.content,
            detailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 打印
    *queryPrint({ payload }, { call }) {
      const result = getResponse(yield call(queryPrint, payload));
      return result;
    },
    *priceList({ payload }, { call }) {
      const result = getResponse(yield call(priceList, payload));
      return result;
    },

    // 批量标段核价提交前校验
    *checkPriceSectionSubmitValidate({ payload }, { call }) {
      const result = getResponse(yield call(checkPriceSectionSubmitValidate, payload));
      return result;
    },

    // 批量标段核价提交
    *checkPriceSectionSubmit({ payload }, { call }) {
      const result = getResponse(yield call(checkPriceSectionSubmit, payload));
      return result;
    },
    // 专家评分节点操作记录
    *insertScoringOperationRecord({ payload }, { call }) {
      const result = getResponse(yield call(insertScoringOperationRecord, payload));
      return result;
    },
    // 查询核价页面专家评分
    *fetchCheckPriceExpertScore({ payload }, { call }) {
      const result = getResponse(yield call(fetchCheckPriceExpertScore, payload));
      return result;
    },
    // RFQ维护页面批量编辑业务实体和库存组织时判断物料是否需要清空
    *getClearLogic({ payload }, { call }) {
      const result = getResponse(yield call(getClearLogic, payload));
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
      const { rfxLineItemId, list, pagination } = payload;
      return {
        ...state,
        aloneItemLine: {
          ...aloneItemLine,
          [`${rfxLineItemId}`]: {
            list,
            pagination,
          },
        },
      };
    },
    updateSupplierItemList(state, { payload }) {
      const { aloneSupplierItemLine } = state;
      const { supplierCompanyId, list, pagination } = payload;
      return {
        ...state,
        aloneSupplierItemLine: {
          ...aloneSupplierItemLine,
          [`${supplierCompanyId}`]: {
            list,
            pagination,
          },
        },
      };
    },
    updateItemQuoteLineData(state, { payload }) {
      return {
        ...state,
        itemQuoteLine: [...state.itemQuoteLine, ...payload.itemQuoteLine],
        itemQuoteLinePagination: {
          ...state.itemQuoteLinePagination,
          ...payload.itemQuoteLinePagination,
        },
      };
    },
    updateSupplierQuoteLineData(state, { payload }) {
      let FilterSupplierQuoteLine = state.supplierQuoteLine;
      const supplierQuoteLineList = state.supplierQuoteLine.map((item) => item.rfxLineSupplierId);
      payload.supplierQuoteLine.forEach((item) => {
        if (supplierQuoteLineList.some((list) => list === item.rfxLineSupplierId)) {
          FilterSupplierQuoteLine = state.supplierQuoteLine.filter((items) => {
            return items.rfxLineSupplierId !== item.rfxLineSupplierId;
          });
        }
      });
      return {
        ...state,
        supplierQuoteLine: [...FilterSupplierQuoteLine, ...payload.supplierQuoteLine],
        supplierQuoteLinePagination: {
          ...state.supplierQuoteLinePagination,
          ...payload.supplierQuoteLinePagination,
        },
      };
    },
    updateItemRoundQuotaion(state, { payload }) {
      const { itemRoundQuotationDetail = [], itemRoundQuotationDetailtPagination = {} } = payload;
      const quotationItemList = state.quotationItemList.map((itemLine) => {
        if (itemLine.rfxLineItemId === itemRoundQuotationDetail[0].rfxLineItemId) {
          return { ...itemLine, rfxQuotationLineDTO: itemRoundQuotationDetail };
        } else {
          return itemLine;
        }
      });
      const quotationItemDetailPagination = {
        ...state.quotationItemDetailPagination,
        ...itemRoundQuotationDetailtPagination,
      };
      return {
        ...state,
        quotationItemList,
        quotationItemDetailPagination,
      };
    },

    updateSupplierRoundQuotaion(state, { payload }) {
      const {
        supplierRoundQuotationDetail = [],
        supplierRoundQuotationDetailtPagination = {},
      } = payload;
      const quotationSupplierList = state.quotationSupplierList.map((itemLine) => {
        // if (itemLine.supplierCompanyId === supplierRoundQuotationDetail[0].supplierCompanyId) {
        //   return { ...itemLine, rfxQuotationLineDTO: supplierRoundQuotationDetail };
        // } else {
        //   return itemLine;
        // }
        const { quotationHeaderId = null } = itemLine;
        const currentSupplierLine = supplierRoundQuotationDetail.filter(
          (supplier) => supplier.quotationHeaderId === quotationHeaderId
        );
        if (!quotationHeaderId) {
          return itemLine;
        }
        return {
          ...itemLine,
          rfxQuotationLineDTO:
            supplierRoundQuotationDetail[0].quotationHeaderId === quotationHeaderId
              ? currentSupplierLine
              : itemLine.rfxQuotationLineDTO,
        };
      });
      const quotationSupplierDetailPagination = {
        ...state.quotationSupplierDetailPagination,
        ...supplierRoundQuotationDetailtPagination,
      };
      return {
        ...state,
        quotationSupplierList,
        quotationSupplierDetailPagination,
      };
    },

    // rfxQuotationLineDTO
    updateEliItemData(state, { payload }) {
      return {
        ...state,
        eliItemLine: [...state.eliItemLine, ...payload.eliItemLine],
        eliItemLinePagination: {
          ...state.eliItemLinePagination,
          ...payload.eliItemLinePagination,
        },
      };
    },
    updateElSupplierData(state, { payload }) {
      let FilterSupplierQuoteLine = state.eliSupplierLine;
      const eliSupplierLineList = state.eliSupplierLine.map((item) => item.rfxLineSupplierId);
      payload.eliSupplierLine.forEach((item) => {
        if (eliSupplierLineList.some((list) => list === item.rfxLineSupplierId)) {
          FilterSupplierQuoteLine = state.eliSupplierLine.filter((items) => {
            return items.rfxLineSupplierId !== item.rfxLineSupplierId;
          });
        }
      });
      return {
        ...state,
        eliSupplierLine: [...FilterSupplierQuoteLine, ...payload.eliSupplierLine],
        eliSupplierLinePagination: {
          ...state.eliSupplierLinePagination,
          ...payload.eliSupplierLinePagination,
        },
      };
    },
    // 保存申请转询价查询数据
    updateApplyToInquirySearchData(state, { payload }) {
      if (payload.type === 'reset') {
        // 重置清空数据
        return {
          ...state,
          applyToInquirySearchData: {},
        };
      }
      return {
        ...state,
        applyToInquirySearchData: {
          ...state.applyToInquirySearchData,
          ...payload.params,
        },
      };
    },
  },
};
