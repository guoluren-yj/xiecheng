import { getResponse, createPagination } from 'utils/utils';
import { fetchOrderLine } from '@/services/oms/orderLineManageService';
import { fetchFreightLine } from '@/services/oms/freightLineManageService';

export default {
  namespace: 'orderDetail',
  state: {
    orderLineData: [],
    orderLinePagination: {},
    feightLineData: [],
    feightLinePagination: {},
  },
  effects: {
    *fetchOrderLine({ payload }, { call, put }) {
      const res = yield call(fetchOrderLine, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderLineData: response.content || [],
            orderLinePagination: createPagination(response),
          },
        });
      }
    },
    *fetchFeightLine({ payload }, { call, put }) {
      const res = yield call(fetchFreightLine, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            feightLineData: response.content || [],
            feightLinePagination: createPagination(response),
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
