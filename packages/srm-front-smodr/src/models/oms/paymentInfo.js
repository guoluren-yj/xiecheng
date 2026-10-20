import { getResponse, createPagination } from 'utils/utils';
import {
  fetchPayList,
  fetchOrderPayList,
  fetchOrderFreList,
  fetchRefundList,
  fetchRefundProList,
  fetchRefundFreList,
  fetchOrderPayment,
} from '@/services/oms/paymentInfoService';

export default {
  namespace: 'paymentInfo',
  state: {
    payList: [],
    orderPayList: [],
    orderPayListPagination: {},
    orderFreList: [],
    orderFreListPagination: {},
    refundList: [],
    refundProList: [],
    refundProListPagination: {},
    refundFreList: [],
    refundFreListPagination: {},
    orderPayment: [],
    orderPaymentPagination: {},
  },
  effects: {
    *fetchPayList({ payload }, { call, put }) {
      const res = yield call(fetchPayList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            payList: response.content || [],
          },
        });
      }
    },
    *fetchOrderPayList({ payload }, { call, put }) {
      const res = yield call(fetchOrderPayList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderPayList: response.content || [],
            orderPayListPagination: createPagination(response),
          },
        });
      }
    },
    *fetchOrderFreList({ payload }, { call, put }) {
      const res = yield call(fetchOrderFreList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderFreList: response.content || [],
            orderFreListPagination: createPagination(response),
          },
        });
      }
    },
    *fetchRefundList({ payload }, { call, put }) {
      const res = yield call(fetchRefundList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            refundList: response.content || [],
          },
        });
      }
    },
    *fetchRefundProList({ payload }, { call, put }) {
      const res = yield call(fetchRefundProList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            refundProList: response.content || [],
            refundProListPagination: createPagination(response),
          },
        });
      }
    },
    *fetchRefundFreList({ payload }, { call, put }) {
      const res = yield call(fetchRefundFreList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            refundFreList: response.content || [],
            refundFreListPagination: createPagination(response),
          },
        });
      }
    },
    *fetchOrderPayment({ payload }, { call, put }) {
      const res = yield call(fetchOrderPayment, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            orderPayment: response.content || [],
            orderPaymentPagination: createPagination(response),
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
