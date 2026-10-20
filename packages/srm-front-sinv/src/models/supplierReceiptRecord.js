/*
 * supplierReceiptRecord - 供应商收货记录
 * @date: 2018/10/13 11:49:14
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  queryReceiveTransactionDetails,
  queryReceiveTransactionASNDetails,
} from '@/services/supplierReceiptRecordService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierReceiptRecord',

  state: {
    list: [], // 查询数据
    enumMap: {}, // 值集
    listQueryParams: {}, // 列表查询条件
  },

  effects: {
    *fetchEnumMap(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          rcvStockType: 'SINV.RCV_STOCK_TYPE',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryList, payload));
      yield put({
        type: 'updateState',
        payload: {
          listQueryParams: otherParams,
        },
      });
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查看接收事务明细
    *queryReceiveTransactionDetails({ params }, { call }) {
      const response = getResponse(yield call(queryReceiveTransactionDetails, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查看接收事务ASN明细
    *queryReceiveTransactionASNDetails({ params }, { call }) {
      const response = getResponse(yield call(queryReceiveTransactionASNDetails, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
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
