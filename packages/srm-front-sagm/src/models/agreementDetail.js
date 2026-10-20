import { getResponse } from 'utils/utils';

import {
  fetchBatchCodes,
  fetcthProtocolData,
  fetcthProtocolLineData,
  fetchExitProductList,
} from '@/services/mallProtocolManagementService';

export default {
  namespace: 'agreementDetail',
  state: {},

  effects: {
    // 批量获取值集
    *fetchBatchCodes(_, { call }) {
      const res = yield call(fetchBatchCodes, {
        agreementPricingMethods: 'SMAL.AGREEMENT_PRICING_METHOD',
        agreementPricingTypes: 'SMAL.AGREEMENT_PRICING_TYPE',
      });
      const response = getResponse(res);
      return response;
    },
    // 明细头
    *fetchBaseInfo({ payload }, { call }) {
      const res = yield call(fetcthProtocolData, payload);
      const response = getResponse(res);
      return response;
    },
    // 明细行查询
    *fetchLines({ payload }, { call }) {
      const res = yield call(fetcthProtocolLineData, payload);
      const response = getResponse(res);
      return response;
    },
    // 明细行商品查询
    *fetchLineProduct({ payload }, { call }) {
      const res = yield call(fetchExitProductList, payload);
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
