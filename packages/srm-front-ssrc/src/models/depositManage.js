/**
 * depositManage - 保证金管理model
 * @date: 2020-04-01
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import {
  queryRfxListWithDeposit,
  queryRfxHeaderInfo,
  querySupplierListWithDeposit,
  saveDepositInfo,
  deleteDeposit,
} from '@/services/depositManageService';

export default {
  namespace: 'depositManage',
  state: {
    dataSource: [], // 询价单列表
    pagination: {}, // 分页信息
    supplierDataSource: [], // 供应商列表
    supplierPagination: {}, // 供应商分页信息
    headerInfo: {}, // 保证金头信息
    expensesStatus: [], // 金额状态
  },
  effects: {
    // 查询询价单列表
    *fetchQueryRfxListWithDeposit({ payload }, { call, put }) {
      const response = yield call(queryRfxListWithDeposit, payload);
      if (getResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
        return response;
      }
    },
    // 查询保证金头信息
    *fetchQueryRfxHeaderInfo({ payload }, { call, put }) {
      const response = yield call(queryRfxHeaderInfo, payload);
      if (getResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: {
              ...response,
            },
          },
        });
      }
    },
    // 查询保证金供应商列表
    *fetchQuerySupplierListWithDeposit({ payload }, { call, put }) {
      const { dataType, ...otherPayload } = payload;
      const response = yield call(querySupplierListWithDeposit, otherPayload);
      if (getResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            [`${dataType}Data`]: response.content?.map((i) => {
              return { ...i, _status: 'update' };
            }),
            [`${dataType}Pagination`]: createPagination(response),
          },
        });
      }
      return response;
    },
    // 保存保证金信息
    *fetchSaveDepositInfo({ payload }, { call }) {
      const response = yield call(saveDepositInfo, payload);
      if (getResponse(response)) {
        return response;
      }
    },
    // 保存保证金信息
    *deleteDeposit({ payload }, { call }) {
      const response = yield call(deleteDeposit, payload);
      if (getResponse(response)) {
        return response;
      }
    },
    // 获取固定值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          expensesStatus: 'SSRC.EXPENSES_STATUS', // 金额状态来源
          paymentRuleStatus: 'SDEP.DEPOSIT_PAYMENT_RULE', // 缴纳类型
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
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
