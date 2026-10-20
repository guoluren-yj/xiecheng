/**
 * index - 销项发票池
 * @date: 2019-07-24
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchTotalCountGen } from '@/utils/utils';
import { queryList } from '@/services/outputInvoiceService';

export default {
  namespace: 'outputInvoice',
  state: {
    list: [],
    expend: false,
    pagination: {}, // 待检验的分页
    code: {},
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 查询列表
    *queryList({ payload }, { call, put, spawn }) {
      const list = getResponse(yield call(queryList, { ...payload, asyncCountFlag: 'Y' }));
      const pagination = createPagination(list);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list: list.content,
            pagination,
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: list,
          queryRequest: queryList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { pagination },
            });
          },
        });
      }
    },
  },

  reducers: {
    // 更新页面状态
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
