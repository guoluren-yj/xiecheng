/**
 * model - 付款方式定义
 * @date: 2018-8-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import { queryPayment, addOrUpdate, querySingleType } from '@/services/paymentTypeService';

export default {
  namespace: 'paymentType',
  state: {
    paymentData: {}, // 表格数据
    pagination: {}, // 分页参数
  },
  effects: {
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          paymentFormList: 'SBSM.PAY_FORM',
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
    // 查询数据
    *fetchPaymentType({ payload }, { call, put }) {
      const response = yield call(queryPayment, payload);
      const paymentData = getResponse(response);
      if (paymentData) {
        yield put({
          type: 'updateState',
          payload: { paymentData, pagination: createPagination(paymentData) },
        });
      }
    },
    // 查询数据
    *fetchSingleType({ payload }, { call }) {
      const response = yield call(querySingleType, payload);
      const paymentData = getResponse(response);
      return paymentData;
    },
    // 新增编辑数据
    *action({ payload }, { call }) {
      const response = yield call(addOrUpdate, payload);
      return getResponse(response);
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
