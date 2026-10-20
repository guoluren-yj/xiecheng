/**
 * queueHandleAssigns - 消息队列定义 - 消息队列处理分配定义 - model
 * @date: 2018-9-13
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import { getResponse } from 'utils/utils';
import {
  queryQueueInfo,
  queryData,
  queryAssignData,
  addData,
  removeData,
} from '@/services/queueHandleAssignsService';

export default {
  namespace: 'queueHandleAssigns',
  state: {
    data: {
      list: [],
    },
    assignData: {
      list: [],
    },
    queueInfo: {},
  },
  effects: {
    *queryQueueInfo({ payload }, { call, put }) {
      const response = yield call(queryQueueInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            queueInfo: data,
          },
        });
      }
    },
    *fetchHandleAssign({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
            },
          },
        });
      }
    },
    *fetchAssignData({ payload }, { call, put }) {
      const response = yield call(queryAssignData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            assignData: {
              ...data,
              list: data.content,
            },
          },
        });
      }
    },
    *addAssignData({ payload }, { call }) {
      const response = yield call(addData, payload);
      return getResponse(response);
    },
    *removeAssignData({ payload }, { call }) {
      const response = yield call(removeData, payload);
      return getResponse(response);
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
