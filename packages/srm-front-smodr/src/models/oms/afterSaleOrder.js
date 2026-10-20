import { getResponse } from 'utils/utils';
import { fetchAfterSaleData } from '@/services/oms/afterSaleOrderService';

export default {
  namespace: 'afterSaleOrder',
  state: {
    afterSaleData: {},
  },
  effects: {
    *fetchAfterSaleData({ payload }, { call, put }) {
      const res = yield call(fetchAfterSaleData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            afterSaleData: response || {},
          },
        });
      }
      return response;
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
