/*
 * @Date: 2019-09-17 09:20:41
 * @Author: 24517-黄锦
 * @LastEditors: 24517-黄锦
 * @LastEditTime: 2019-09-19 16:30:11
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  deleteData,
  queryData,
  saveData,
  queryPurchaseItemModalData,
} from '../../services/roleDataAuthorityService';

export default {
  namespace: 'roleDataAuthorityPurItem',

  state: {
    head: {},
    list: [],
    pagination: {},
    purItemDataSource: [],
    purItemPagination: {},
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            head: data.roleAuthData,
            list: data.roleAuthDataLineList.content,
            pagination: createPagination(data.userAuthorityLineList),
          },
        });
      }
    },
    *add({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *delete({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryPurchaseItemModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            purItemDataSource: data.content,
            purItemPagination: createPagination(data),
          },
        });
      }
    },
  },
  reducers: {
    queryauthorityPurItem(state, action) {
      return {
        ...state,
        data: {
          list: action.payload.roleAuthDataLineList.content,
          ...action.payload.roleAuthDataLineList,
        },
        head: action.payload.roleAuthData,
      };
    },
    addNewData(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size + 1 : state.data.size,
          totalElements: state.data.totalElements + 1,
        },
      };
    },
    removeNewAdd(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size - 1 : state.data.size,
          totalElements: state.data.totalElements - 1,
        },
      };
    },
    editRow(state, action) {
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload.data,
        },
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
