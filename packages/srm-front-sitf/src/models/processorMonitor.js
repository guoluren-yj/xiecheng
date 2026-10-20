/**
 * processorMonitor - 前置机监控 - medal
 * @date: 2018-9-14
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryProcessorMonitor,
  updateProcessorMonitor,
  updateProcessorMonitorDetail,
  startOrEndProcessorMonitor,
  getGroupList,
  deleteProcessorMonitor,
} from '@/services//processorMonitorService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'processorMonitor',
  state: {
    list: {},
    detail: {},
    code: [],
    queryCode: [],
    pagination: {},
  },
  effects: {
    /**
     * 获取前置机值级
     */
    *batchIdpValue(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SITF.MONITOR_STATUS');
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            queryCode: list,
          },
        });
      }
    },

    /**
     * 执行器查询(值级)
     */
    *getGroupList({ payload }, { call, put }) {
      const response = yield call(getGroupList, payload);
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

    /**
     * 查询前置机监控列表
     */
    *queryProcessorMonitor({ payload }, { call, put }) {
      const response = yield call(queryProcessorMonitor, payload);
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
     * 查询前置机定义明细
     */
    *updateProcessorMonitorDetail({ payload }, { call, put }) {
      const response = yield call(updateProcessorMonitorDetail, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            detail: list,
          },
        });
      }
    },

    /**
     * 更新前置机监控列表
     */
    *updateProcessorMonitor({ payload }, { call }) {
      const response = yield call(updateProcessorMonitor, payload);
      return getResponse(response);
    },
    /**
     * 开始或者停止前置机监控
     */
    *startOrEndProcessorMonitor({ payload }, { call }) {
      const response = yield call(startOrEndProcessorMonitor, payload);
      return getResponse(response);
    },
    /**
     * 删除前置机定义
     */
    *deleteProcessorMonitor({ payload }, { call }) {
      const response = yield call(deleteProcessorMonitor, payload);
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
