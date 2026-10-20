/**
 * messageQueueAssigns - 消息队列消费组定义(队列分配) - medal
 * @date: 2018-9-30
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryConsumerGroup,
  queryDateAssginQueue,
  queryDateUnassignQueue,
  deleteQueueAssign,
  saveQueueAssign,
} from '@/services/messageQueueConsumDefService';

export default {
  namespace: 'messageQueueAssigns',
  state: {
    list: {},
    assignPagination: {},
    unAssignPagination: {},
    assginQueueList: {}, // 已分配的队列
    unassignQueueList: {}, // 未分配的队列
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
            list,
          },
        });
      }
    },

    // 查询已分配的队列
    *queryDateAssginQueue({ payload }, { call, put }) {
      const response = yield call(queryDateAssginQueue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            assginQueueList: list,
            assignPagination: createPagination(list),
          },
        });
      }
    },

    // 查询未分配的队列
    *queryDateUnassignQueue({ payload }, { call, put }) {
      const response = yield call(queryDateUnassignQueue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            unassignQueueList: list,
            unAssignPagination: createPagination(list),
          },
        });
      }
    },

    // 删除消费组队列分配
    *deleteQueueAssign({ payload }, { call }) {
      const response = yield call(deleteQueueAssign, payload);
      return getResponse(response);
    },

    // 保存消费组队列分配
    *saveQueueAssign({ payload }, { call }) {
      const response = yield call(saveQueueAssign, payload);
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
