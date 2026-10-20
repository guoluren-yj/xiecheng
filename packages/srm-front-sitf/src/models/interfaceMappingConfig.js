/**
 * InterfaceMappingConfig -IDoc接口映射配置 - medal
 * @date: 2018-10-18
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterfaceMappingList,
  createInterfaceMapping,
  updateInterfaceMapping,
  deleteInterfaceMapping,
} from '@/services/interfaceMappingService';

export default {
  namespace: 'interfaceMappingConfig',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    /**
     * IDoc接口映射查询
     */
    *queryInterfaceMappingList({ payload }, { call, put }) {
      const response = yield call(queryInterfaceMappingList, payload);
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
     * 创建IDoc接口映射
     */
    *createInterfaceMapping({ payload }, { call }) {
      const response = yield call(createInterfaceMapping, payload);
      return getResponse(response);
    },

    /**
     *  修改IDoc接口映射
     */
    *updateInterfaceMapping({ payload }, { call }) {
      const response = yield call(updateInterfaceMapping, payload);
      return getResponse(response);
    },

    /**
     * 删除IDoc接口映射
     */
    *deleteInterfaceMapping({ payload }, { call }) {
      const response = yield call(deleteInterfaceMapping, payload);
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
