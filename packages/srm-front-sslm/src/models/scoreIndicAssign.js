/**
 * ScoreIndicAssign - 细项权限 - model
 * @date: 2018-08-09
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchIndicAssign,
  fetchCheckedIndicAssign,
  addIndicAssign,
  removeIndicAssign,
} from '@/services/scoreTmplService';

export default {
  namespace: 'scoreIndicAssign',

  state: {
    leftData: {
      list: [],
    },
    rightData: [],
  },
  effects: {
    *fetchIndicAssign({ payload }, { call, put }) {
      const response = yield call(fetchIndicAssign, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateIndicAssignState',
          payload: data,
        });
      }
    },
    *fetchCheckedIndicAssign({ payload }, { call, put }) {
      const response = yield call(fetchCheckedIndicAssign, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateCheckedIndicAssign',
          payload: data,
        });
      }
    },
    *addIndicAssign({ payload }, { call }) {
      const response = yield call(addIndicAssign, payload);
      return getResponse(response);
    },
    *removeIndicAssign({ payload }, { call }) {
      const response = yield call(removeIndicAssign, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateIndicAssignState(state, action) {
      return {
        ...state,
        leftData: {
          ...action.payload,
          list: action.payload.content,
        },
      };
    },
    updateCheckedIndicAssign(state, action) {
      return {
        ...state,
        rightData: action.payload,
      };
    },
  },
};
