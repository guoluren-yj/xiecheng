/**
 * ledger.js - 账套定义 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryLedger, updateLedger, insertLedger } from '@/services/ledgerService';

export default {
  namespace: 'ledger',

  state: {
    list: {}, // 账套列表
    pagination: {}, // 分页对象
  },

  effects: {
    // 查询账套列表
    *queryLedger({ payload }, { call, put }) {
      const res = yield call(queryLedger, payload);
      const list = getResponse(res);
      const pagination = createPagination(list);
      yield put({
        type: 'updateState',
        payload: {
          list,
          pagination,
        },
      });
    },

    // 新增或更新账套
    *saveLedger({ payload }, { call }) {
      let res;
      if (payload.ledgerId) {
        res = yield call(updateLedger, payload);
      } else {
        res = yield call(insertLedger, payload);
      }
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
