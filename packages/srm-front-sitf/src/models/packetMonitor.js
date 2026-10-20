/**
 * packetMonitor - 接口请求报文监控 - medal 平台级
 * @date: 2018-11-30
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchPacketMonitor } from '@/services//packetMonitorService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'packetMonitor',
  state: {
    list: {},
    pagination: {},
    code: [],
  },
  effects: {
    // 值级查询
    *batchIdpValue(_, { call, put }) {
      const response = yield call(queryIdpValue, 'HITF.REQUEST_METHOD');
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            code: list,
          },
        });
      }
    },
    *fetchPacketMonitor({ payload }, { call, put }) {
      const res = yield call(fetchPacketMonitor, payload);
      const list = getResponse(res);
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
