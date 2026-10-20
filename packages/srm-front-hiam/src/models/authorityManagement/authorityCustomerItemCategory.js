/**
 * authorityCompany - 租户级权限维护tab页 - 公司 - model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  updateCustomerItemCategory,
  queryCustomerItemCategory,
  fetchLov,
  queryData,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityCustomerItemCategory',

  state: {
    header: {},
    data: [],
    checkList: [],
    originList: [],
    expandedRowKeys: [],
    firstTenant: {},
  },

  effects: {
    *fetchHeader({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            header: data.userAuthority,
          },
        });
      }
    },
    *fetchLov({ payload }, { call, put }) {
      const response = yield call(fetchLov, payload);
      const data = getResponse(response) || {};
      const { content = [] } = data;
      if (data) {
        yield put({
          type: 'updateState',
          payload: { firstTenant: content.length && content.length >= 1 ? content[0] : {} },
        });
      }
      return data;
    },
    *queryCustomerItemCategory({ payload }, { call, put }) {
      const response = yield call(queryCustomerItemCategory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'fetchSupplierCategory',
          payload: data,
        });
      }
      return data;
    },
    *queryCustomerItemCategoryAndExpand({ payload }, { call, put }) {
      const response = yield call(queryCustomerItemCategory, payload);
      const data = getResponse(response);
      if (data) {
        const expandedRowKeys = data.originList && data.originList.map((list) => list.id);
        yield put({
          type: 'fetchSupplierCategory',
          payload: data,
        });
        yield put({
          type: 'updateExpanded',
          payload: expandedRowKeys,
        });
      }
    },
    *updateCustomerItemCategory({ payload }, { call }) {
      const response = yield call(updateCustomerItemCategory, payload);
      return getResponse(response);
    },
  },
  reducers: {
    fetchSupplierCategory(state, action = { payload: { filter: [] } }) {
      return {
        ...state,
        data: action.payload.treeList,
        checkList: action.payload.originList
          .filter((list) => list.checkedFlag === 1)
          .map((item) => item.dataId),
        originList: action.payload.originList,
      };
    },
    updateCheckList(state, action = { payload: [] }) {
      return {
        ...state,
        checkList: action.payload,
      };
    },
    updateExpanded(state, action = { payload: [] }) {
      return {
        ...state,
        expandedRowKeys: action.payload,
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
