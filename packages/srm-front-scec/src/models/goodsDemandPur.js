/**
 * goodsDemand - 商品维护查询 采购方- medal
 * @date: 2019-2-9
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGoodsList,
  fetchProductDetail,
  fetchLadderPriceTable,
} from '@/services/goodsDemandPurService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'goodsDemandPur',
  state: {
    list: {},
    pagination: {},
    detail: {},
    code: {},
    ladderPriceData: [],
  },
  effects: {
    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            code: list,
          },
        });
      }
    },

    // 商品上下架列表查询
    *fetchGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchGoodsList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 查询商品详情
    *fetchProductDetail({ payload }, { call, put }) {
      const response = yield call(fetchProductDetail, payload);
      const detail = getResponse(response);
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            detail,
          },
        });
      }
    },

    // 询价阶梯报价
    *fetchLadderPriceTable({ payload }, { call, put }) {
      const result = yield call(fetchLadderPriceTable, payload);
      const res = getResponse(result);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceData: res.content,
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
  },
};
