/**
 * messageQueueProDef - 消息队列处理定义 - medal
 * @date: 2018-9-11
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryMessageQueuePro,
  createOrEditMessageQueuePro,
} from '@/services/messageQueueProDefService';

export default {
  namespace: 'messageQueueProDef',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    /**
     * 查询消息队列处理定义
     */
    *queryMessageQueuePro({ payload }, { call, put }) {
      const response = yield call(queryMessageQueuePro, payload);
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
     * 查询或者修改消息队列处理
     */
    *saveMessageQueuePro({ payload }, { call }) {
      const response = yield call(createOrEditMessageQueuePro, payload);
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
