import { getResponse, createPagination } from 'utils/utils';

import {
  fetchDelete,
  fetchApproveList,
  fetchHandleOk,
  fetchCategory,
  fetchselectedCategory,
} from '@/services/product/approveRuleService';

export default {
  namespace: 'productApproveRule',
  state: {
    productAuditList: [],
    attrList: [], // 属性列表
    pagination: {}, // 分页
  },

  effects: {
    // 列表查询
    *fetchApproveList({ payload }, { call, put }) {
      const res = yield call(fetchApproveList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            productAuditList: res.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *fetchselectedCategory({ payload }, { call }) {
      const res = yield call(fetchselectedCategory, payload);
      return getResponse(res);
    },

    // 分类查询
    *fetchCategory(_, { call }) {
      return getResponse(yield call(fetchCategory));
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
