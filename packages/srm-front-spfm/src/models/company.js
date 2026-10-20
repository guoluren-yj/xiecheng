/**
 * model 公司
 * @date: 2018-8-24
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import {
  fetchCompany,
  fetchCompanyInfo,
  enableCompany,
  disableCompany,
  saveCurrency,
  enterpriseChange,
} from '@/services/companyService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'spfmCompany',

  state: {
    companyFormKey: '',
    companyList: [],
    pagination: {},
  },

  effects: {
    // 获取公司信息
    *fetchCompany({ payload }, { call, put }) {
      const res = yield call(fetchCompany, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            companyList: list,
          },
        });
      }
    },

    // 新获取公司信息
    *fetchCompanyInfo({ payload }, { call, put }) {
      const res = yield call(fetchCompanyInfo, payload);
      const list = getResponse(res);
      if (list) {
        const pagination = createPagination(list);
        yield put({
          type: 'saveReducers',
          payload: {
            companyList: list.content,
            pagination,
          },
        });
      }
    },

    // 设置公司启用
    *enableCompany({ payload }, { call }) {
      const res = yield call(enableCompany, payload);
      return getResponse(res);
    },

    // 设置公司禁用
    *disableCompany({ payload }, { call }) {
      const res = yield call(disableCompany, payload);
      return getResponse(res);
    },

    // 设置公司禁用
    *saveCurrency({ payload }, { call }) {
      const res = yield call(saveCurrency, payload);
      return getResponse(res);
    },
    // 平台级企业信息变更
    *handleEnterpriseChange({ payload }, { call }) {
      const res = yield call(enterpriseChange, payload);
      return getResponse(res);
    },
  },
  reducers: {
    saveReducers(state, { payload }) {
      return {
        ...state,
        ...payload,
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
