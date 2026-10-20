/**
 * frontComputerDef - 前置机定义 - medal
 * @date: 2018-9-12
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchFrontComputer,
  updateFrontComputer,
  deleteFrontComputer,
  updateFrontComputerPwd,
} from '@/services/frontComputerDefService';

export default {
  namespace: 'frontComputerDef',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    *fetchFrontComputerList({ payload }, { call, put }) {
      const response = yield call(fetchFrontComputer, payload);
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
     * 查询或者修改前置机定义
     */
    *updateFrontComputer({ payload }, { call }) {
      const response = yield call(updateFrontComputer, payload);
      return getResponse(response);
    },
    /**
     * 修改前置机Pwd
     */
    *updateFrontComputerPwd({ payload }, { call }) {
      const response = yield call(updateFrontComputerPwd, payload);
      return getResponse(response);
    },
    /**
     * 删除前置机定义
     */
    *deleteFrontComputer({ payload }, { call }) {
      const response = yield call(deleteFrontComputer, payload);
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
