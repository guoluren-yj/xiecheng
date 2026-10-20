import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import {
  updateBusiness,
  createBusiness,
  fetchIndustries,
  fetchIndustryCategories,
  queryCompanyBusiness,
  fetchShield,
} from '@/services/businessService';
import { queryIdpValue } from 'hzero-front/lib/services/api';

// 打平树形数组
function smoothingArray(industryCategories = []) {
  if (!isEmpty(industryCategories)) {
    const list = industryCategories.map((o) => o.children);
    const arr = []; // 打平后的数组
    for (let j = 0; j < list.length; j++) {
      if (list[j]) {
        for (let i = 0; i < list[j].length; i++) {
          arr.push(list[j][i].categoryId);
        }
      }
    }
    return arr;
  }
}

export default {
  namespace: 'enterpriseBusiness',

  state: {
    businessInfo: {},
    industries: [],
    servicesAreas: [],
    industryCategories: [],
  },

  effects: {
    *init({ payload }, { call, put }) {
      const industries = getResponse(yield call(fetchIndustries, payload));
      const servicesAreas = getResponse(yield call(queryIdpValue, 'SPFM.COMPANY.SERVICE_AREA'));
      yield put({
        type: 'updateState',
        payload: {
          industries,
          servicesAreas,
        },
      });
    },

    *queryCompanyBusiness({ payload }, { call, put }) {
      const businessInfo = getResponse(yield call(queryCompanyBusiness, payload));
      yield put({
        type: 'updateState',
        payload: {
          businessInfo,
        },
      });
    },

    *fetchIndustryCategories({ payload }, { call, put }) {
      const industryCategories = getResponse(yield call(fetchIndustryCategories, payload));
      yield put({
        type: 'updateState',
        payload: {
          industryCategories,
          industryAllCategoryList: smoothingArray(industryCategories),
        },
      });
      return smoothingArray(industryCategories);
    },

    *createBusiness({ payload }, { call }) {
      const response = yield call(createBusiness, payload);
      return getResponse(response);
    },

    *updateBusiness({ payload }, { call }) {
      const response = yield call(updateBusiness, payload);
      return getResponse(response);
    },

    *fetchShieldSetting({ payload }, { call }) {
      const response = yield call(fetchShield, payload);
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
