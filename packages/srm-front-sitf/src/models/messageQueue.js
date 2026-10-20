/**
 * messageQueue - 消息队列组定义 - medal
 * @date: 2018-9-07
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMessageQueue, createOrEditQueue } from '@/services/messageQueueService';

export default {
  namespace: 'messageQueue',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    /**
     * 查询消息队列列表
     */
    *queryMessageQueue({ payload }, { call, put }) {
      const response = yield call(queryMessageQueue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    /**
     * 查询或者修改消息队列
     */
    *createOrEditQueue({ payload }, { call }) {
      const response = yield call(createOrEditQueue, payload);
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
