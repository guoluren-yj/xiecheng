/**
 * 角色管理-权限维护 - group 组织架构-公司
 * @date: 2019-11-07
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryData,
  saveData,
  deleteData,
  queryGroupModalData,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityGroup',

  state: {
    head: {},
    list: [],
    pagination: {},
    groupDataSource: [],
    groupPagination: {},
  },
  effects: {
    *fetchAuthorityGroup({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            head: data.userAuthority,
            list: data.userAuthorityLineList.content,
            pagination: createPagination(data.userAuthorityLineList),
          },
        });
      }
    },
    *addAuthorityGroup({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityGroup({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryGroupModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            groupDataSource: data.content,
            groupPagination: createPagination(data),
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
