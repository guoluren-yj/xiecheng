/**
 * deliveryCompanySupplier - 配置中心-收货单审批规则-公司定义列表tab-modal
 * @date: 2020-6-2
 * @author: JingChen <jing.chen06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchCompanyModalData,
  fetchSupplierModalData,
  saveCompanyModalData,
  fetchCompaynyData,
  deleteCompanyData,
} from '../services/deliveryCompanyService';

export default {
  namespace: 'deliveryCompanySupplier',

  state: {
    companyModalData: [],
    companyModalDataPagination: {},
    supplierModalData: [],
    supplierModalDataPagination: {},
  },

  effects: {
    // 查询当前账号下的公司信息
    *fetchCompanyModalData({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchCompanyModalData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            companyModalData: res.content,
            companyModalDataPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 查询当前账号下的供应商信息
    *fetchSupplierModalData({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchSupplierModalData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierModalData: res.content,
            supplierModalDataPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 保存当前账号下的公司信息
    *saveCompanyModalData({ payload }, { call }) {
      const res = getResponse(yield call(saveCompanyModalData, payload));
      return res;
    },
    // 查询已选择的公司信息
    *fetchCompaynyData({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchCompaynyData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            companyData: res.content,
            companyDataPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 删除已选择的公司信息
    *deleteCompanyData({ payload }, { call }) {
      const res = getResponse(yield call(deleteCompanyData, payload));
      return res;
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
