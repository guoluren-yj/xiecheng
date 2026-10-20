/**
 * seciInterfaceDef - 接口定义 - model
 * @date: 2019-01-02
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchSeciInterfaceDef,
  updateInterfaces,
} from '@/services/seciInterfaceDefService';

export default {
  namespace: 'seciInterfaceDef',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    /**
     * 获取接口定义列表
     * @returns
     */
    *fetchSeciInterfaceDef({ payload }, { call, put }) {
      const response = yield call(fetchSeciInterfaceDef, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            data: list.content,
            pagination: createPagination(list),
          },
        });
      }
    },
    /**
     * 更新接口定义
     * @returns
     */
    *updateInterfaces({ payload }, { call }) {
      const response = yield call(updateInterfaces, payload);
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
