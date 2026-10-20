import { getResponse, createPagination } from 'utils/utils';
import { fetchBatchCodes, fetchCompany } from '@/services/oms/orderLineManageService';
import {
  fetchInvoiceRecord,
  fetchInvoicePro,
  fetchInvoiceHeader,
} from '@/services/oms/invoiceRecordService';

import { fetchInvoHistory } from '@/services/oms/historyService';
import { fetchPurchaseCompany } from '@/services/oms/paymentRecordService';

export default {
  namespace: 'invoiceRecord',
  state: {
    companyList: [],
    invoiceStatus: [],
    invoiceTypes: [],
    invoiceData: [],
    invoiceDataPagination: {},
    productInvoices: [],
    freightInvoices: [],
    extensionHeaderData: [],
    historyList: [],
    historyListPagination: {},
    purchaseCompanyList: [],
  },

  effects: {
    // 批量获取值集
    *fetchBatchCodes(_, { call, put }) {
      const res = yield call(fetchBatchCodes, {
        invoiceTypes: 'S2FUL.INVOICE_TYPE',
        invoiceStatus: 'S2FUL.VALIDITY_CODE',
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
    *fetchInvoiceRecord({ payload }, { call, put }) {
      const res = yield call(fetchInvoiceRecord, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceData: response.content || [],
            invoiceDataPagination: createPagination(response),
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

    *fetchInvoiceHeader({ payload }, { call, put }) {
      const res = yield call(fetchInvoiceHeader, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionHeaderData: [response] || [],
          },
        });
      }
    },
    *fetchInvoicePro({ payload }, { call, put }) {
      const res = yield call(fetchInvoicePro, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            freightInvoices: response.freightInvoices,
            productInvoices: response.productInvoices,
          },
        });
      }
    },

    *fetchHistory({ payload }, { call, put }) {
      const res = yield call(fetchInvoHistory, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: response.content || [],
            historyListPagination: createPagination(response),
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
