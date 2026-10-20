/**
 * ecPlatformDef - 电商平台定义 - medal
 * @date: 2018-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchEcPlatFormList, updateEcPlatForm } from '@/services/ecPlatformDefService';

export default {
  namespace: 'ecPlatformDef',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    *fetchEcPlatFormList({ payload }, { call, put }) {
      const response = yield call(fetchEcPlatFormList, payload);
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
    *updateEcPlatForm({ payload }, { call }) {
      const response = yield call(updateEcPlatForm, payload);
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
