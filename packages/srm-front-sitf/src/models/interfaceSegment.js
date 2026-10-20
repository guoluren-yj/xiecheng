/**
 * interfaceConstrucDef - 接口段结构表 - medal
 * @date: 2018-9-20
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterfaceSegment,
  querySegmentFields,
  syncSegmentFields,
} from '@/services/interfaceSegmentService';

export default {
  namespace: 'interfaceSegment',
  state: {
    list: {},
    pagination: {},
    fieldPagination: {},
    fieldsList: {},
  },
  effects: {
    // 查询接口段结构表
    *queryInterfaceSegment({ payload }, { call, put }) {
      const response = yield call(queryInterfaceSegment, payload);
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

    // 查询接口结构定义表
    *querySegmentFields({ payload }, { call, put }) {
      const response = yield call(querySegmentFields, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsList: list,
            fieldPagination: createPagination(list),
          },
        });
      }
    },

    // 同步
    *syncSegmentFields({ payload }, { call }) {
      const response = yield call(syncSegmentFields, payload);
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
