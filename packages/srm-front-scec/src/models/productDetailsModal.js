/**
 * productDetailsModal -目录映射电商商品查询 - model
 * @author LH <heng.liu@hand-china.com>
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGoodsList,
  fetchEcGoodsList,
  fetchCompanyGoodsList,
  fetchGoodsPreview,
  fetchEcGoodsPreview,
  fetchCompanyGoodsPreview,
} from '@/services/productDetailsModalService';

export default {
  namespace: 'productDetailsModal',
  state: {
    list: {},
    Eclist: {},
    companylist: {},
    pagination: {},
    Ecpagination: {},
    companypagination: {},
    detail: {},
    companydetail: {},
    Ecdetail: {},
  },
  effects: {
    // 集团商品查询
    *fetchGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchGoodsList, payload); // 异步函数
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 公司商品查询
    *fetchCompanyGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchCompanyGoodsList, payload); // 异步函数
      const companylist = getResponse(response);
      if (companylist) {
        yield put({
          type: 'updateState',
          payload: {
            companylist,
            companypagination: createPagination(companylist),
          },
        });
      }
      return companylist;
    },

    // 平台商品查询
    *fetchEcGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchEcGoodsList, payload); // 异步函数
      const Eclist = getResponse(response);
      if (Eclist) {
        yield put({
          type: 'updateState',
          payload: {
            Eclist,
            Ecpagination: createPagination(Eclist),
          },
        });
      }
      return Eclist;
    },

    // 集团商品详情
    *fetchGoodsPreview({ payload }, { call, put }) {
      const response = yield call(fetchGoodsPreview, payload); // 异步函数
      const detail = getResponse(response);
      // 将数据存储到model中
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            detail,
          },
        });
      }
    },

    // 公司商品详情
    *fetchCompanyGoodsPreview({ payload }, { call, put }) {
      const response = yield call(fetchCompanyGoodsPreview, payload); // 异步函数
      const companydetail = getResponse(response);
      // 将数据存储到model中
      if (companydetail) {
        yield put({
          type: 'updateState',
          payload: {
            companydetail,
          },
        });
      }
    },

    // 平台商品详情
    *fetchEcGoodsPreview({ payload }, { call, put }) {
      const response = yield call(fetchEcGoodsPreview, payload); // 异步函数
      const Ecdetail = getResponse(response);
      // 将数据存储到model中
      if (Ecdetail) {
        yield put({
          type: 'updateState',
          payload: {
            Ecdetail,
          },
        });
      }
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
