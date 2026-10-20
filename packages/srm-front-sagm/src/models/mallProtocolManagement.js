import { getResponse, createPagination, addItemsToPagination } from 'utils/utils';

import intl from 'utils/intl';

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
  fetchHistory,
  queryCompany,
  queryAllCity,
  fetchUnitList,
  delCompany,
  delRegion,
  terminateAgreement,
  fetchGroupCatalog,
  changeAgreement,
  fetchHistoryVerData,
  fetchHistoryVerLines,
  fetchHisVerLineProduct,
  deleteFreightLine,
  fetchFreight,
  addFreight,
  handleFreight,
  fetchPlatformCategory,
  validateItemPrice,
} from '@/services/mallProtocolManagementService';
import { changeProduct, fetcthProductDetail } from '@/services/mallReceivedAgreementService';
import { queryUUID } from 'hzero-front/lib/services/api';
import { fetchSkuIntroTemplate } from '@/services/api';

export default {
  namespace: 'mallProtocolManagement',
  state: {
    protocolHead: [],
    headPagination: {},
    agreementTypes: [],
    quoteData: [],
    quotePagination: {},

    initData: {}, // 新建协议头信息
    lineData: [], // 新建协议行信息

    flags: [],
    effectiveCodes: [],
    statusCodes: [],
    materialTypes: [],
    paymentTypes: [],
    agreementFroms: [],
    agreementStatus: [],
    agreementFreightTypes: [],
    agreementPricingMethods: [],
    agreementPricingTypes: [],
    protocolLine: [],
    agreementPriceType: [],
    linePagination: {},
    historyList: [],
    historyPagination: {},
    companyList: [],
    unitList: [],
    protocolLinePagination: {},
    productTemplate: [],
    skuRefList: [],

    historyVersionList: [],
    historyVersionPagination: {},

    freightList: [],
    freightListPagination: {},

    postage: [],

    productDetailList: [],
    productDetailPagination: {},

    tabKey: 'a', // 协议明细离开时的tab
  },
  effects: {
    *terminateAgreement({ payload }, { call }) {
      const res = yield call(terminateAgreement, payload);
      const response = getResponse(res);
      return response;
    },
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
    // 获取上传图片的uuid
    *getAttachmentUUId({ payload }, { call, put, select }) {
      const initData = yield select(
        ({ mallProtocolManagement }) => mallProtocolManagement.initData
      );
      const res = getResponse(yield call(queryUUID, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            initData: { ...initData, uuid: res.content },
          },
        });
      }
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

    // 删除公司
    *deleteCompany({ payload }, { call }) {
      const res = yield call(delCompany, payload);
      const response = getResponse(res);
      return response;
    },

    // 删除头信息
    *deleteRegion({ payload }, { call }) {
      const res = yield call(delRegion, payload);
      const response = getResponse(res);
      return response;
    },

    // 提交
    *submitAgreement({ payload }, { call }) {
      const res = yield call(submitAgreement, payload);
      const response = getResponse(res);
      return response;
    },

    // 批量提交
    *bacthSubmitAgreement({ payload }, { call }) {
      const res = yield call(submitAgreement, payload);
      const response = getResponse(res);
      return response;
    },

    *validateItemPrice({ payload }, { call }) {
      const res = yield call(validateItemPrice, payload);
      const response = getResponse(res);
      return response;
    },

    // 查询单个协议
    *queryAgreement({ payload }, { call, put }) {
      const res = yield call(fetcthProtocolData, payload);
      const response = getResponse(res);
      if (response) {
        const { content = [] } = response;
        yield put({
          type: 'updateState',
          payload: {
            initData: content[0] || {},
          },
        });
      }
      return response;
    },

    // 保存
    *saveAgreement({ payload }, { call }) {
      const res = yield call(saveAgreement, payload);
      const response = getResponse(res);
      return response;
    },

    // 查询头行信息
    *fetcthProtocolLineData({ payload }, { call, put }) {
      const res = yield call(fetcthProtocolLineData, payload);
      const response = getResponse(res);
      const { content = [] } = response;
      const newData = content && content.map((item) => ({ ...item, _status: 'update' }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            protocolLine: newData,
            protocolLinePagination: createPagination(response),
          },
        });
      }
    },

    // 查询行信息
    *fetchDetailLine({ payload }, { call, put }) {
      const { createLines = [], ...other } = payload;
      const res = yield call(fetcthProtocolLineData, other);
      const response = getResponse(res);
      const { content = [] } = response;
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            lineData: [...createLines, ...content],
            linePagination: addItemsToPagination(
              createLines.length,
              content.length,
              createPagination(response)
            ),
          },
        });
      }
      return response;
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
              agreementStatus: response,
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
        } else if (lovCode === 'SMAL.SKU_REF_TYPE') {
          yield put({
            type: 'updateState',
            payload: {
              skuRefList: response,
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
      return result;
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
        agreementFreightTypes: 'SMAL.AGREEMENT_FREIGHT_TYPE',
        agreementPricingMethods: 'SMAL.AGREEMENT_PRICING_METHOD',
        agreementPricingTypes: 'SMAL.AGREEMENT_PRICING_TYPE',
        flags: 'HPFM.FLAG',
        effectiveCodes: 'SAGM.PRICE_LIB_MATHC_STATUS',
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
      return response;
    },

    *fetchHistoryRecord({ payload }, { call, put }) {
      const res = yield call(fetchHistory, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: result.content || [],
            historyPagination: createPagination(result),
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

    *queryCompany(_, { call, put }) {
      const res = yield call(queryCompany);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            companyList: result,
          },
        });
      }
    },

    *fetchUnitList(_, { call, put }) {
      const res = yield call(fetchUnitList);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: { unitList: result },
        });
      }
      return result;
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
    *queryAllCity({ payload }, { call, put }) {
      const res = yield call(queryAllCity, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            allCity: [
              {
                regionName: intl.get('small.common.model.allAreas').d('所有区域'),
                regionId: 'ALL',
              },
              ...result,
            ],
          },
        });
      }
    },
    // 根据所选物料带出目录
    *fetchGroupCatalog({ payload }, { call }) {
      const res = yield call(fetchGroupCatalog, payload);
      const response = getResponse(res);
      return response;
    },
    // 协议变更
    *changeAgreement({ payload }, { call }) {
      const res = yield call(changeAgreement, payload);
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
    // 运费规则头查询
    *deleteFreightLine({ payload }, { call }) {
      const res = yield call(deleteFreightLine, payload);
      const response = getResponse(res);
      return response;
    },
    // 运费规则查询
    *fetchFreight({ payload }, { call, put }) {
      const res = yield call(fetchFreight, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            freightList: response.content || [],
            freightListPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 运费规则新增
    *addFreight({ payload }, { call, put }) {
      const res = yield call(addFreight, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            postage: response || [],
          },
        });
      }
      return response;
    },

    // 运费启用/禁用
    *handleFreight({ payload }, { call }) {
      const res = yield call(handleFreight, payload);
      const response = getResponse(res);
      return response;
    },

    // 根据协议行查询平台分类
    *fetchPlatformCategory({ payload }, { call }) {
      const res = yield call(fetchPlatformCategory, payload);
      const response = getResponse(res);
      return response;
    },

    *changeProduct({ payload }, { call }) {
      const res = yield call(changeProduct, payload);
      const response = getResponse(res);
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
