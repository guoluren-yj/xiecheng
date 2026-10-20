import { getResponse, createPagination } from 'utils/utils';
import {
  fetchFreightLine,
  fetchExtensionHeader,
  fetchExtensionLine,
  fetchBatchCodes,
  fetchCompany,
  fetchPreemptInfo,
  fetchConsignInfo,
  fetchReceiptInfo,
  fetchStatementsInfo,
  fetchApproveInfo,
  fetchProducts,
  fetchCancelInfo,
} from '@/services/oms/freightLineManageService';
import { fetchHistory } from '@/services/oms/historyService';
import { fetchMethod } from '@/services/oms/deliveryOrderService';
import { fetchPurchaseCompany } from '@/services/oms/paymentRecordService';

export default {
  namespace: 'freightLineManage',
  state: {
    orderTypes: [],
    companyList: [],
    freightTypes: [],
    freightLineData: [],
    freightLinePagination: {},
    extensionData: {},
    extensionHeaderData: {},
    extensionInfoData: [],
    productList: [],
    productPagination: {},
    historyList: [],
    historyListPagination: {},
    methodList: [],
    purchaseCompanyList: [],
  },
  effects: {
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

    // 批量获取值集
    *fetchBatchCodes(_, { call, put }) {
      const res = yield call(fetchBatchCodes, {
        freightTypes: 'S2FUL.FREIGHT_TYPE',
        orderTypes: 'S2FUL.ORDER_TYPE',
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

    // 运费行信息查询
    *fetchFreightLine({ payload }, { call, put }) {
      const res = yield call(fetchFreightLine, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            freightLineData: response.content || [],
            freightLinePagination: createPagination(response),
          },
        });
      }
    },

    // 运费行预占信息拓展
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

    // 运费行配送信息拓展
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

    // 运费行接收信息拓展
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

    // 运费行对账信息拓展
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

    // 运费行审批信息拓展
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

    // 运费行拓展信息
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

    // 运费行取消拓展信息
    *fetchCancelInfo({ payload }, { call, put }) {
      const res = yield call(fetchCancelInfo, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            extensionInfoData: response || {},
          },
        });
      }
    },

    // 运费头信息查询
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
    },
    // 查找商品列表
    *fetchProducts({ payload }, { call, put }) {
      const res = yield call(fetchProducts, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            productList: response.content || [],
            productPagination: createPagination(response),
          },
        });
      }
    },
    // 订单头操作记录
    *fetchHistory({ payload }, { call, put }) {
      const res = yield call(fetchHistory, payload);
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
