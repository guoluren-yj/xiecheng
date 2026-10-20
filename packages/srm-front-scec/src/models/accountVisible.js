/**
 * AccountVisible - 账号目录可见配置 - model层
 * @date: 2019-12-12
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCompanyId,
  fetchAccountList,
  saveAccountList,
  updateAccountList,
  fetchCatalogList,
  updateCatalogList,
  fetchAssignList,
  saveAssignList,
  updateAssignList,
  deleteAssignList,
} from '@/services/accountVisibleServices';

export default {
  namespace: 'accountVisible',
  state: {
    currentCompany: [],
    accountList: [],
    accountListPagination: {},
    assignList: [],
    assignListPagination: [],
    catalogList: [],
    rowKeys: [],
    catalogListPagination: {},
  },
  effects: {
    *fetchEcCompany(_, { call, put }) {
      const res = yield call(fetchEcCompanyId);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompany: result.content,
          },
        });
      }
      return result;
    },
    *fetchAccountList({ payload }, { call, put }) {
      const res = yield call(fetchAccountList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            accountList: result.content,
            accountListPagination: createPagination(result),
          },
        });
      }
    },
    *saveAccountList({ payload }, { call }) {
      const res = yield call(saveAccountList, { ...payload });
      return getResponse(res);
    },
    *updateAccountList({ payload }, { call }) {
      const res = yield call(updateAccountList, { ...payload });
      return getResponse(res);
    },
    *fetchCatalogList({ payload }, { call, put }) {
      const res = yield call(fetchCatalogList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            catalogList: result.content || [],
            catalogListPagination: createPagination(result),
          },
        });
      }
    },
    *updateCatalogList({ payload }, { call }) {
      const res = yield call(updateCatalogList, { ...payload });
      return getResponse(res);
    },
    *fetchAssignList({ payload }, { call, put }) {
      const res = yield call(fetchAssignList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            assignList: result.content,
            assignListPagination: createPagination(result),
          },
        });
      }
    },
    *saveAssignList({ payload }, { call }) {
      const res = yield call(saveAssignList, payload);
      return getResponse(res);
    },
    *updateAssignList({ payload }, { call }) {
      const res = yield call(updateAssignList, payload);
      return getResponse(res);
    },
    *deleteAssignList({ payload }, { call }) {
      const res = yield call(deleteAssignList, payload);
      return getResponse(res);
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
