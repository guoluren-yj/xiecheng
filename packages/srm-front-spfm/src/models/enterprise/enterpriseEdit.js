import { fetchEnterpriseInfo, queryCompanyBusiness } from '@/services/enterpriseService';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'enterpriseEdit',

  state: {
    enterprise: {},
  },

  effects: {
    *queryCompanyInfo({ payload }, { call, put }) {
      const res = yield call(fetchEnterpriseInfo, payload);
      const enterprise = getResponse(res);
      if (enterprise) {
        yield put({
          type: 'updateState',
          payload: {
            enterprise,
          },
        });
      }
      return enterprise;
    },
    *queryCompanyBusiness({ payload }, { call, put }) {
      const businessInfo = getResponse(yield call(queryCompanyBusiness, payload));
      yield put({
        type: 'updateState',
        payload: {
          businessInfo,
        },
      });
      return businessInfo;
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
