/**
 * goodsPreview - 商品预览
 * @date: 2019年3月15日 16:24:21
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { fetchProductDetail } from '@/services/goodsPreviewService';

export default {
  namespace: 'goodsPreview',
  state: {
    productData: {},
  },
  effects: {
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
