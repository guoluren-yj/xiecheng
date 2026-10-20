/**
 * monitorInterfaceSetting - 监控接口配置 - medal
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchMonitorSystemInfo,
  fetchMonitorInterfaceSetting,
  saveMonitorInterfaceSetting,
} from '@/services/monitorInterfaceSettingService.js';

export default {
  namespace: 'monitorInterfaceSetting',
  state: {
    monitorSystemInfo: {},
    list: [],
    pagination: {},
  },
  effects: {
    *fetchMonitorSystemInfo({ payload }, { call, put }) {
      const response = yield call(fetchMonitorSystemInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            monitorSystemInfo: data,
          },
        });
      }
    },
    *fetchMonitorInterfaceSetting({ payload }, { call, put }) {
      const response = yield call(fetchMonitorInterfaceSetting, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
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
        });
      }
    },
    *saveMonitorInterfaceSetting({ payload }, { call }) {
      const response = yield call(saveMonitorInterfaceSetting, payload);
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
