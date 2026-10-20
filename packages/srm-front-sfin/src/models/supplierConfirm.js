/**
 * index.js - 供应商扣款查询
 * @date: 2020-03-12
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import { queryList, handleConfrim, handleReturn } from '@/services/supplierConfrimService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierConfirm',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
  },

  effects: {
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          bank: 'SFIN.DEBIT_CREDIT_CODE',
          type: 'SFIN.DEDUCTION_STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // -查询列表
    *queryList({ payload }, { call, put, spawn }) {
      const response = getResponse(yield call(queryList, { ...payload, asyncCountFlag: 'Y' }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: response,
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
    // 确认
    *handleConfrim({ payload }, { call }) {
      const response = getResponse(yield call(handleConfrim, payload));
      return response;
    },
    // 退回
    *handleReturn({ payload }, { call }) {
      const response = getResponse(yield call(handleReturn, payload));
      return response;
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
