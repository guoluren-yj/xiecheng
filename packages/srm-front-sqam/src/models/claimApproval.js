import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'utils/utils';
import {
  fetchClaim,
  fetchHeader,
  fetchLines,
  approval,
  refuse,
  saveClaim,
} from '@/services/claimApprovalService';

export default {
  namespace: 'claimApproval',
  state: {
    enumMap: {}, // 值集
  },
  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          claimSource: 'SQAM.CLAIM_SOURCE_CODE',
          payMentType: 'SQAM.PAYMENT_TYPE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },
    // 索赔单列表查询
    *fetchClaim({ payload }, { call }) {
      return getResponse(yield call(fetchClaim, payload));
    },
    // 索赔单头查询
    *fetchHeader({ payload }, { call }) {
      return getResponse(yield call(fetchHeader, payload));
    },
    // 索赔单行查询
    *fetchLines({ payload }, { call }) {
      return getResponse(yield call(fetchLines, payload));
    },
    // 索赔单审批通过
    *approval({ payload }, { call }) {
      return getResponse(yield call(approval, payload));
    },
    // 索赔单审批拒绝
    *refuse({ payload }, { call }) {
      return getResponse(yield call(refuse, payload));
    },
    *saveClaim({ payload }, { call }) {
      return getResponse(yield call(saveClaim, payload));
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
