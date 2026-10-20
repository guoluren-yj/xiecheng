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
  queryPayDetailLine,
  queryPayAdvanceDetailLine,
  getConfigByPayment,
  returnPaymentHeader,
} from '@/services/payQueryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'payQuery',
  state: {
    list: {
      payQuery: {}, // 付款申请查询
      payDetailLine: {}, // 到票付款明细行
      payAdvanceDetailLine: {}, // 预付款申请明细行
    },
    pagination: {
      payQuery: {}, // 付款申请查询
      payDetailLine: {}, // 到票付款明细行
      payAdvanceDetailLine: {}, // 预付款申请明细行
    },
    code: {},
    // activeKey: 'payQueryTab',
  },
  effects: {
    // 查询列表
    *queryList({ payload }, { call, put, spawn }) {
      const { type, ...rest } = payload;
      let url = queryList;
      if (type === 'payDetailLine') {
        url = queryPayDetailLine;
      } else if (type === 'payAdvanceDetailLine') {
        url = queryPayAdvanceDetailLine;
      }
      const list = getResponse(yield call(url, { ...rest, asyncCountFlag: 'DEFAULT' }));
      const pagination = createPagination(list);
      if (list) {
        yield put({
          type: 'updateList',
          payload: {
            type,
            list,
            pagination,
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload: rest,
          firstResult: list,
          queryRequest: url,
          *setPagination(pagination) {
            yield put({
              type: 'updateList',
              payload: { type, pagination },
            });
          },
        });
      }
      return list;
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
          referenceDataList: 'SFIN.PAYMENT_SOURCE_TYPE',
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

    // 获取配置项
    *getConfigByPayment(payload, { call }) {
      const { settingCode } = payload;
      const InvoiceLine = getResponse(yield call(getConfigByPayment, settingCode));
      return InvoiceLine;
    },

    // 回退付款单
    *returnPaymentHeader(payload, { call }) {
      const InvoiceLine = getResponse(yield call(returnPaymentHeader, payload));
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
    updateList(state, { payload }) {
      const { list, pagination, type } = payload;
      const data = { ...state };
      if (list) data.list = { ...state.list, [type]: list };
      if (pagination) data.pagination = { ...state.pagination, [type]: pagination };
      return data;
    },
  },
};
