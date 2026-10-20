/**
 * modifyDirectory - 查询目录 - medal
 * @date: 2019-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchGoodsCateLogs } from '@/services/goodsMaitainService';

export default {
  namespace: 'modifyDirectory',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 用于查询商品三级目录(用于主页目录修改)
    *fetchGoodsCateLogs({ payload }, { call, put }) {
      const response = yield call(fetchGoodsCateLogs, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
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
