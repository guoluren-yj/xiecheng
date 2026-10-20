/**
 * sourcing - 寻源结果查询 - medal
 * @date: 2019-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchSourcingList } from '@/services/goodsMaitainService';

export default {
  namespace: 'sourcing',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 获取寻源列表,目录化上传(引用寻源)
    *fetchSourcingList({ payload }, { call, put }) {
      const response = yield call(fetchSourcingList, payload);
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
