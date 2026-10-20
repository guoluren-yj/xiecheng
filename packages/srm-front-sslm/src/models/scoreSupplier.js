/**
 * scoreSupplier - 细项权限 - model
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchSupplier,
  fetchScoreSupplier,
  saveSupplier,
  deleteSupplier,
  fetchTmplInfo,
} from '@/services/scoreTmplService';

export default {
  namespace: 'scoreSupplier',

  state: {
    tmplInfo: {},
    leftData: {
      list: [],
    },
    rightData: [],
    expandedRowKeys: [],
  },
  effects: {
    *fetchTmplInfo({ payload }, { call, put }) {
      const response = yield call(fetchTmplInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: data,
        });
      }
    },
    *fetchSupplier({ payload }, { call, put }) {
      const response = yield call(fetchSupplier, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateSupplierState',
          payload: data,
        });
      }
    },
    *fetchCheckedSupplier({ payload }, { call }) {
      const response = yield call(fetchScoreSupplier, payload);
      return getResponse(response);
    },
    *addScoreSupplier({ payload }, { call }) {
      const response = yield call(saveSupplier, payload);
      return getResponse(response);
    },
    *removeScoreSupplier({ payload }, { call }) {
      const response = yield call(deleteSupplier, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        tmplInfo: action.payload,
      };
    },
    updateSupplierState(state, action) {
      return {
        ...state,
        leftData: {
          ...action.payload,
          list: action.payload.content,
        },
      };
    },
    updateCheckedSupplier(state, action) {
      return {
        ...state,
        rightData: action.payload,
      };
    },
  },
};
