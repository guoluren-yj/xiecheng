import { getResponse, createPagination } from 'utils/utils';

import {
  fetchCodes,
  fetchBatchCodes,
  fetchQuoteData,
  fetcthProtocolData,
  fetcthProtocolLineData,
  saveAgreement,
  submitAgreement,
  createProduct,
  fetchExitProductList,
  fetchNoExitProductList,
  lineAddProduct,
  lineDeleteProduct,
  deleteHeadData,
  delLineData,
  fetcthProductDetail,
  changeProduct,
  batchStockQuantity,
  fetchHistoryVerData,
  fetchHistoryVerLines,
  fetchHisVerLineProduct,
} from '@/services/mallReceivedAgreementService';
import { fetchPlatformCategory } from '@/services/mallProtocolManagementService';
import { fetchSkuIntroTemplate } from '@/services/api';

export default {
  namespace: 'mallReceivedAgreement',
  state: {
    protocolHead: [],
    headPagination: {},
    agreementTypes: [],
    quoteData: [],
    quotePagination: {},
    lineData: [],
    statusCodes: [],
    materialTypes: [],
    paymentTypes: [],
    agreementFroms: [],
    agreementStatus: [],
    protocolLine: [],
    agreementPriceType: [],
    protocolLinePagination: {},
    productDetailList: [],
    productDetailPagination: {},
    productTemplate: [],
    noExitProductList: [],
    noExitPagination: {},
    historyVersionList: [],
    historyVersionPagination: {},
  },
  effects: {
    // 商品介绍模板值集
    *fetchTemplate(_, { call, put }) {
      const res = yield call(fetchSkuIntroTemplate);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            productTemplate: response.content || [],
          },
        });
      }
    },

    // 查询头信息
    *fetcthProtocolData({ payload }, { call, put }) {
      const res = yield call(fetcthProtocolData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            protocolHead: response.content || [],
            headPagination: createPagination(response),
          },
        });
      }
      return response;
    },

    *fetcthProductDetail({ payload }, { call, put }) {
      const res = yield call(fetcthProductDetail, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            productDetailList: response.content || [],
            productDetailPagination: createPagination(response),
          },
        });
      }
      return response;
    },

    // 删除头信息
    *deleteHeadData({ payload }, { call }) {
      const res = yield call(deleteHeadData, payload);
      const response = getResponse(res);
      return response;
    },

    // 删除行信息
    *delLineData({ payload }, { call }) {
      const res = yield call(delLineData, payload);
      const response = getResponse(res);
      return response;
    },

    // 提交
    *submitAgreement({ payload }, { call }) {
      const res = yield call(submitAgreement, payload);
      const response = getResponse(res);
      return response;
    },

    // 查询单个协议
    *queryAgreement({ payload }, { call }) {
      const res = yield call(fetcthProtocolData, payload);
      const response = getResponse(res);
      return response;
    },

    // 保存
    *saveAgreement({ payload }, { call }) {
      const res = yield call(saveAgreement, payload);
      const response = getResponse(res);
      return response;
    },

    // 查询行信息
    *fetcthProtocolLineData({ payload }, { call, put }) {
      const res = yield call(fetcthProtocolLineData, payload);
      const response = getResponse(res);
      const { content } = response;
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            protocolLine: content,
            protocolLinePagination: createPagination(response),
          },
        });
      }
    },

    // 查询新建协议类型值集
    *fetcAgreementTypeCode({ payload }, { call, put }) {
      const { lovCode } = payload;
      const res = yield call(fetchCodes, payload);
      const response = getResponse(res);
      if (response) {
        if (lovCode === 'SMAL.PUR_AGREEMENT_TYPE') {
          yield put({
            type: 'updateState',
            payload: {
              agreementTypes: response,
            },
          });
        } else if (lovCode === 'SMAL.MATERIAL_TYPE') {
          yield put({
            type: 'updateState',
            payload: {
              materialTypes: response,
            },
          });
        } else if (lovCode === 'SMAL.PAYMENT_TYPE') {
          yield put({
            type: 'updateState',
            payload: {
              paymentTypes: response,
            },
          });
        } else if (lovCode === 'SMAL.AGREEMENT.STATUS') {
          yield put({
            type: 'updateState',
            payload: {
              agreementStatus: response.filter((n) =>
                ['DISABLED', 'PUBLISHED', 'TERMINATED'].includes(n.value)
              ),
            },
          });
        } else if (lovCode === 'SMAL.AGREEMENT_FROM') {
          yield put({
            type: 'updateState',
            payload: {
              agreementFroms: response,
            },
          });
        } else if (lovCode === 'SMAL.AGREEMENT_PRICE_TYPE') {
          yield put({
            type: 'updateState',
            payload: {
              agreementPriceType: response,
            },
          });
        }
      }
    },
    // 查询价格库数据列表
    *fetchQuoteData({ payload }, { call, put }) {
      const res = yield call(fetchQuoteData, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteData: result.content,
            quotePagination: createPagination(result),
          },
        });
      }
    },
    // 获取状态值集
    *fetchStatusCode({ payload }, { call, put }) {
      const res = yield call(fetchCodes, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            statusCodes: result,
          },
        });
      }
    },
    // 批量获取值集
    *fetchBatchCodes(_, { call, put }) {
      const res = yield call(fetchBatchCodes, {
        agreementTypes: 'SMAL.PUR_AGREEMENT_TYPE',
        materialTypes: 'SMAL.MATERIAL_TYPE',
        paymentTypes: 'SMAL.PAYMENT_TYPE',
        agreementStatus: 'SMAL.AGREEMENT.STATUS',
        agreementFroms: 'SMAL.AGREEMENT_FROM',
        agreementPriceType: 'SMAL.AGREEMENT_PRICE_TYPE',
        flags: 'HPFM.FLAG',
      });
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ...response,
            agreementStatus: (response.agreementStatus || []).filter((n) =>
              ['DISABLED', 'PUBLISHED', 'TERMINATED'].includes(n.value)
            ),
          },
        });
      }
    },

    *createProduct({ payload }, { call }) {
      const res = yield call(createProduct, payload);
      const response = getResponse(res);
      return response;
    },

    *fetchExitProductList({ payload }, { call, put }) {
      const res = yield call(fetchExitProductList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            exitProductList: result.content,
            exitPagination: createPagination(result),
          },
        });
      }
    },

    *fetchNoExitProductList({ payload }, { call, put }) {
      const res = yield call(fetchNoExitProductList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            noExitProductList: result.content,
            noExitPagination: createPagination(result),
          },
        });
      }
    },

    *lineAddProduct({ payload }, { call }) {
      const res = yield call(lineAddProduct, payload);
      const response = getResponse(res);
      return response;
    },

    *lineDeleteProduct({ payload }, { call }) {
      const res = yield call(lineDeleteProduct, payload);
      const response = getResponse(res);
      return response;
    },

    *changeProduct({ payload }, { call }) {
      const res = yield call(changeProduct, payload);
      const response = getResponse(res);
      return response;
    },

    *batchStockQuantity({ payload }, { call }) {
      const res = yield call(batchStockQuantity, payload);
      const response = getResponse(res);
      return response;
    },

    // 根据协议行查询平台分类
    *fetchPlatformCategory({ payload }, { call }) {
      const res = yield call(fetchPlatformCategory, payload);
      const response = getResponse(res);
      return response;
    },
    // 历史版本查询
    *fetcthHistoryData({ payload }, { call, put }) {
      const res = yield call(fetchHistoryVerData, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            historyVersionList: response.content || [],
            historyVersionPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 历史版本明细查询
    *fetcthHistoryDetailsData({ payload }, { call }) {
      const res = yield call(fetchHistoryVerData, payload);
      const response = getResponse(res);
      return response;
    },
    // 历史版本明细行查询
    *fetchHisttoryLines({ payload }, { call }) {
      const res = yield call(fetchHistoryVerLines, payload);
      const response = getResponse(res);
      return response;
    },
    // 历史版本明细行商品查询
    *fetchHisttoryLinesProduct({ payload }, { call }) {
      const res = yield call(fetchHisVerLineProduct, payload);
      const response = getResponse(res);
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
