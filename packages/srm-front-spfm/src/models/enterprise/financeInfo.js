/**
 * financeInfo - 企业注册-财务信息 - Modal
 * @date: 2018-7-6
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryFinance, addFinance, removeFinance } from '@/services/financeInfoService';

export default {
  namespace: 'financeInfo',
  state: {
    data: [],
    code: {},
  },
  effects: {
    *fetchFinanceInfo({ payload }, { call, put }) {
      const response = yield call(queryFinance, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryFinance',
          payload: data,
        });
      }
    },
    *addFinanceInfo({ payload }, { call }) {
      const response = yield call(addFinance, payload);
      return getResponse(response);
    },
    *deleteFinanceInfo({ payload }, { call }) {
      const response = yield call(removeFinance, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryFinance(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    addNewData(state, action) {
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    },
    editRow(state, action) {
      return {
        ...state,
        data: action.payload.data,
      };
    },
    removeNewAdd(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
