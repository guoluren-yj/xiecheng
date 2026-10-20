/**
 * model 我的付款记录
 * @date: 2020-3-4
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  fetchList,
  fetchAssociatedInvoiceList,
  fetchPaymentMethodList,
  fetchPrepaymentInformationList,
  fetchDeductionInformationList,
  fetchDetailHeader,
  // fetchDetectionList,
  // fetchDefectList,
  // fetchOperationRecordList,
} from '@/services/paymentRecordService';

export default {
  namespace: 'collectionRecord',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页信息
    detailHeader: {},
    associatedInvoiceList: {
      list: [],
      pagination: {},
    },
    deductionInformationList: {
      list: [],
      pagination: {},
    },
    paymentMethodList: {
      list: [],
      pagination: {},
    },
    prepaymentInformationList: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    // 来料检验单查询
    *fetchList({ payload }, { call, put, spawn }) {
      const result = getResponse(yield call(fetchList, { ...payload, asyncCountFlag: 'DEFAULT' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: result,
          queryRequest: fetchList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { pagination },
            });
          },
        });
      }
    },
    // 来料检验单查询
    *fetchDetailHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDetailHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailHeader: result,
          },
        });
      }
    },
    // 来料检验单查询
    *fetchAssociatedInvoiceList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchAssociatedInvoiceList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            associatedInvoiceList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 来料检验单查询
    *fetchDeductionInformationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDeductionInformationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            deductionInformationList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 来料检验单查询
    *fetchPaymentMethodList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPaymentMethodList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            paymentMethodList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 来料检验单查询
    *fetchPrepaymentInformationList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPrepaymentInformationList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            prepaymentInformationList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
