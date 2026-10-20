/**
 * scoreIndic - 模板指标定义 model
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  queryIndic,
  saveIndic,
  updateIndic,
  handleForbidden,
  submitScoreTmpl,
  fetchTmplInfo,
  getStandardTmpl,
  saveCopyData,
} from '@/services/scoreTmplService';

export default {
  namespace: 'scoreIndic',

  state: {
    data: [],
    expandedRowKeys: [],
    tmplInfo: {},
    tmpl: [],
    dataSource: {},
  },

  effects: {
    *fetchIndicList({ payload }, { call, put }) {
      const response = yield call(queryIndic, payload);
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
    *saveIndic({ payload }, { call }) {
      const response = yield call(saveIndic, payload);
      return getResponse(response);
    },
    *updateIndic({ payload }, { call }) {
      const response = yield call(updateIndic, payload);
      return getResponse(response);
    },
    *isForbidden({ payload }, { call }) {
      const response = yield call(handleForbidden, payload);
      return getResponse(response);
    },
    *submit({ payload }, { call }) {
      const response = yield call(submitScoreTmpl, payload);
      return getResponse(response);
    },
    *fetchCategory({ payload }, { call }) {
      const response = yield call(fetchTmplInfo, payload);
      return getResponse(response);
    },
    *getStandardTmpl({ payload }, { call, put }) {
      const response = yield call(getStandardTmpl, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateTmpl',
          payload: data,
        });
      }
    },
    *saveCopy({ payload }, { call }) {
      const response = yield call(saveCopyData, payload);
      return getResponse(response);
    },
    *fetchPublishedTmpl({ payload }, { call, put }) {
      const response = yield call(queryIndic, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateTmpl',
          payload: data,
        });
      }
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    updateTmpl(state, action) {
      return {
        ...state,
        tmpl: action.payload,
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
