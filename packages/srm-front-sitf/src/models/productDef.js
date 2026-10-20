/**
 * productDefinition - 产品线定义 - medal
 * @date: 2018-9-11
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryProductDef, updateProduct } from '@/services/productDefService';

export default {
  namespace: 'productDef',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    /**
     * 查询产品线定义列表
     */
    *queryProductDef({ payload }, { call, put }) {
      const response = yield call(queryProductDef, payload);
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

    /**
     * 查询或者修改消息队列
     */
    *updateProduct({ payload }, { call }) {
      const response = yield call(updateProduct, payload);
      return getResponse(response);
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
