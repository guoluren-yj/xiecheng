/**
 * model 寻源服务/询报价查询
 * @date: 2018-1-25
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchRfqDataList,
  fetchQuoteLine,
  fetchAloneItemLine,
  fetchAloneSupplierItemLine,
} from '@/services/queryRfqService';
import {
  fetchSupplierLineCheckPrice,
  fetchInquiryHeaderDetail,
  fetchLadderLevelTable,
  fetchItemLine,
  getStage,
  fetchScoringElementData,
  fetchLadderLevelyTable,
} from '@/services/inquiryHallService';

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

export default {
  namespace: 'queryRfq',
  state: {
    rfqList: [], // 询报价所有数据
    pagination: {},
    oldTotalElements: 0, // 寻源大厅数据列表总条数
    quoteLine: [], // 全部报价明细
    quoteLinePagination: {}, // 全部报价明细分页
    aloneItemLine: {}, // 询报价查询：根据物料头id获取物料明细列表
    aloneSupplierItemLine: {}, // 询报价查询：根据供应商id获取供应商列表
    stageData: [],
    quotaLadderLevelData: [], // 询报价查询明细阶梯等级数据
    header: {}, // 寻源大厅维护页面头
    itemLine: [], // 物品明细数据
    itemLinePagination: {},
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {},
    scoringElement: [], // 评分要素数据
  },
  effects: {
    // 询报价查询所有
    *fetchRfqDataList({ payload }, { call, put }) {
      let result = yield call(fetchRfqDataList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  rfqList: result.content,
                  pagination: createPagination(result),
                }
              : {
                  pagination: createPagination(result),
                  oldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
                },
        });
      }
      return result;
    },
    // 获取寻源大厅维护头
    *fetchInquiryHeaderDetail({ payload }, { call, put }) {
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
            itemLine: dealDataState(result.content),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
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
    // 获取询报价查询全部报价明细
    *fetchQuoteLine({ payload }, { call, put }) {
      let result = yield call(fetchQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteLine: result.content,
            quoteLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 询报价查询--单独获取物料行
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
    // 询报价查询--单独获取供应商行
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
    // 获取阶梯报价数据
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

    // 获取阶梯报价数据
    *fetchLadderLevelyTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelyTable, payload);
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
    // 请求stage
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
  },
};
