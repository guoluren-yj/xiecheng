/**
 * productSearch - 产品查询 - modal
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchProductSearch } from '@/services/productSearchService';

export default {
  namespace: 'productSearch',
  state: {
    /**
     * 产品使用详情数据
     */
    data: [],
    /**
     * 产品使用详情分页数据
     */
    pagination: {},
  },
  effects: {
    // 查询产品使用详情
    *fetchProductSearch({ payload }, { call, put }) {
      const response = yield call(fetchProductSearch, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: data.content,
            pagination: createPagination(data),
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
