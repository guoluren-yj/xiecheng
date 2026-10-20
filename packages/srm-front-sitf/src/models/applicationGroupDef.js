/**
 * applicationGroupDefinition - 应用组定义 - medal
 * @date: 2018-9-11
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchApplicationGroup,
  updateApplicationGroups,
} from '@/services/applicationGroupDefService';

export default {
  namespace: 'applicationGroupDef',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    /**
     * 查询应用组定义
     */
    *fetchApplicationGroup({ payload }, { call, put }) {
      const response = yield call(fetchApplicationGroup, payload);
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
     * 查询或者修改应用组定义
     */
    *updateApplicationGroups({ payload }, { call }) {
      const response = yield call(updateApplicationGroups, payload);
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
