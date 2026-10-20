/**
 * model 寻源结果管理/供应商报价汇总查询
 * @date: 2019-12-17
 * @author: jing.chen05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchSumQueryList,
  sumQueryExport,
  fetchLadderList,
  fetchQuotationDetailData,
} from '@/services/supQuoSumQueryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supQuoSumQuery',
  state: {
    sumQueryList: [], // 供应商报价汇总查询列表
    sumQueryPagination: {}, // 供应商报价汇总查询分页器
    oldTotalElements: 0, // 寻源大厅数据列表总条数
    code: {}, // 值集
    LadderDataList: [], // 阶梯报价数据
    quotationDetailList: [], // 报价明细数据
  },
  effects: {
    // 询报价入口查询
    *fetchSumQueryList({ payload }, { call, put }) {
      let result = yield call(fetchSumQueryList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  sumQueryList: result.content,
                  sumQueryPagination: createPagination(result),
                }
              : {
                  sumQueryPagination: createPagination(result),
                  oldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
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
    // 供应商报价汇总查询-导出
    *sumQueryExport({ payload }, { call }) {
      const result = yield call(sumQueryExport, payload);
      return getResponse(result);
    },
    // 获取阶梯报价历史明细列表
    *fetchLadderList({ payload }, { call, put }) {
      let result = yield call(fetchLadderList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            LadderDataList: result.content,
          },
        });
      }
      return result;
    },
    // 获取报价明细数据
    *fetchQuotationDetailData({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailList: result.supQuotationDetailPage.content,
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
    updateSetting(state, { payload }) {
      const { settings } = payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings,
        },
      };
    },
  },
};
