/**
 * model 投标查询
 * @date: 2019-5-18
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  fetchScoring,
  fetchScoringHistory,
  fetchScoringSupplier,
  fetchScoreElementList,
  fetchScoringQuotation,
  fetchScoringHeader,
  fetchScoringIndic,
  saveScoreing,
  submitScoreing,
  saveElementScoreing,
  submitElementScoreing,
  fetchClarifyNotifyDataList,
  queryClarifyNotifyHeader,
  queryClarifyNotifyQuestionList,
  createClarifyNotifyQuestionList,
  deleteQuestionRows,
  submitClarifyNotifyQuestionList,
  queryMyQuestionList,
  queryClarifyNotifyDetailList,
  queryClarifyNotifyDetailHeader,
  fetchExpertScoreItemLines,
  roundBeginScore,
  beginRoundQuotation,
  queryReviewSupplier,
  saveReviewScoring,
  saveReviewElementScoring,
  submitReviewScoring,
  transfer,
} from '@/services/expertScoringService';
import {
  querySetting,
  fetchInquiryHeaderDetail,
  fetchItemLine,
  fetchSupplierLine,
  fetchScoringElementData,
  fetchTempelateDetailData,
  fetchExpertAllocationData,
  fetchBidMembers,
  fetchSupplier,
  fetchEvaluateIndicAssign,
} from '@/services/bidHallService';
import {
  fetchLadderLevelyTable,
  fetchLadderLevelTable,
  getStage,
  fetchScoreInquiryHeaderDetail,
  fetchInquiryItemLine,
  fetchInquirySupplierLine,
  supplierInquiryRecord,
  fetchItemLineQuotationDetail,
  querySupplierExchangeEdit,
  saveExchangeEdit,
  fetchHeaderInfo,
  fetchQuotationDetail,
} from '@/services/inquiryHallService';

function dealDataState(data = []) {
  // 处理行 处理字段为update
  let config = [];
  config = data.map((element) => {
    if (!element.evaluateScoreLineDetailS) {
      return {
        ...element,
        _status: 'update',
      };
    } else {
      const { evaluateScoreLineDetailS = [], ...otherItem } = element;
      const itemData = evaluateScoreLineDetailS.map((item) => {
        return {
          ...item,
          _status: 'update',
        };
      });
      return {
        ...otherItem,
        _status: 'update',
        evaluateScoreLineDetailS: itemData,
      };
    }
  });
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

const getModel = (modelName = 'expertScoring') => ({
  namespace: modelName,
  state: {
    code: [],
    scoringList: [], // 进行中的评分列表
    scoringListPagination: [], // 进行中的评分列表分页
    scoringOldTotalElements: 0,
    historyOldTotalElements: 0,
    scoringHistoryList: [], // 历史评分列表
    scoringHistoryPagination: [], // 历史评分列表分页
    evaluateSectionList: [], // 标段评分供应商
    evaluateScoreList: [], // 不分标段评分供应商
    scoringQuotationList: {}, // 供应商投标列表
    scoringRightDeatilHeader: {}, // 右侧弹窗详情信息
    scoringRightDeatilLine: [], // 右侧弹框详情信息
    header: {}, // 招标大厅维护页面头
    itemLine: [], // 物品明细数据
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {}, // 供应商列表数据分页
    bidMembersList: [], // 招标小组列表
    evaluateExpertList: [], // none/diff 合并
    scoringNoneTempelate: [], // 模板明细不区分数据
    scoringBusinessTempelate: [], // 模板明细商务组数据
    scoringTechnologyTempelate: [], // 模板明细技术组数据
    itemLineChange: false, // 物料行是否发生改变
    scoringElement: [], // 评分要素数据
    supplierData: [], // 物品明细供应商数据
    expAttachmentUuid: null, // 物品明细供应商数据
    scoreElementList: {}, // 专家评分--分标段/不分标段-评分要素维度信息
    historys: '', // 页面路由记录
    clarifyNotifyDataList: [], // 澄清单列表数据
    createHeader: {}, // 专家提疑头信息
    clarifyNotifyHeader: {}, // 专家提疑头信息
    clarifyNotifyQuestionList: [], // 专家提疑问题列表
    notifyQuestionListPagenation: {}, // 专家提疑页面分页数据
    clarifyNotifyDataListPagination: {}, // 澄清单列表分页
    myQuestionList: [], // 专家提疑入口页面，我提出的问题列表
    myQuestionListPagination: {}, // 专家提疑入口页面，我提出的问题列表分页
    selectedRowKeys: [], // 评审澄清页表侧滑表格已勾选的keys
    clarifyNotifyDetailList: [], // 澄清详情列表数据
    clarifyNotifyDetailListPagination: {}, // 澄清详情列表分页数据
    clarifyNotifyDetailHeader: {}, // 澄清单详情头信息
    ladderLevelData: [], // 阶梯报价数据
    stageData: [], // 工作流节点
    itemLinePagination: {}, // 物品明细分页
    itemLineQuotationDetail: [], // 物品明细报价详情
    expertScoreItemLineList: [], // 多轮报价
    expertScoreItemPagination: {},
    exchangeEditSupplierList: [], // 专家评分/汇率编辑/供应商查询list
    itemQuotationPagination: {}, // 物品行报价明细分页
    itemQuotationDetail: [], // 物品行报价明细
    QuotationDetailDataSource: {}, // 物品行报价明细总数据
    settings: {}, // 配置中心配置项
    quotaLadderLevelData: [], // 核价/初审阶梯等级数据
    evaluateShowType: '', // 控制附件展示类型
  },
  effects: {
    // 报价明细
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
    // rfx simpleHeaders
    *fetchRfxHeaderInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchHeaderInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            header: res,
          },
        });
      }
      return res;
    },
    // 专家评分-汇率编辑-保存
    *saveExchangeEdit({ payload }, { call }) {
      const result = getResponse(yield call(saveExchangeEdit, payload));
      return result;
    },
    // 专家评分-汇率编辑-供应商查询
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
    // 获取进行中的评分列表
    *fetchScoring({ payload }, { call, put }) {
      let result = yield call(fetchScoring, payload);
      result = getResponse(result);

      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  scoringList: result.content,
                  scoringListPagination: createPagination(result),
                }
              : {
                  scoringListPagination: createPagination(result),
                  scoringOldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端
                },
        });
      }
      return result;
    },

    // 获取历史评分列表
    *fetchScoringHistory({ payload }, { call, put }) {
      let result = yield call(fetchScoringHistory, payload);
      result = getResponse(result);

      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  scoringHistoryList: result.content,
                  scoringHistoryPagination: createPagination(result),
                }
              : {
                  scoringHistoryPagination: createPagination(result),
                  historyOldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端
                },
        });
      }
      return result;
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

    // 获取供应商评分信息--区分标段
    *fetchScoringSupplier({ payload }, { call, put }) {
      let result = yield call(fetchScoringSupplier, payload);
      result = getResponse(result);

      if (result) {
        if (result.sectionFlag) {
          yield put({
            type: 'updateState',
            payload: {
              evaluateSectionList: result.evaluateSectionDTOS,
              expAttachmentUuid: result.expertAttachmentUuid,
              evaluateShowType: result.evaluateShowType,
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              evaluateScoreList: result.evaluateScoreDTOS,
              expAttachmentUuid: result.expertAttachmentUuid,
              evaluateShowType: result.evaluateShowType,
            },
          });
        }
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
    // 查询专家提疑头信息
    *queryClarifyNotifyHeader({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyHeader: result,
          },
        });
      }
      return result;
    },
    // 查询专家提疑问题列表
    *queryClarifyNotifyQuestionList({ payload }, { call, put }) {
      let result = yield call(queryClarifyNotifyQuestionList, payload);
      result = getResponse(result);
      const notifyQuestionListPagenation = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyNotifyQuestionList: result.content,
            notifyQuestionListPagenation,
            notifyQuestionListPagenationPageSize: notifyQuestionListPagenation.pageSize,
          },
        });
      }
      return result;
    },
    // 查询专家-我提出的问题
    *queryMyQuestionList({ payload }, { call, put }) {
      let result = yield call(queryMyQuestionList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            myQuestionList: result.content,
            myQuestionListPagenation: createPagination(result),
          },
        });
      }
      return result;
    },

    // 专家评分--分标段/不分标段-评分要素维度查询
    *fetchScoreElementList({ payload }, { call, put }) {
      let result = yield call(fetchScoreElementList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreElementList: result,
          },
        });
      }
    },

    // 供应商投标物料行查询API  ===> 展开物料行信息
    *fetchScoringQuotation({ payload }, { call, put }) {
      const { quotationHeaderId, sectionId } = payload;
      let result = yield call(fetchScoringQuotation, payload);
      result = getResponse(result);

      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateItemList',
          payload: {
            quotationHeaderId,
            sectionId,
            list: result.content,
            pagination,
          },
        });
      }
      return result;
    },

    // 右侧 弹窗头信息
    *fetchScoringHeader({ payload }, { call, put }) {
      let result = yield call(fetchScoringHeader, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringRightDeatilHeader: result,
          },
        });
      }
      return result;
    },
    // 右侧 弹框行信息
    *fetchScoringIndic({ payload }, { call, put }) {
      let result = yield call(fetchScoringIndic, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringRightDeatilLine: dealDataState(result),
          },
        });
      }
      return result;
    },

    // 保存投标单
    *saveScoreing({ payload }, { call }) {
      return getResponse(yield call(saveScoreing, payload));
    },
    // 提交投标单
    *submitScoreing({ payload }, { call }) {
      return getResponse(yield call(submitScoreing, payload));
    },
    // 专家评分-标段-评分汇总保存
    *saveElementScoreing({ payload }, { call }) {
      const result = getResponse(yield call(saveElementScoreing, payload));
      return result;
    },
    // 专家提疑-保存
    *createClarifyNotifyQuestionList({ payload }, { call }) {
      const result = getResponse(yield call(createClarifyNotifyQuestionList, payload));
      return result;
    },
    // 专家提疑-提交
    *submitClarifyNotifyQuestionList({ payload }, { call }) {
      const result = getResponse(yield call(submitClarifyNotifyQuestionList, payload));
      return result;
    },
    // 专家提疑-删除问题行
    *deleteQuestionRows({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuestionRows, payload));
      return result;
    },
    // 专家评分-标段/非标段-评分汇总提交
    *submitElementScoreing({ payload }, { call }) {
      const result = getResponse(yield call(submitElementScoreing, payload));
      return result;
    },
    // 获取头信息
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
    // 专家评分跳询价大厅-获取询价大厅审批阶段
    *getStage({ payload }, { call, put }) {
      let res = yield call(getStage, payload);
      res = getResponse(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            stageData: dealDataState(res),
          },
        });
      }
    },
    // 专家评分跳询价大厅-获取询价大厅维护头
    *fetchInquiryHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchScoreInquiryHeaderDetail, payload));
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
    // 专家评分跳询价大厅-询价阶梯报价
    *fetchLadderLevelyTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelyTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderLevelData: dealDataState(result.content),
          },
        });
      }
    },
    // 专家评分跳询价大厅-获取物品明细列表
    *fetchInquiryItemLine({ payload }, { call, put }) {
      let result = yield call(fetchInquiryItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataState(result.content),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 专家评分跳询价大厅-获取供应商列表
    *fetchInquirySupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchInquirySupplierLine, payload);
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
    // 专家评分跳询价大厅-供应商list
    *supplierInquiryRecord({ payload }, { call, put }) {
      let result = yield call(supplierInquiryRecord, payload);
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
      return result;
    },
    // 专家评分－供应商物品相关信息
    *fetchExpertScoreItemLines({ payload }, { call, put }) {
      let result = yield call(fetchExpertScoreItemLines, payload);
      result = getResponse(result) || {};
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            expertScoreItemLineList: dealDataState(result.content),
            expertScoreItemPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 专家评分－发起多轮报价
    *beginRoundQuotation({ payload }, { call }) {
      const result = getResponse(yield call(beginRoundQuotation, payload));
      return result;
    },
    // 专家评分－开始评分
    *roundBeginScore({ payload }, { call }) {
      const result = getResponse(yield call(roundBeginScore, payload));
      return result;
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
      }
    },
    // 初步评审 - 查询评审供应商维度列表
    *fetchQueryReviewSupplier({ payload }, { call, put }) {
      let result = yield call(queryReviewSupplier, payload);
      result = getResponse(result);
      if (result) {
        if (result.sectionFlag) {
          yield put({
            type: 'updateState',
            payload: {
              evaluateSectionList: result.evaluateSectionDTOS,
              expAttachmentUuid: result.reviewAttachmentUuid,
              // evaluateScoreListPagination: createPagination(result.evaluateSectionDTOS.evaluateScores),
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              evaluateScoreList: result.evaluateScoreDTOS,
              expAttachmentUuid: result.reviewAttachmentUuid,
            },
          });
        }
      }
      return result;
    },
    // 保存评分 - 初步评审
    *fetchSaveReviewScoring({ payload }, { call }) {
      return getResponse(yield call(saveReviewScoring, payload));
    },
    // 专家评分-标段-评分汇总保存
    *fetchSaveReviewElementScoring({ payload }, { call }) {
      const result = getResponse(yield call(saveReviewElementScoring, payload));
      return result;
    },
    // 专家评分-标段-评分汇总保存
    *fetchSubmitReviewScoring({ payload }, { call }) {
      const result = getResponse(yield call(submitReviewScoring, payload));
      return result;
    },
    // 转发
    *transfer({ payload }, { call }) {
      const result = getResponse(yield call(transfer, payload));
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
      const { scoringQuotationList } = state;
      const { quotationHeaderId, sectionId, list, pagination } = payload;
      return {
        ...state,
        scoringQuotationList: {
          ...scoringQuotationList,
          [`${sectionId}#${quotationHeaderId}`]: {
            list,
            pagination,
          },
        },
      };
    },
  },
});

export default getModel;
