/**
 * productShelves - 电商商品上下架 - medal
 * @date: 2019-12-25
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchShelvesList, batchPutaway, fetchCompanyId } from '@/services/productShelvesService';

export default {
  namespace: 'productShelves',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 商品列表查询
    *fetchShelvesList({ payload }, { call, put }) {
      const response = yield call(fetchShelvesList, payload);
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

    // 商品批量上架/下架
    *batchPutaway({ payload }, { call }) {
      const response = yield call(batchPutaway, payload);
      return getResponse(response);
    },

    // 获取当前公司值集
    *fetchCompanyId({ payload }, { call }) {
      const res = yield call(fetchCompanyId, payload);
      return getResponse(res);
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
