/**
 * EventHandle - 事件处理 - model
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchEventData,
  fetchEventHandle,
  saveEventHandle,
} from '@/services/eventHandleService';

export default {
  namespace: 'eventHandle',

  state: {
    eventHandleData: [],
    pagination: {},
    eventData: [],
  },

  effects: {
    //  获取事件信息
    *fetchEventData({ payload }, { call, put }) {
      const res = yield call(fetchEventData, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            eventData: list.content,
          },
        });
      }
      return list;
    },

    // 获取事件处理信息
    *fetchEventHandleData({ payload }, { call, put }) {
      const res = yield call(fetchEventHandle, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            eventHandleData: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 保存事件处理
    *saveData({ payload }, { call }) {
      const param = payload;
      param.enabledFlag = payload.enabledFlag ? 1 : 0;
      const res = yield call(saveEventHandle, param);
      return getResponse(res);
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
