import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  searchDetail,
  print,
  fetchOperationRecord,
  fetchClaimProject,
  fetchReceivedClaim,
  reCallMyReceivedClaim,
} from '@/services/myReceivedClaimFormService';

export default {
  namespace: 'myReceivedClaimForm',
  state: {
    list: [], // myClaimForm 数据列表
    pagination: {}, // 分页信息
    operateRecord: {},
    detail: {}, // myClaimForm 详情
    claimProjectDetail: [],
    linePagiation: {},
    enumMap: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          statusValue: 'SQAM.CLAIM_STATUS_CODE',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    // 详情页打印
    *print({ formHeaderId }, { call }) {
      const res = getResponse(yield call(print, formHeaderId));
      return res;
    },

    // 入口查询
    *fetchReceivedClaim({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReceivedClaim, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    // 详情页面头查询
    *fetchDetail({ payload }, { call, put }) {
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },

    // 操作记录查询
    *fetchOperationRecord({ payload }, { call, put }) {
      let result = yield call(fetchOperationRecord, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operateRecord: result,
          },
        });
      }
      return result;
    },

    // 详情页面行查询
    *fetchClaimProject({ payload }, { call, put }) {
      let result = yield call(fetchClaimProject, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            claimProjectDetail: result.content,
            linePagiation: createPagination(result),
          },
        });
      }
    },
    // 撤回
    *reCallMyReceivedClaim({ payload }, { call }) {
      return getResponse(yield call(reCallMyReceivedClaim, payload));
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
