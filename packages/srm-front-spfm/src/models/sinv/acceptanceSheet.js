/**
 * acceptanceSheet.js - 验收单配置
 * @date: 2019-11-20
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryCompany,
  querySupplierOrItem,
  queryDetailSupplierOrItem,
  saveSupplier,
  deleteSupplier,
  queryHeader,
} from '@/services/sinv/acceptanceSheetService';

export default {
  namespace: 'acceptanceSheet',

  state: {
    checkCompanyList: [], // 公司列表
    checkCompanyListPagination: {}, // 公司列表分页
    checkSupplierList: [], // 供应商
    checkItemList: [], // 物料
    checkSupplierPagination: {}, // 供应商分页
    checkItemPagination: {}, // 物料分页
    supplierDetailList: [],
    supplierDetailPagination: {},
    itemDetailList: [],
    itemDetailPagination: {},
    supplierHeader: {},
    itemHeader: {},
  },

  effects: {
    // 查询公司lov值集  sql-data
    *queryCompany({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCompany, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            checkCompanyList: res.content,
            checkCompanyListPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询供应商
    *querySupplier({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierOrItem, payload));
      const pagination = createPagination(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            checkSupplierList: res.content,
            checkSupplierPagination: pagination,
          },
        });
      }
      return res;
    },

    // 查询物料
    *queryItem({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierOrItem, payload));
      const pagination = createPagination(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            checkItemList: res.content,
            checkItemPagination: pagination,
          },
        });
      }
      return res;
    },

    // 查询供应商详情
    *querySupplierDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(queryDetailSupplierOrItem, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDetailList: res.content,
            supplierDetailPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询物料详情
    *queryItemDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(queryDetailSupplierOrItem, payload));
      const pagination = createPagination(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            itemDetailList: res.content,
            itemDetailPagination: pagination,
          },
        });
      }
      return res;
    },
    // 查询供应商头
    *querySupplierHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(queryHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierHeader: res,
          },
        });
      }
      return res;
    },

    // 查询物料头
    *queryItemHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(queryHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            itemHeader: res,
          },
        });
      }
      return res;
    },

    // 保存供应商|| 物料
    *saveSupplier({ payload }, { call }) {
      const response = yield call(saveSupplier, payload);
      return getResponse(response);
    },
    // 保存供应商|| 物料
    *deleteSupplier({ payload }, { call }) {
      const response = yield call(deleteSupplier, payload);
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
