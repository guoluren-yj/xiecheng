/**
 * ScoreCategory - 分配采购品类 - model
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchTmplInfo,
  fetchTmplInfoHistory,
  fetchPurcahseCategory,
  changeCategory,
} from '@/services/evaluationTemplateService';

export default {
  namespace: 'purchaseCategory',

  state: {
    tmplInfo: {},
    data: [],
    historyData: [],
  },
  effects: {
    *fetchTmplInfo({ payload = {} }, { call, put }) {
      const response = yield call(fetchTmplInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateTmplInfo',
          payload: {
            tmplInfo: {
              templateCode: data?.content[0]?.evalTplCode || null,
              templateName: data?.content[0]?.evalTplName || null,
            },
          },
        });
      }
    },
    *fetchTmplInfoHistory({ payload = {} }, { call, put }) {
      const response = yield call(fetchTmplInfoHistory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateTmplInfo',
          payload: {
            tmplInfo: {
              templateCode: data?.content[0]?.evalTplCode || null,
              templateName: data?.content[0]?.evalTplName || null,
            },
          },
        });
      }
    },
    *fetchpurcahseCategory({ payload }, { call, put }) {
      const response = yield call(fetchPurcahseCategory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateCategoryState',
          payload: data,
        });
      }
      return data;
    },
    *change({ payload }, { call }) {
      const response = yield call(changeCategory, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateTmplInfo(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateCategoryState(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
