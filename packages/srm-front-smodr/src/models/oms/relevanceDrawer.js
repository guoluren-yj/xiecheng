import { getResponse } from 'utils/utils';
import { fetchData } from '@/services/oms/relevanceDrawService';

export default {
  namespace: 'relevanceDrawer',
  state: {
    orderList: [],
    deliveryList: [],
    receiveList: [],
    reconciliationList: [],
    returnEntryList: [],
  },

  effects: {
    *fetchData({ payload }, { call, put }) {
      const res = yield call(fetchData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderList: response.orderEntryVOS || [],
            deliveryList: response.consignmentEntryList || [],
            receiveList: response.receiptEntryList || [],
            reconciliationList: response.statementsEntryList || [],
            returnEntryList: response.returnEntryList || [],
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
