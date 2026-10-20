/**
 * authorityCompany - 租户级权限维护tab页 - 公司 - model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  updateCustomerUnit,
  queryCustomerUnit,
  queryData,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityCustomerUnitSrm',

  state: {
    header: {},
    data: [],
    checkList: [],
    originList: [],
    expandedRowKeys: [],
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
    *fetchAuthorityCustomerUnit({ payload }, { call, put }) {
      const response = yield call(queryCustomerUnit, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryData',
          payload: data,
        });
      }
    },
    *fetchAuthorityCustomerUnitAndExpand({ payload }, { call, put }) {
      const response = yield call(queryCustomerUnit, payload);
      const data = getResponse(response);
      if (data) {
        const expandedRowKeys = data.originList && data.originList.map((list) => list.id);
        yield put({
          type: 'queryData',
          payload: data,
        });
        yield put({
          type: 'updateExpanded',
          payload: expandedRowKeys,
        });
      }
    },
    *updateAuthorityCustomerUnit({ payload }, { call }) {
      const response = yield call(updateCustomerUnit, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryData(state, action) {
      return {
        ...state,
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
