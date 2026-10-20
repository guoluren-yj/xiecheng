/*
 * @Date: 2019-09-17 09:19:49
 * @Author: 24517-黄锦
 * @LastEditors: 24517-黄锦
 * @LastEditTime: 2019-09-18 11:10:35
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryData,
  saveData,
  deleteData,
  queryCompanyModalData,
} from '../../services/roleDataAuthorityService';

export default {
  namespace: 'roleDataAuthorityCustomer',

  state: {
    head: {},
    list: [],
    pagination: {},
    customerDataSource: [],
    customerPagination: {},
  },
  effects: {
    *fetchAuthorityCustomer({ payload }, { call, put }) {
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
    *addAuthorityCustomer({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityCustomer({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryCompanyModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            customerDataSource: data.content,
            customerPagination: createPagination(data),
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
