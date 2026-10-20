/**
 * messageQueueConsumDef - 消息队列消费组定义 - medal
 * @date: 2018-9-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryConsumerGroup,
  updateConsumerGroup,
} from '@/services/messageQueueConsumDefService';

export default {
  namespace: 'messageQueueConsumDef',
  state: {
    list: {},
    handlerQuery: {},
    pagination: {},
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
            pagination: createPagination(list),
          },
        });
      }
    },

    /**
     * 新增或者修改消息队列处理
     */
    *updateConsumerGroup({ payload }, { call }) {
      const response = yield call(updateConsumerGroup, payload);
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
