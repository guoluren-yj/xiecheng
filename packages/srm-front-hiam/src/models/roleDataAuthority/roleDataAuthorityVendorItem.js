/*
 * @Date: 2019-09-17 10:17:00
 * @Author: 24517-黄锦
 * @LastEditors: 24517-黄锦
 * @LastEditTime: 2019-09-17 20:21:30
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  deleteData,
  queryData,
  // queryValueListModalData,
  queryVendorItemModalData,
  saveData,
} from '../../services/roleDataAuthorityService';

export default {
  namespace: 'roleDataAuthorityVendorItem',

  state: {
    head: {},
    data: {
      list: [],
    },
    pagination: {}, // 分页信息
    vendorItemDataSource: [],
    vendorItemPagination: {},
  },
  effects: {
    *fetchAuthorityVendorItem({ payload }, { call, put }) {
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
    *addAuthorityVendorItem({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityVendorItem({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryVendorItemModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            vendorItemDataSource: data.content,
            vendorItemPagination: createPagination(data),
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
