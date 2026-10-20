/**
 * queuesSetting - 消息队列定义 - model
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryData, saveData, queryIdpValue } from '@/services/queuesSettingService';

export default {
  namespace: 'queuesSetting',
  state: {
    /**
     * 消息队列数据
     */
    data: {
      list: [],
      pagination: {},
    },
    /**
     * 消费类型
     */
    code: {
      ConsumptionType: [],
    },
  },
  effects: {
    /**
     * 查询消息队列数据
     */
    *fetchQueueSetting({ payload }, { call, put }) {
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
     * 查询值集数据
     */
    *fetchCode({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              ConsumptionType: data,
            },
          },
        });
      }
    },
    /**
     * 保存消息队列数据
     */
    *saveQueueSetting({ payload }, { call }) {
      const response = yield call(saveData, payload);
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
