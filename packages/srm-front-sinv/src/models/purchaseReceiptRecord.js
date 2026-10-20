/*
 * supplierReceiptRecord - 订单确认
 * @date: 2018/10/13 11:49:14
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  alingeDetail,
  operationDetail,
  queryReceiveTransactionDetails,
  queryReceiveTransactionASNDetails,
} from '@/services/purchaseReceiptRecordService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseReceiptRecord',

  state: {
    myList: [],
    myPagination: {},
    enumMap: {}, // 值集
    asnDetailList: [],
    asnDetailPagination: {},
    detailList: [],
    detailPagination: {},
  },

  effects: {
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            myList: result.content,
            myPagination: createPagination(result),
          },
        });
      }
    },
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          specialInventory: 'SINV.RCV_STOCK_TYPE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    *queryReceiveTransactionDetails({ payload }, { call }) {
      const result = getResponse(yield call(queryReceiveTransactionDetails, payload));
      return result;
    },
    *queryReceiveTransactionASNDetails({ payload }, { call }) {
      const result = getResponse(yield call(queryReceiveTransactionASNDetails, payload));
      return result;
    },

    // 查询操作
    *operationDetail({ payload }, { call }) {
      const result = getResponse(yield call(operationDetail, payload));
      return result;
    },

    // 查询操作
    *alingeDetail({ payload }, { call }) {
      const result = getResponse(yield call(alingeDetail, payload));
      return result;
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
