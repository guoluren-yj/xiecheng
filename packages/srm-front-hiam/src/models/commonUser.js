/**
 * commonUser - 常用功能
 * @date: 2021-8-26
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryFunctionService, createMenuService } from '../services/roleManagementService';

export default {
  namespace: 'commonUser',
  state: {},
  effects: {
    // 查询常用功能
    *queryFunctionExUser({ payload }, { call }) {
      const res = yield call(queryFunctionService, payload);
      return getResponse(res);
    },
    // 保存常用功能
    *createMenu({ payload }, { call }) {
      const res = yield call(createMenuService, payload);
      return getResponse(res);
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
