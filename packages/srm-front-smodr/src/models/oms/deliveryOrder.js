import { getResponse } from 'utils/utils';
import { fetchDeliveryData, fetchMethod } from '@/services/oms/deliveryOrderService';

export default {
  namespace: 'deliveryOrder',
  state: {
    deliveryData: [],
    consignmentEntry: [],
    consignmentEntryPage: {},
    consignmentFreight: [],
    consignmentFreightPage: {},
    methodList: [],
  },
  effects: {
    *fetchDeliveryData({ payload }, { call, put }) {
      const res = yield call(fetchDeliveryData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            deliveryData: res || [],
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
