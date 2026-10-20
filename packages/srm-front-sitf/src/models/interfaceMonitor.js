/**
 * interfaceMonitor - 接口监控 - medal
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchMonitorSystem,
  saveMonitorSystem,
  fetchNoticeFields,
  saveNoticeFields,
} from '@/services/interfaceMonitorService.js';

export default {
  namespace: 'interfaceMonitor',
  state: {
    monitorSystem: {
      list: [],
      pagination: {},
    },
    noticeFields: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *fetchMonitorSystem({ payload }, { call, put }) {
      const response = yield call(fetchMonitorSystem, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            monitorSystem: {
              list:
                data.content &&
                data.content.map(element => {
                  return {
                    ...element,
                    _status: 'update',
                  };
                }),
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    *fetchNoticeFields({ payload }, { call, put }) {
      const response = yield call(fetchNoticeFields, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            noticeFields: {
              list:
                data.content &&
                data.content.map(element => {
                  return {
                    ...element,
                    _status: 'update',
                  };
                }),
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    *saveMonitorSystem({ payload }, { call }) {
      const response = yield call(saveMonitorSystem, payload);
      return getResponse(response);
    },
    *saveNoticeFields({ payload }, { call }) {
      const response = yield call(saveNoticeFields, payload);
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
