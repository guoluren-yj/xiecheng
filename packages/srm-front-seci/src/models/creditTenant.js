/**
 * creditTenant - 租户配置 - medal
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchCreditTenant,
  addCreditTenant,
  handleDisabledTenant,
} from '@/services/creditTenantService';

export default {
  namespace: 'creditTenant',
  state: {
    data: [],
    pagination: {},
  },
  effects: {
    /**
     * 查询征信租户
     */
    *fetchCreditTenant({ payload }, { call, put }) {
      const response = yield call(fetchCreditTenant, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: data.content,
            pagination: createPagination(data),
          },
        });
      }
    },

    /**
     * 添加租户
     */
    *addCreditTenant({ payload }, { call }) {
      const response = yield call(addCreditTenant, payload);
      return getResponse(response);
    },
    /**
     * 禁用/启用租户
     */
    *handleDisabledTenant({ payload }, { call }) {
      const response = yield call(handleDisabledTenant, payload);
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
