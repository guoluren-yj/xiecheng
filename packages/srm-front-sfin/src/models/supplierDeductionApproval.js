/**
 * index.js - 供应商扣款审批
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  queryList,
  approve,
  returns,
  fetchOperationRecordList,
} from '@/services/supplierDeductionApprovalServices';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierDeductionApproval',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
    enumMap: {},
  },

  effects: {
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          type: 'SFIN.DEDUCTION_STATUS', // 状态
          flag: 'HPFM.FLAG', // 是否票扣
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

    // -通过
    *approve({ payload }, { call }) {
      const response = getResponse(yield call(approve, payload.approveList));
      return response;
    },
    // -退回
    *returns({ payload }, { call }) {
      const response = getResponse(yield call(returns, payload.returnsList));
      return response;
    },

    // -操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = getResponse(yield call(fetchOperationRecordList, payload));
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
