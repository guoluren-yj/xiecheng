import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse, createPagination } from 'utils/utils';
import {
  createClaim,
  fetchClaim,
  deleteLines,
  fetchHeader,
  fetchLines,
  deleteClaim,
  submitClaim,
  bindUUID,
  create,
  userID,
  fetchQuoteData,
  createClaimByInspection,
  queryAmountMaintenanceMode,
  submitValidate,
  userIDDefault,
} from '@/services/createClaimService';

export default {
  namespace: 'createClaim',

  state: {
    quoteTrxList: [],
    quoteTrxPage: {}, // 引用检验单分页信息
    enumMap: {}, // 值集
    pagination: {},
  },
  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          claimSource: 'SQAM.CLAIM_SOURCE_CODE',
          payMentType: 'SQAM.PAYMENT_TYPE',
          decisionResult: 'SQAM.DECISION_RESULT', // 决策结果
          inspectionType: 'SQAM.INSPECTION_TYPE', // 检验类型
          dateRangeList: 'SQAM.DATE_RANGE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },
    // 索赔单保存/新建
    *createClaim({ payload }, { call }) {
      return getResponse(yield call(createClaim, payload));
    },
    // 新增
    *create({ payload }, { call }) {
      return getResponse(yield call(create, payload));
    },
    // 索赔单列表查询
    *fetchClaim({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClaim, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 索赔单行删除
    *deleteLine({ payload }, { call }) {
      return getResponse(yield call(deleteLines, payload));
    },
    // 索赔单头查询
    *fetchHeader({ payload }, { call }) {
      return getResponse(yield call(fetchHeader, payload));
    },
    // 索赔单行查询
    *fetchLines({ payload }, { call }) {
      return getResponse(yield call(fetchLines, payload));
    },
    // 索赔单删除
    *deleteClaim({ payload }, { call }) {
      return getResponse(yield call(deleteClaim, payload));
    },
    // 索赔单提交
    *submitClaim({ payload }, { call }) {
      return getResponse(yield call(submitClaim, payload));
    },
    // 绑定uuid
    *bindUUID({ payload }, { call }) {
      return getResponse(yield call(bindUUID, payload));
    },
    // 新增
    *userID({ payload }, { call }) {
      return getResponse(yield call(userID, payload));
    },
    *userIDDefault({ payload }, { call }) {
      return getResponse(yield call(userIDDefault, payload));
    },

    // 查询引用检验单数据
    *fetchQuoteData({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchQuoteData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quoteTrxList: res.content,
            quoteTrxPage: createPagination(res),
          },
        });
      }
    },

    // 查询引用检验单数据
    *createClaimByInspection({ payload }, { call }) {
      const res = getResponse(yield call(createClaimByInspection, payload));
      return res;
    },
    // 查询业务规则定义
    *queryAmountMaintenanceMode({ payload }, { call }) {
      const res = getResponse(yield call(queryAmountMaintenanceMode, payload));
      return res;
    },
    // 提交二次校验
    *submitValidate({ payload }, { call }) {
      return getResponse(yield call(submitValidate, payload));
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
