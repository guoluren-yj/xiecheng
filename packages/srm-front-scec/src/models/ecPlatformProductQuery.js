/**
 * EcPlatformProductQuery -平台电商商品查询 - model
 * @date: 2019-6-26
 * @author LH <heng.liu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchGoodsList, fetchGoodsPreview } from '@/services/ecPlatformProductQueryService';
import { queryIdpValue } from 'services/api'; // 请求单个值集

export default {
    namespace: 'ecPlatformProductQuery',
    state: {
      list: {},
      pagination: {},
      enabledFlag: [],
      detail: {},
    },
    effects: {

    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            enabledFlag: list,
          },
        });
      }
    },

    // 商品列表查询
    *fetchGoodsList({ payload }, { call, put }) {
        const response = yield call(fetchGoodsList, payload); // 异步函数
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

    // 商品详情
    *fetchGoodsPreview({ payload }, { call, put }) {
      const response = yield call(fetchGoodsPreview, payload); // 异步函数
      const detail = getResponse(response);
      // 将数据存储到model中
      if (detail) {
        yield put({
            type: 'updateState',
            payload: {
              detail,
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