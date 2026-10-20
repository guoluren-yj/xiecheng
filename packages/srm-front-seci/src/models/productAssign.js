/**
 * productAssign - 产品分配 - medal
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchProductAssign,
  addProductAssign,
  handleDisabledProductAssign,
  fetchProduct,
  fetchTenantInfo,
} from '@/services/productAssignService';

export default {
  namespace: 'productAssign',
  state: {
    tenantInfo: {},
    data: [],
    productData: [],
    productPagination: {},
  },
  effects: {
    /**
     * 查询征信产品
     */
    *fetchProductAssign({ payload }, { call, put }) {
      const response = yield call(fetchProductAssign, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data,
          },
        });
      }
    },

    /**
     * 查询全部产品
     */
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(fetchProduct, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productData: data.content,
            productPagination: createPagination(data),
          },
        });
      }
    },

    /**
     * 查询租户信息
     */
    *fetchTenantInfo({ payload }, { call, put }) {
      const response = yield call(fetchTenantInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            tenantInfo: data.content && data.content[0],
          },
        });
      }
    },

    /**
     * 添加产品
     */
    *addProductAssign({ payload }, { call }) {
      const response = yield call(addProductAssign, payload);
      return getResponse(response);
    },
    /**
     * 启用/禁用产品
     */
    *handleDisabledProductAssign({ payload }, { call }) {
      const response = yield call(handleDisabledProductAssign, payload);
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
