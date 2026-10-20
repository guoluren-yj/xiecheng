/**
 * messageQueueSearch - 消息队列数据查询 - medal
 * @date: 2018-10-17
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { queryMessageQueueList } from '@/services/messageQueueSearchService';

export default {
  namespace: 'messageQueueSearch',
  state: {
    list: {},
  },
  effects: {
    /**
     * 消息队列数据查询
     */
    *queryMessageQueueList({ payload }, { call, put }) {
      const response = yield call(queryMessageQueueList, payload);
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
