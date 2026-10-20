/**
 * onlyInvoiceRule.js - 开票即对账规则配置
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchBillRule,
  saveBillRule,
  deleteBillRule,
  fetchRuleDetail,
  addAll,
  saveRuleDetail,
  deleteRuleDetail,
  fetchRuleType,
  fetchSupplierLovData,
} from '@/services/onlyInvoiceRuleService';

export default {
  namespace: 'onlyInvoiceRule',

  state: {
    billRuleList: [], // 对账单规则列表
    billRulePagination: {}, // 对账单规则分页
    ruleDetailList: [], // 对账单规则详情列表
    ruleDetailPagination: {}, // 对账单规则详情分页
    ruleTypeList: [], // 对账规则区分
    supplierList: {}, // 供应商列表
    supplierPagination: {}, // 供应商分页
  },

  effects: {
    // 查询对账单规则
    *fetchBillRule({ payload }, { call, put }) {
      const data = getResponse(yield call(fetchBillRule, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            billRuleList: data.content,
            billRulePagination: createPagination(data),
          },
        });
      }
    },
    // 批量保存对账单规则
    *saveBillRule({ payload }, { call }) {
      const res = yield call(saveBillRule, payload);
      return getResponse(res);
    },
    // 批量删除对账单规则
    *deleteBillRule({ payload }, { call }) {
      const res = yield call(deleteBillRule, payload);
      return getResponse(res);
    },

    // 查询规则详情
    *fetchRuleDetail({ payload }, { call, put }) {
      const data = getResponse(yield call(fetchRuleDetail, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ruleDetailList: data.content,
            ruleDetailPagination: createPagination(data),
          },
        });
      }
    },
    *fetchRuleType({ payload }, { call, put }) {
      const data = getResponse(yield call(fetchRuleType, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            ruleTypeList: data,
          },
        });
      }
    },
    // 加入全部
    *addAll({ payload }, { call }) {
      const res = yield call(addAll, payload);
      return getResponse(res);
    },
    // 保存
    *saveRuleDetail({ payload }, { call }) {
      const res = yield call(saveRuleDetail, payload);
      return getResponse(res);
    },
    // 保存
    *deleteRuleDetail({ payload }, { call }) {
      const res = yield call(deleteRuleDetail, payload);
      return getResponse(res);
    },
    /**
     * 获得供应商lov数据
     */
    *fetchSupplierLovData({ payload }, { call, put }) {
      const res = yield call(fetchSupplierLovData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierList: list,
            supplierPagination: createPagination(list),
          },
        });
      }
    },
  },

  reducers: {
    storeList(state, { payload }) {
      const { page, list, ruleId } = payload;
      const { detailList, pagination } = state;
      return {
        ...state,
        detailList: {
          ...detailList,
          [ruleId]: list,
        },
        pagination: {
          ...pagination,
          [ruleId]: page,
        },
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
