/**
 * messageHandlerAssigns - 消费组处理定义 - medal
 * @date: 2018-9-29
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryConsumerGroup,
  queryDataAssginHandler,
  queryDateUnassignHandler,
  delectAssignHandler,
  saveAssignHandler,
} from '@/services/messageQueueConsumDefService';

export default {
  namespace: 'messageHandlerAssigns',
  state: {
    queueList: {}, // 消息定义列表
    handlerPagination: {},
    unHandlerPagination: {},
    assginHandlerList: {}, // 已分配的处理
    unassignHandlerList: {}, // 未分配的处理
  },
  effects: {
    /**
     * 查询消息队列处理定义
     */
    *queryConsumerGroup({ payload }, { call, put }) {
      const response = yield call(queryConsumerGroup, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            queueList: list,
          },
        });
      }
    },

    // 查询已分配的处理
    *queryDataAssginHandler({ payload }, { call, put }) {
      const response = yield call(queryDataAssginHandler, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            assginHandlerList: list,
            handlerPagination: createPagination(list),
          },
        });
      }
    },

    // 查询未分配的处理
    *queryDateUnassignHandler({ payload }, { call, put }) {
      const response = yield call(queryDateUnassignHandler, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            unassignHandlerList: list,
            unHandlerPagination: createPagination(list),
          },
        });
      }
    },

    // 删除消费组处理分配
    *delectAssignHandler({ payload }, { call }) {
      const response = yield call(delectAssignHandler, payload);
      return getResponse(response);
    },

    // 保存消费组处理分配
    *saveAssignHandler({ payload }, { call }) {
      const response = yield call(saveAssignHandler, payload);
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
