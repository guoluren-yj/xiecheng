/**
 * productDefine - 产品定义 - model
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryProduct, saveProduct } from '@/services/productDefineService';

export default {
  namespace: 'productDefine',
  state: {
    /**
     * 产品定义数据
     */
    data: [],
    /**
     * 产品定义分页
     */
    pagination: {},
  },
  effects: {
    /**
     * 查询产品定义数据
     */
    *fetchProduct({ payload }, { call, put }) {
      const response = yield call(queryProduct, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: data.content,
            pagination: createPagination(data),
          },
        });
      }
    },
    /**
     * 保存产品定义数据
     */
    *saveProductDefine({ payload }, { call }) {
      const response = yield call(saveProduct, payload);
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
