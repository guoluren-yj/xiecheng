/**
 * goodsPreview - 商品预览
 * @date: 2019年3月15日 16:24:21
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchDetail,
  fetchProductDetail,
  fetchProductPlatFormCode,
  fetchGroupProductDetail,
} from '@/services/goodsPreviewService';

export default {
  namespace: 'goodsPreview',
  state: {
    productData: {},
  },
  effects: {
    *fetchProductPlatFormCode({ payload }, { call }) {
      // 根据来源查询paltformCode
      const response = yield call(fetchProductPlatFormCode, payload);
      if (response) {
        if (response.includes('failed')) {
          getResponse(JSON.parse(response));
          return false;
        }
        return response;
      }
    },
    // goodsPreview的查询商品详情接口
    *fetchProductDetail({ payload }, { call, put }) {
      const response = yield call(fetchProductDetail, payload);
      const productData = getResponse(response);
      if (productData) {
        yield put({
          type: 'updateState',
          payload: {
            productData,
          },
        });
        return productData;
      }
    },

    // commonPreview的查询商品详情接口
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(fetchDetail, payload);
      const productData = getResponse(response);
      if (productData) {
        yield put({
          type: 'updateState',
          payload: {
            productData,
          },
        });
        return productData;
      }
    },

    *fetchGroupProductDetail({ payload }, { call, put }) {
      const response = yield call(fetchGroupProductDetail, payload);
      const productData = getResponse(response);
      if (productData) {
        yield put({
          type: 'updateState',
          payload: { productData },
        });
        return productData;
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
