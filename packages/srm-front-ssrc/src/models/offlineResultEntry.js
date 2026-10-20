/**
 * model - 线下询价结果录入
 * @date: 2019-03-05
 * @author: Nemo <yingbin.jiang@hand-china.com>
 * @version: 1.0.0
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  fetchRFxList,
  fetchInquiryHeader,
  fetchQuoteLineList,
  saveQuoteLine,
  submitQuoteData,
  deleteQuoteLines,
  fetchItemList,
  quotationFeedBack,
  finishQuotation,
  validateOfflineResultSubmit,
} from '@/services/offlineResultEntryService';
import { batchMaintainItemQuotationLine } from '@/services/inquiryHallService';
import {
  fetchLadderList,
  saveLadderList,
  deleteLadderQuot,
  queryQuotationHeader,
} from '@/services/inquiryPriceService';

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

const getModel = (modelName = 'offlineResultEntry') => ({
  namespace: modelName,
  state: {
    code: {}, // 值集
    data: [], // 询价单数据
    pagination: {}, // 询价单数据分页器
    oldTotalElements: 0, // 列表总条数
    header: {}, // 询价单头数据
    quoteList: [], // 报价明细行
    quoteListPagination: {}, // 报价明细分页器
    quoteListChange: false, // 判断报价明细行是否改变
    itemList: [], // 物品明细行
    itemListPagination: {}, // 物品明细分页器
    quotationFeedBackList: [], // 报价响应列表
    fetchLadderList: [], // 阶梯报价
    quotationHeader: {}, //
  },

  effects: {
    // 全部报价明细批量维护
    *batchMaintainItemQuotationLine({ payload }, { call }) {
      const result = yield call(batchMaintainItemQuotationLine, payload);
      return getResponse(result);
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
    // 查询询报价
    *fetchRFxList({ payload }, { call, put }) {
      let result = yield call(fetchRFxList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  data: result.content,
                  pagination: createPagination(result),
                }
              : {
                  pagination: createPagination(result),
                  oldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端
                },
        });
      }
      return result;
    },
    // 查询具体询价头详情
    *fetchInquiryHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInquiryHeader, payload));
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
    // 查询报价明细行
    *fetchQuoteLineList({ payload }, { call, put }) {
      let result = yield call(fetchQuoteLineList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteList: dealDataState(result.content),
            quoteListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 新增报价明细行
    *saveQuoteLine({ payload }, { call }) {
      const result = getResponse(yield call(saveQuoteLine, payload));
      return result;
    },
    *submitQuoteData({ payload }, { call }) {
      const result = getResponse(yield call(submitQuoteData, payload));
      return result;
    },
    // 报价明细行-批量删除
    *deleteQuoteLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuoteLines, payload));
      return result;
    },
    // 查询物品行
    *fetchItemList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchItemList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemList: result.content,
            itemListPagination: createPagination(result),
          },
        });
      }
      return result;
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
    // 获取阶梯报价历史明细列表
    *fetchLadderList({ payload }, { call, put }) {
      let result = yield call(fetchLadderList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchLadderList: dealDataState(result.content),
            // fetchLadderListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存阶梯报价
    *saveLadderList({ payload }, { call }) {
      return getResponse(yield call(saveLadderList, payload));
    },
    // 阶梯报价-批量删除
    *deleteLadderQuot({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderQuot, payload));
      return result;
    },
    // 结束报价
    *finishQuotation({ payload }, { call }) {
      return getResponse(yield call(finishQuotation, payload));
    },
    // 查询报价单头信息
    *queryQuotationHeader({ payload }, { call, put }) {
      const quotationHeader = getResponse(yield call(queryQuotationHeader, payload));
      if (quotationHeader) {
        yield put({
          type: 'updateState',
          payload: {
            quotationHeader,
          },
        });
      }
      return quotationHeader;
    },
    // 线下结果录入-提交校验
    *validateOfflineResultSubmit({ payload }, { call }) {
      return yield call(validateOfflineResultSubmit, payload); // 这里是为了捕获到异常信息
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
});

export default getModel;
