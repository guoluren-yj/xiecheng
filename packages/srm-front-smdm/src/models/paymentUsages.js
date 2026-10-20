/**
 * paymentUsages - 付款用途定义 - model
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryUsages, addUsages } from '@/services/paymentUsagesService';

export default {
  namespace: 'paymentUsages',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    tenantId: null,
  },
  effects: {
    *fetchUsages({ payload }, { call, put }) {
      const response = yield call(queryUsages, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryUsages',
          payload: data,
        });
      }
    },
    *addUsages({ payload }, { call }) {
      const response = yield call(addUsages, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryUsages(state, action) {
      return {
        ...state,
        data: {
          ...action.payload,
          list: action.payload.content,
          pagination: createPagination(action.payload),
        },
      };
    },
    setTenantId(state, action) {
      return {
        ...state,
        tenantId: action.payload,
      };
    },
  },
};
