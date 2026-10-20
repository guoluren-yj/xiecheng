import { getResponse, createPagination } from 'utils/utils';

import {
  fetchEnable,
  fetchNewPwd,
  fetchHandleOk,
  fetchAuthorizateList,
  fetchWhiteList,
  fetchBlackList,
  deleteAdjust,
  saveWhiteList,
} from '@/services/ecommerceAuthorizateService';

export default {
  namespace: 'ecommerceAuthorization',
  state: {
    list: [], // 授权列表
    pagination: {}, // 授权分页
    whiteList: [], // 白名单列表
    whitePagination: {}, // 白名单分页
    blackList: [], // 白名单列表
    blackPagination: {}, // 白名单分页
  },

  effects: {
    // 列表查询
    *fetchAuthorizateList({ payload }, { call, put }) {
      const res = yield call(fetchAuthorizateList, payload);
      const result = getResponse(res.result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
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
    // 启用/禁用
    *fetchEnable({ payload }, { call }) {
      const res = yield call(fetchEnable, payload);
      const result = getResponse(res);
      return result;
    },
    // 修改密码
    *fetchNewPwd({ payload }, { call }) {
      const res = yield call(fetchNewPwd, payload);
      const result = getResponse(res);
      return result;
    },
    // 白名单查询
    *fetchWhiteList({ payload }, { call, put }) {
      const res = yield call(fetchWhiteList, payload);
      const result = getResponse(res.result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            whiteList: result.content,
            whitePagination: createPagination(result),
          },
        });
      }
    },
    // 黑名单查询
    *fetchBlackList({ payload }, { call, put }) {
      const res = yield call(fetchBlackList, payload);
      const result = getResponse(res.result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            blackList: result.content,
            blackPagination: createPagination(result),
          },
        });
      }
    },
    *deleteAdjust({ payload }, { call }) {
      const res = yield call(deleteAdjust, payload);
      const result = getResponse(res);
      return result;
    },
    *saveWhiteList({ payload }, { call }) {
      const res = yield call(saveWhiteList, payload);
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
