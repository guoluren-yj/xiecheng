/**
 * interfaceConstrucDef - 接口表结构定义 - medal
 * @date: 2018-9-20
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterFaceTable,
  updateInterFaceTable,
} from '@/services/interfaceTableDefService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'interfaceTableDef',
  state: {
    list: {},
    code: [],
    pagination: {},
  },
  effects: {
    /**
     * 查询值级
     */
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
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
     * 查询接口表结构定义列表
     */
    *queryInterFaceTable({ payload }, { call, put }) {
      const response = yield call(queryInterFaceTable, payload);
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

    // 修改或新增
    *updateInterFaceTable({ payload }, { call }) {
      const response = yield call(updateInterFaceTable, payload);
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
