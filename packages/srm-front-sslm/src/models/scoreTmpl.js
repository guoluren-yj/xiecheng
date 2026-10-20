/**
 * scoreTmpl - 评分模板定义 - model
 * @date: 2018-08-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryScoreTmpl,
  saveScoreTmpl,
  deleteScoreTmpl,
  fetchScoreCompany,
  fetchCompany,
  saveCompany,
  scoreTemplatePublish,
} from '@/services/scoreTmplService';

export default {
  namespace: 'scoreTmpl',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    companyData: [],
    scoreCompany: [],
    code: {
      scoreTmplType: [],
      scoreTmplStatus: [],
    },
  },

  effects: {
    *fetchScoreTmpl({ payload }, { call, put }) {
      const response = yield call(queryScoreTmpl, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: data,
        });
      }
    },
    *saveScoreTmpl({ payload }, { call }) {
      const response = yield call(saveScoreTmpl, payload);
      return getResponse(response);
    },
    *deleteScoreTmpl({ payload }, { call }) {
      const response = yield call(deleteScoreTmpl, payload);
      return getResponse(response);
    },
    *fetchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'setCode',
          payload: data,
        });
      }
    },
    *fetchCompany({ payload }, { call, put }) {
      const response = yield call(fetchCompany, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateCompany',
          payload: data,
        });
      }
    },
    *fetchScoreCompany({ payload }, { call, put }) {
      const response = yield call(fetchScoreCompany, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateScoreCompany',
          payload: data,
        });
      }
    },
    *saveCompany({ payload }, { call }) {
      const response = yield call(saveCompany, payload);
      return getResponse(response);
    },

    /**
     * 发布评分模板定义
     */
    *publishScoreTemplate({ payload }, { call }) {
      const response = yield call(scoreTemplatePublish, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        data: {
          ...action.payload,
          list: action.payload.content,
          pagination: createPagination(action.payload),
        },
      };
    },
    setCode(state, action) {
      return {
        ...state,
        code: {
          scoreTmplType: action.payload.scoreTmplType,
          scoreTmplStatus: action.payload.scoreTmplStatus,
        },
      };
    },
    editRow(state, action) {
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload,
        },
      };
    },
    addPagination(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size + 1 : state.data.size,
          totalElements: state.data.totalElements + 1,
        },
      };
    },
    removePagination(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size - 1 : state.data.size,
          totalElements: state.data.totalElements - 1,
        },
      };
    },
    updateCompany(state, action) {
      return {
        ...state,
        companyData: action.payload,
      };
    },
    updateScoreCompany(state, action) {
      return {
        ...state,
        scoreCompany: action.payload,
      };
    },
  },
};
