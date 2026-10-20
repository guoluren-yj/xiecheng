/**
 * model 寻源服务/寻源事件查询
 * @date: 2019-7-11
 * @author: chenjing <jing.chen05@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  fetchDataList,
  fetchBasicInfoDetail,
  fetchExpertsInfo,
  fetchScorElementsData,
  fetchSupplierListData,
  fetchItemLine,
  fetchSupplierRecord,
  fetchEvaluateIndicAssign,
  fetchLinePackDetail,
  fetchLineNoneDetail,
  fetchAloneItemLine,
  fetchCalibrationQuotation,
  fetchBidMembers,
  fetchScoringElementData,
  uploadAttachement,
  fetchItemSupplierLineQuotationDetail,
  fetchBidDetailProcessAll,
  fetchSupplierDimensionHeader,
  fetchAloneSupplierItemLine,
  fetchHeaderInfo,
  prequalDetailHeaderBidDetail,
  prequalDetailBidDetail,
  fetchPretrialPanel,
  openBidDetail,
  quotationDetailBidDetail,
  fetchHistoryApproval,
} from '@/services/bidEventQueryService';
import { fetchQuotationDetail } from '@/services/inquiryHallService';
import {
  bidEvaluationDetails, // 评分阶段评分明细
  fetchEvaluateSummary, // 确认候选人
  fetchSumScore, // 总分
} from '@/services/bidHallService';

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

      return {
        ...item,
        children: subConfig,
      };
    }

    return {
      ...item,
      _status: 'update',
    };
  });

  return config;
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

const getModel = (modelName = 'bidEventQuery') => ({
  namespace: modelName,
  state: {
    code: {}, // 值集
    bidEventQueryList: [], // 招标事件查询入口列表
    bidEventQueryPagination: {}, // 招标事件查询入口分页
    header: {}, // 招标事件查询明细页面头
    scoringNoneTempelate: [], // 评分要素不区分数据
    scoringBusinessTempelate: [], // 评分要素商务组数据
    scoringTechnologyTempelate: [], // 评分要素技术组数据
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {}, // 供应商列表数据分页
    itemLine: [], // 物品明细数据
    supplierData: [], // 物品明细供应商数据
    currentScoringExperts: [], // 当前评分要素专家数据
    LinePackList: [], // 行信息-分标段数据
    LinePackListPagination: {}, // 行信息-分标段分页
    LineNoneList: [], // 行信息-不分标段数据
    LineNoneListPagination: {}, // 行信息-不分标段分页
    pagination: {}, // 分页器
    aloneItemLine: {}, // 招标事件查询：根据物料头id获取物料明细列表
    itemLineChange: false, // 物料行是否发生改变
    allLineChange: false, // 全部明细是否发生改变
    itemContentChange: {}, // 物料行table是否发生改变
    supplierContentChange: {}, // 供应商行table是否发生改变
    calibQuotationList: [], // 定标供应商下物品列表
    bidMembersList: [], // 招标小组列表
    scoringElement: [], // 评分要素数据
    supplierLineQuotationDetail: [], // 供应商报价明细
    bidDetailProcessList: [], // 进度条
    supplierDimensionHeaderList: [], // 供应商维度头信息
    supplierItemPagination: {}, // 供应商维度物料行分页信息
    supplierItemList: [], // 供应商维度物料行列表
    aloneSupplierItemLine: {}, // 定标：根据供应商id获取供应商列表
    headerInfo: [], // 招标简单头
    bidDetailPrequalHeader: {}, // bid明细 资格预审头信息
    prequalDetailList: [], // bid明细 资格预审详情数据
    prequalDetailPagination: {}, // bid明细 资格预审详情数据分页
    pretrialPanelList: [], // 预审小组
    bidDetailOpenBidList: [], // 开标信息
    bidDetailQuotationList: [], // 投标详情
    bidDetailQuotationPagination: {}, // 投标分页
    evaluateExpertList: [], // 商务技术专家
    scoreDetails: [], // 评分明细
    bidSectionList: {}, // 确认候选人
    sumScoreData: [], // 总分
  },
  effects: {
    // 获取列表
    *fetchDataList({ payload }, { call, put }) {
      let result = yield call(fetchDataList, payload);

      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidEventQueryList: result.content,
            bidEventQueryPagination: createPagination(result),
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
    // 获取招标事件查询明细头信息
    *fetchBasicInfoDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBasicInfoDetail, payload));
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
    // 获取招标事件查询专家分配数据
    *fetchExpertsInfo({ payload }, { call, put }) {
      let result = yield call(fetchExpertsInfo, payload);
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
    // 获取招标事件查询评分要素数据
    *fetchScorElementsData({ payload }, { call, put }) {
      let result = yield call(fetchScorElementsData, payload);
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
    // 招标事件查询获取供应商列表
    *fetchSupplierListData({ payload }, { call, put }) {
      let result = yield call(fetchSupplierListData, payload);
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
    // 物品明细供应商list
    *supplierRecord({ payload }, { call, put }) {
      let result = yield call(fetchSupplierRecord, payload);
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
    // 招标事件查询--单独获取物料行
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
      }
    },
    // 招标事件查询区分标段供应商投标物料行查询API  ===> 展开物料行信息
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
            sectionId,
            list: result.content,
            pagination,
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

    // 上传传递uuid
    *uploadAttachement({ payload }, { call }) {
      const result = yield call(uploadAttachement, payload);
      return result;
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
        return dealDataState(result.supQuotationDetailPage.content || []) || [];
      } else {
        return null;
      }
    },
    // 获取供应商维度头
    *fetchSupplierDimensionHeader({ payload }, { call, put }) {
      let result = yield call(fetchSupplierDimensionHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDimensionHeaderList: dealDataState(result),
          },
        });
      }
      return result;
    },
    // 获取供应商维度物料行
    *fetchAloneSupplierItemLine({ payload }, { call, put }) {
      const { supplierCompanyId } = payload;
      let result = yield call(fetchAloneSupplierItemLine, payload);
      result = getResponse(result);
      if (result) {
        const supplierItemPagination = createPagination(result);
        yield put({
          type: 'updateSupplierItemList',
          payload: {
            supplierCompanyId,
            supplierItemPagination,
            supplierItemList: dealDataState(result.content),
          },
        });
      }
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

    // 预审小组-查询
    *fetchPretrialPanel({ payload }, { call, put }) {
      const response = yield call(fetchPretrialPanel, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            pretrialPanelList: data,
          },
        });
      }
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

    // 查询审批历史记录
    *fetchHistoryApproval({ params }, { call }) {
      const res = yield call(fetchHistoryApproval, params) || [];
      return getResponse(res || []);
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
      return {
        ...state,
        aloneItemLine: {
          ...aloneItemLine,
          [`${bidLineItemId}`]: {
            list,
            pagination,
          },
        },
      };
    },
    updateCalibItemList(state, { payload }) {
      const { calibQuotationList } = state;
      const { quotationHeaderId, sectionId, list, pagination } = payload;
      return {
        ...state,
        calibQuotationList: {
          ...calibQuotationList,
          [`${sectionId}#${quotationHeaderId}`]: {
            list,
            pagination,
          },
        },
      };
    },
    updateSupplierItemList(state, { payload }) {
      const { aloneSupplierItemLine } = state;
      const { supplierCompanyId, supplierItemPagination, supplierItemList } = payload;
      return {
        ...state,
        aloneSupplierItemLine: {
          ...aloneSupplierItemLine,
          [`${supplierCompanyId}`]: {
            supplierItemPagination,
            supplierItemList,
          },
        },
      };
    },
  },
});

export default getModel;
