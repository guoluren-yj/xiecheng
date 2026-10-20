/**
 * LedgerAccount  客户配置表
 * @date: 2020-07-17
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2020, Hand
 */

import { fetchList, fetchSave, fetchSync } from '@/services/customerConfigurationService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'customerConfiguration',
  state: {
    content: [], // 数据列表
    pagination: {}, // 分页参数
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            content: result.content,
            pagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchSave({ payload }, { call }) {
      const result = yield call(fetchSave, payload);
      return getResponse(result);
    },
    *fetchSync({ payload }, { call }) {
      const result = yield call(fetchSync, payload);
      return getResponse(result);
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
