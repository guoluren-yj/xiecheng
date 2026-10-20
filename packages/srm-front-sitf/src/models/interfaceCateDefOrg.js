/**
 * interfaceCateDef - 接口类别定义 - medal 租户级
 * @date: 2018-9-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchInterfaceCareDef,
  updateInterFaceCareDef,
} from '@/services/interfaceCateDefOrgService';

export default {
  namespace: 'interfaceCateDefOrg',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 查询接口段结构表
    *fetchInterfaceCareDef({ payload }, { call, put }) {
      const response = yield call(fetchInterfaceCareDef, payload);
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

    // 新建、创建接口段结构表
    *updateInterFaceCareDef({ payload }, { call }) {
      const response = yield call(updateInterFaceCareDef, payload);
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
