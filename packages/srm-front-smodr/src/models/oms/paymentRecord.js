import { getResponse, createPagination } from 'utils/utils';
import { fetchBatchCodes, fetchCompany } from '@/services/oms/orderLineManageService';
import {
  fetchPaymentRecord,
  fetchPaymentHead,
  fetchPaymentPro,
  fetchPurchaseCompany,
  quickPay,
  fetchCallbackInfo,
} from '@/services/oms/paymentRecordService';

import { fetchPayHistory } from '@/services/oms/historyService';

export default {
  namespace: 'paymentRecord',
  state: {
    companyList: [],
    purchaseCompanyList: [],
    paymentTypes: [],
    paymentStatus: [],
    paymentData: [],
    paymentDataPagination: {},
    extensionHeaderData: {},
    freightPayments: [],
    productPayments: [],
    historyList: [],
    historyListPagination: {},
  },

  effects: {
    // 批量获取值集
    *fetchBatchCodes(_, { call, put }) {
      const res = yield call(fetchBatchCodes, {
        paymentTypes: 'S2FUL.PAYMENT_TYPE',
        paymentStatus: 'S2FUL.PAYMENT_STATUS',
      });
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ...response,
          },
        });
      }
    },
    *fetchPaymentRecord({ payload }, { call, put }) {
      const res = yield call(fetchPaymentRecord, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            paymentData: response.content || [],
            paymentDataPagination: createPagination(response),
          },
        });
      }
    },
    *fetchCompany(_, { call, put }) {
      const res = yield call(fetchCompany);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            companyList: response.content || [],
          },
        });
      }
    },
    *fetchPurchaseCompany(_, { call, put }) {
      const res = yield call(fetchPurchaseCompany);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseCompanyList: response.content || [],
          },
        });
      }
    },

    *fetchPaymentHead({ payload }, { call, put }) {
      const res = yield call(fetchPaymentHead, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionHeaderData: response,
          },
        });
      }
    },
    *fetchPaymentPro({ payload }, { call, put }) {
      const res = yield call(fetchPaymentPro, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            freightPayments: response.freightPayments,
            productPayments: response.productPayments,
          },
        });
      }
    },
    *fetchHistory({ payload }, { call, put }) {
      const res = yield call(fetchPayHistory, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: response.content,
            historyListPagination: createPagination(response),
          },
        });
      }
    },
    *quickPay({ payload }, { call }) {
      const res = yield call(quickPay, payload);
      const result = getResponse(res);
      return result;
    },
    *fetchCallbackInfo({ payload }, { call }) {
      const res = yield call(fetchCallbackInfo, payload);
      const result = getResponse(res);
      return result;
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
