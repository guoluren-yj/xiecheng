import { getResponse } from 'utils/utils';
import { fetchReconData } from '@/services/oms/reconciliationOrderService';
import { fetchMethod } from '@/services/oms/deliveryOrderService';

export default {
  namespace: 'reconciliationOrder',
  state: {
    reconData: [],
    statementsEntry: [],
    statementsEntryPage: {},
    statementFreight: [],
    statementFreightPage: {},
  },
  effects: {
    *fetchReconData({ payload }, { call, put }) {
      const response = yield call(fetchReconData, payload);
      const res = getResponse(response);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            reconData: res || [],
          },
        });
      }
      return res || [];
    },
    *fetchMethod({ payload }, { call, put }) {
      const res = yield call(fetchMethod, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            methodList: res || [],
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
