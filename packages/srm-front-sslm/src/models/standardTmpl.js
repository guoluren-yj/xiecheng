/**
 * standardTmpl - 标准模板定义 - model
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  queryTmpl,
  saveTmpl,
  updateTmpl,
  handleForbidden,
} from '@/services/standardTmplService';

export default {
  namespace: 'standardTmpl',

  state: {
    data: [],
    expandedRowKeys: [],
  },

  effects: {
    *fetchTmplList({ payload }, { call, put }) {
      const response = yield call(queryTmpl, payload);
      const data = getResponse(response);
      const allKeys = [];
      const getAllKeys = datas => {
        datas.forEach(item => {
          allKeys.push(item.indicateId);
          if (item.children) {
            getAllKeys(item.children);
          }
        });
      };
      if (data) {
        yield put({
          type: 'updateState',
          payload: data,
        });
        getAllKeys(data);
        yield put({
          type: 'updateCheckedData',
          payload: {
            expandedRowKeys: allKeys,
          },
        });
      }
    },
    *saveTmpls({ payload }, { call }) {
      const response = yield call(saveTmpl, payload);
      return getResponse(response);
    },
    *updateTmpls({ payload }, { call }) {
      const response = yield call(updateTmpl, payload);
      return getResponse(response);
    },
    *isForbidden({ payload }, { call }) {
      const response = yield call(handleForbidden, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    updateCheckedData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
