/**
 * invoiceInfo - 企业注册-开票信息 - Modal
 * @date: 2018-7-6
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  fetchInvoiceInfo,
  queryCompanyBasic,
  createInvoiceInfo,
  updateInvoiceInfo,
  queryCompanyInvoice,
} from '@/services/invoiceInfoService';

export default {
  namespace: 'invoiceInfo',
  state: {
    legalInfo: {},
    data: {},
    code: {},
  },
  effects: {
    // 查询公司开票信息
    *fetchInvoiceInfo({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: data,
        });
        return data;
      }
    },

    // 查询公司开票信息
    *queryCompanyInvoice({ payload }, { call, put }) {
      const response = yield call(queryCompanyInvoice, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: data,
        });
        return data;
      }
    },

    // 查询公司基础信息
    *queryCompanyBasic({ payload }, { call, put }) {
      const legalInfo = getResponse(yield call(queryCompanyBasic, payload));
      yield put({
        type: 'updateState',
        payload: {
          legalInfo,
        },
      });
      return legalInfo;
    },
    // 创建公司开票信息
    *createInvoiceInfo({ payload }, { call }) {
      const response = yield call(createInvoiceInfo, payload);
      return getResponse(response);
    },
    // 更新公司开票信息
    *updateInvoiceInfo({ payload }, { call }) {
      const response = yield call(updateInvoiceInfo, payload);
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
