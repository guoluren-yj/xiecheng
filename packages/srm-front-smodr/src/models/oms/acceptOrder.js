import { getResponse } from 'utils/utils';
import { fetchAcceptData } from '@/services/oms/acceptOrderService';
import { fetchMethod } from '@/services/oms/deliveryOrderService';

export default {
  namespace: 'acceptOrder',
  state: {
    acceptData: [],
    receiptEntry: [],
    receiptEntryPage: {},
    receiptFreight: [],
    receiptFreightPage: {},
  },
  effects: {
    *fetchAcceptData({ payload }, { call, put }) {
      const res = yield call(fetchAcceptData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            acceptData: res || [],
          },
        });
      }
      return response;
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
