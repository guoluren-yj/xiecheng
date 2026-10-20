/**
 * ecClientAssign - 电商账号管理-分配设置 - model
 * @date: 2019-2-25
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchECClientAssign,
  save,
  fetchClientData,
  addEcQualification,
  fetchCommonData,
} from '@/services/ecClientAssignService.js';

export default {
  namespace: 'ecClientAssign',

  state: {
    assignData: [],
    ecClientData: {},
    mapStatusList: [],
  },

  effects: {
    *fetchClientData({ payload }, { call, put }) {
      const res = yield call(fetchClientData, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ecClientData: data,
          },
        });
      }
    },
    *fetchData({ payload }, { call, put }) {
      const data = yield call(fetchECClientAssign, payload);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            assignData: data,
          },
        });
      }
    },
    *saveData({ payload }, { call }) {
      const result = yield call(save, payload);
      return getResponse(result);
    },
    *addEcQualification({ payload }, { call }) {
      const result = yield call(addEcQualification, payload);
      return getResponse(result);
    },
    *fetchCommonData({ payload }, { call, put }) {
      const response = yield call(fetchCommonData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            mapStatusList: data,
          },
        });
      }
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
