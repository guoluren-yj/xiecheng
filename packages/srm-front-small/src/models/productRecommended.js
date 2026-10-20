import { getResponse } from 'utils/utils';
import { getStoragePurchase } from '@/utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchTypeTree, fetchProduct } from '@/services/productRecommendedService';

const { role = 'purchase', purchase = {} } = getStoragePurchase() || {};
export default {
  namespace: 'productRecommended',
  state: {
    currentRole: role,
    purchase,
    lovBatch: {},
    cataTreeList: [],
  },
  effects: {
    *initQueryIdp(_, { call, put }) {
      const lovBatchRes = yield call(queryMapIdpValue, {
        belongType: 'SMAL.PRODUCT_GROUP_BELONG_TYPE',
        groupAttribute: 'SMAL.PRODUCT_GROUP_ATTRIBUTE',
        groupType: 'SMAL.PRODUCT_GROUP_TYPE',
        enabledFlag: 'SMAL.PRODUCT_GROUP_ENABLED_FLAG',
        includeNoStockFlag: 'SMAL.PRODUCT_GROUP_INCLUDE_NO_STOCK_FLAG',
        orderType: 'SMAL.PRODUCT_GROUP_ORDER_TYPE',
        tagFlag: 'SMAL.PRODUCT_GROUP_TAG_FLAG',
        tagStyle: 'SMAL.PRODUCT_GROUP_TAG_STYLE',
        sourceType: 'SMAL.PRODUCT_SOURCE_FROM',
      });
      const lovBatch = getResponse(lovBatchRes);
      if (lovBatch) {
        yield put({
          type: 'updateState',
          payload: {
            lovBatch,
          },
        });
      }
    },
    *fetchTypeTree({ payload }, { call, put }) {
      const typeTree = yield call(fetchTypeTree, payload);
      const result = getResponse(typeTree);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            cataTreeList: result,
          },
        });
      }
    },
    *fetchProduct({ payload }, { call }) {
      const response = yield call(fetchProduct, payload);
      return getResponse(response || {});
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
