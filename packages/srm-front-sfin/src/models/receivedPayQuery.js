/**
 * payApprove.js - 付款申请审批界面
 * @date: 2019-07-24
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  queryList,
  queryHeader,
  fetchInvoiceLine,
  fetchLine,
  fetchAdvanceLine,
} from '@/services/receivedPayQueryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'receivedPayQuery',
  state: {
    list: [],
    expend: false,
    pagination: {}, // 待检验的分页
    code: {},
  },
  effects: {
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
    *queryHeader({ payload }, { call }) {
      const headerInfo = getResponse(yield call(queryHeader, payload));
      return headerInfo;
    },
    *fetchInvoiceLine({ payload }, { call }) {
      const InvoiceLine = getResponse(yield call(fetchInvoiceLine, payload));
      return InvoiceLine;
    },
    *fetchLine({ payload }, { call }) {
      const lineDataSource = getResponse(yield call(fetchLine, payload));
      return lineDataSource;
    },
    *init(params, { call, put }) {
      const code = getResponse(
        yield call(queryMapIdpValue, {
          sourceList: 'SFIN.PAYMENT_TYPE',
          sourceStatus: 'SFIN.PAYMENT_STATUS',
          exportStatus: 'SFIN.PAYMENT_SYNC_STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          code: code || {},
        },
      });
    },
    // 预付款申请明细页面-查询明细行
    *fetchAdvanceLine({ payload }, { call }) {
      const InvoiceLine = getResponse(yield call(fetchAdvanceLine, payload));
      return InvoiceLine;
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
