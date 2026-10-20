import { getResponse, createPagination } from 'utils/utils';
import {
  fetchOrderLine,
  fetchExtensionLine,
  fetchExtensionHeader,
  fetchCompany,
  fetchPreemptInfo,
  fetchConsignInfo,
  fetchReceiptInfo,
  fetchStatementsInfo,
  fetchApproveInfo,
  fetchAfterSaleInfo,
  fetchCancelInfo,
  fetchWFPExtensionHeader,
} from '@/services/oms/orderLineManageService';
import { fetchPurchaseCompany } from '@/services/oms/paymentRecordService';

import { fetchHistory, fetchSaleHistory } from '@/services/oms/historyService';

export default {
  namespace: 'orderLineManage',
  state: {
    productTypes: [],
    orderTypes: [],
    preemptTypes: [],
    approvalTypes: [],
    consignmentTypes: [],
    receiveTypes: [],
    afterSaleTypes: [],
    statementsTypes: [],
    orderLineData: [],
    orderLinePagination: {},
    extensionData: {},
    extensionHeaderData: {},
    extensionInfoData: [],
    companyList: [],
    historyList: [],
    historyListPagination: {},
    purchaseCompanyList: [],
  },
  effects: {
    // 批量获取值集
    // *fetchBatchCodes(_, { call, put }) {
    //   const res = yield call(fetchBatchCodes, {
    //     productTypes: 'S2FUL.SKU_TYPE',
    //     orderTypes: 'S2FUL.ORDER_TYPE',
    //     preemptTypes: 'S2FUL.SHOW_PREEMPT_STATUS',
    //     approvalTypes: 'S2FUL.APPROVAL_STATUS',
    //     consignmentTypes: 'S2FUL.CONSIGNMENT_STATUS',
    //     receiveTypes: 'S2FUL.RECEIVE_STATUS',
    //     afterSaleTypes: 'S2FUL.OMS_AFTER_SALE_STATUS',
    //     statementsTypes: 'S2FUL.STATEMENTS_STATUS',
    //   });
    //   const response = getResponse(res);
    //   if (response) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         ...response,
    //       },
    //     });
    //   }
    // },

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

    // 订单行信息查询
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
    // 订单行拓展信息
    *fetchExtensionLine({ payload }, { call, put }) {
      const res = yield call(fetchExtensionLine, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionData: response || {},
          },
        });
      }
    },
    // 订单行预占信息拓展
    *fetchPreemptInfo({ payload }, { call, put }) {
      const res = yield call(fetchPreemptInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单行配送信息拓展
    *fetchConsignInfo({ payload }, { call, put }) {
      const res = yield call(fetchConsignInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单行接收信息拓展
    *fetchReceiptInfo({ payload }, { call, put }) {
      const res = yield call(fetchReceiptInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单行对账信息拓展
    *fetchStatementsInfo({ payload }, { call, put }) {
      const res = yield call(fetchStatementsInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单行审批信息拓展
    *fetchApproveInfo({ payload }, { call, put }) {
      const res = yield call(fetchApproveInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单行取消信息拓展
    *fetchCancelInfo({ payload }, { call, put }) {
      const res = yield call(fetchCancelInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单售后信息拓展
    *fetchAfterSaleInfo({ payload }, { call, put }) {
      const res = yield call(fetchAfterSaleInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || [],
          },
        });
      }
    },

    // 订单头拓展信息
    *fetchExtensionHeader({ payload }, { call, put }) {
      const res = yield call(fetchExtensionHeader, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionHeaderData: response || {},
          },
        });
      }
      return response;
    },

    // 订单头拓展信息
    *fetchWFPExtensionHeader({ payload }, { call, put }) {
      const res = yield call(fetchWFPExtensionHeader, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionHeaderData: response || {},
          },
        });
      }
      return response;
    },

    // 订单头操作记录
    *fetchHistory({ payload }, { call, put }) {
      let res = {};
      if (payload.operationType !== 'AFTER') {
        res = yield call(fetchHistory, payload);
      } else {
        res = yield call(fetchSaleHistory, payload);
      }
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
