/**
 * InvoiceUpdateRule - 发票规则定义
 * @date: 2018-11-14
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  fetchInvoiceUpdRule,
  saveInvoiceUpdRule,
} from '@/services/sodr/invoiceUpdateRuleService';

export default {
  namespace: 'invoiceUpdateRule',
  state: {
    invoiceUpdRuleData: [], // 发票规则
  },
  effects: {
    // 查询初始数据
    *fetchInvoiceUpdRule({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceUpdRule, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { invoiceUpdRuleData: data },
        });
      }
    },

    // 新建或编辑数据
    *saveInvoiceUpdRule({ payload }, { call }) {
      const response = yield call(saveInvoiceUpdRule, payload);
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
