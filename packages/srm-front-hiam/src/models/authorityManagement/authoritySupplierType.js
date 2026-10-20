/**
 * authorityCompany - 租户级权限维护tab页 - 公司 - model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  saveData,
  querySupplierCategory,
  updateSupplierCategory,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authoritySupplierType',

  state: {
    head: {},
    data: [],
    checkList: [],
    originList: [],
    expandedRowKeys: [],
  },

  effects: {
    *addAuthoritySupplierType({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *querySupplierCategory({ payload }, { call, put }) {
      const response = yield call(querySupplierCategory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'fetchSupplierCategory',
          payload: data,
        });
      }
    },
    *querySupplierCategoryAndExpand({ payload }, { call, put }) {
      const response = yield call(querySupplierCategory, payload);
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
    *updateSupplierCategory({ payload }, { call }) {
      const response = yield call(updateSupplierCategory, payload);
      return getResponse(response);
    },
  },
  reducers: {
    fetchSupplierCategory(state, action) {
      return {
        ...state,
        head: action.payload.userAuthority,
        data: action.payload.treeList,
        checkList: action.payload.originList.filter((list) => list.checkedFlag === 1),
        originList: action.payload.originList,
      };
    },
    updateCheckList(state, action) {
      return {
        ...state,
        checkList: action.payload,
      };
    },
    updateExpanded(state, action) {
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
