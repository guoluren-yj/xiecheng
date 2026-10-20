/*
 * @Date: 2019-09-16 19:51:38
 * @Author: 24517-黄锦
 * @LastEditors: 24517-黄锦
 * @LastEditTime: 2019-09-17 09:47:35
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  deleteData,
  queryData,
  // queryValueListModalData,
  queryVendorModalData,
  saveData,
} from '../../services/roleDataAuthorityService';

export default {
  namespace: 'roleDataAuthorityVendor',

  state: {
    head: {}, // 头部数据
    list: [], // 请求查询到的数据
    pagination: {}, // 分页信息
    vendorDataSource: [],
    vendorPagination: {},
  },
  effects: {
    *fetchAuthorityVendor({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            head: data.roleAuthData,
            list: data.roleAuthDataLineList.content,
            pagination: createPagination(data.roleAuthDataLineList),
          },
        });
      }
    },
    *addAuthorityVendor({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityVendor({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryVendorModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            vendorDataSource: data.content,
            vendorPagination: createPagination(data),
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
