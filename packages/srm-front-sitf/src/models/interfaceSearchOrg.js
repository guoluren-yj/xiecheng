/**
 * interfaceSearchOrg - 接口查询 - 租户级 - model
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterfaceListOrg,
  queryBatchListOrg,
  queryIdpValue,
  reRunBatchListOrg,
} from '@/services/interfaceSearchService';

export default {
  namespace: 'interfaceSearchOrg',
  state: {
    // 接口数据
    interfaceData: {
      list: [],
      pagination: {},
    },
    // 批次数据
    batchData: {
      list: [],
      pagination: {},
    },
    // 值集块码
    code: {
      DataExecuteResult: [],
    },
  },
  effects: {
    /**
     * 查询数据执行结果状态
     */
    *getDataExecuteResult({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              DataExecuteResult: data,
            },
          },
        });
      }
    },
    /**
     * 查询接口列表数据
     */
    *queryInterfaceList({ payload }, { call, put }) {
      const response = yield call(queryInterfaceListOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceData: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 查询批次列表数据
     */
    *queryBatchList({ payload }, { call, put }) {
      const response = yield call(queryBatchListOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            batchData: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 重新执行失败数据
     */
    *reRunBatchList({ payload }, { call }) {
      const response = yield call(reRunBatchListOrg, payload);
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
