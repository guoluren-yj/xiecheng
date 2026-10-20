import { getResponse, createPagination } from 'utils/utils';

import { fetchDelete, fetchTransacteList, fetchHandleOk } from '@/services/transacteMoniteService';

export default {
  namespace: 'transacteMonite',
  state: {
    attrList: [], // 属性列表
    pagination: {}, // 分页
  },

  effects: {
    // 列表查询
    *fetchTransacteList({ payload }, { call, put }) {
      const res = yield call(fetchTransacteList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            attrList: res.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 确定保存
    *fetchHandleOk({ payload }, { call }) {
      const res = yield call(fetchHandleOk, payload);
      const result = getResponse(res);
      return result;
    },
    // 删除
    *fetchDelete({ payload }, { call }) {
      const res = yield call(fetchDelete, payload);
      const result = getResponse(res);
      return result;
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
