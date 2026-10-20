/**
 * queueSystemAssign - 消息队列系统分配定义 -model
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryData,
  saveData,
  removeData,
  queryQueueInfo,
} from '@/services/queueSystemAssignService';

export default {
  namespace: 'queueSystemAssign',
  state: {
    // 消息队列分配数据
    data: {
      list: [],
      pagination: {},
    },
    // 消息队列详情
    queueInfo: {},
  },
  effects: {
    /**
     * 查询消息队列详情
     */
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
    /**
     * 查询消息队列详情
     */
    *fetchQueueSystem({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 保存消息队列分配系统
     */
    *saveQueueSystem({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    /**
     * 删除消息队列分配系统
     */
    *deleteQueueSystem({ payload }, { call }) {
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
