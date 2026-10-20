import { getResponse } from 'utils/utils';
import { fetchEnterpriseInfo, checkBankAccount } from '@/services/enterpriseService';
import { enterpriseChange } from '@/services/companyService';

export default {
  namespace: 'approvalPreview',

  state: {
    previewDetail: {},
  },

  effects: {
    *fetchPreviewDetail({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchEnterpriseInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            previewDetail: res,
          },
        });
      }
    },
    *checkBankAccount({ payload }, { call }) {
      const res = getResponse(yield call(checkBankAccount, payload));
      return res;
    },
    // 平台级企业信息变更
    *handleEnterpriseChange({ payload }, { call }) {
      const res = yield call(enterpriseChange, payload);
      return getResponse(res);
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
