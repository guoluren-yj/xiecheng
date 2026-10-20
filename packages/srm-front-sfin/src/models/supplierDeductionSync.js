/*
 * @Author: your name
 * @Date: 2020-06-15 14:38:04
 * @LastEditTime: 2020-06-30 14:55:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-sfin\src\models\SupplierDeductionSync.js
 */
import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  queryList,
  fetchOperationRecordList,
  supplierDeductionSync,
} from '@/services/supplierDeductionSyncServices';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierDeductionSync',
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
          useFlag: 'SFIN.DEDUCTION_USE_FLAG',
          exportStatus: 'SFIN.DEDUCTION_SYNC_STATUS',
          paymentMethod: 'SQAM.PAYMENT_TYPE',
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
      const response = getResponse(
        yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
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
    // -操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = getResponse(yield call(fetchOperationRecordList, payload));
      return response;
    },
    // -操作记录
    *supplierDeductionSync({ payload }, { call }) {
      const response = getResponse(yield call(supplierDeductionSync, payload));
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
