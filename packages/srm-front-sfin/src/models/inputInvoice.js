/**
 * Bill - 我开具的税务发票
 * @date: 2019-09-19
 * @author: junchaozhou <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import { fetchMaintain } from '@/services/inputInvoiceService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'inputInvoice',
  state: {
    maintainQueryList: [], // 列表数据
    maintainQueryPagination: {}, // 列表的分页
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

    // 查询列表数据
    *fetchMaintain({ payload }, { call, put, spawn }) {
      const response = yield call(fetchMaintain, { ...payload, asyncCountFlag: 'Y' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            maintainQueryList: data.content,
            maintainQueryPagination: createPagination(data),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchMaintain,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { maintainQueryPagination: pagination },
            });
          },
        });
      }
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
