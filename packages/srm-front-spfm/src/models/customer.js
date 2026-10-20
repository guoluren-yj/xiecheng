/**
 * customer.js - 我的合作伙伴我的客户 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryCustomer } from '@/services/customerService';

export default {
  namespace: 'customer',

  state: {
    list: {}, // 平台客户列表
    pagination: {}, // 列表分页参数对象
  },

  effects: {
    // 查询平台客户列表
    *queryCustomer({ payload }, { call, put }) {
      const res = yield call(queryCustomer, payload);
      const list = getResponse(res);
      const pagination = createPagination(list);
      yield put({
        type: 'updateState',
        payload: {
          list,
          pagination,
        },
      });
      return list;
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
