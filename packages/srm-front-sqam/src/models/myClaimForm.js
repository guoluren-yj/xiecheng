import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  // searchMyClaimForm,
  // searchMyClaimFormDetail,
  // fetchMyClaimForm,
  myClaimFormSync,
  fetchMyClaim,
  searchDetail,
  print,
  fetchOperationRecord,
  fetchClaimProject,
  reCallMyClaim,
  myClaimFormSyncExternal,
  myClaimFormCancel,
  myClaimAdjustTime,
} from '@/services/myClaimFormService';
// import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';

export default {
  namespace: 'myClaimForm',
  state: {
    list: [], // myClaimForm 数据列表
    pagination: {}, // 分页信息
    detail: {}, // myClaimForm 详情
    operateRecord: {},
    lineDetail: [], // 索赔单详情页项目列表数据
    linePagiation: {},
    enumMap: {},
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          statusValue: 'SQAM.CLAIM_STATUS_CODE',
          syncStatus: 'SQAM.CLAIM_SYNC_STATUS',
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

    *searchMyClaimForm({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMyClaim, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content?.map((item) => ({ _status: 'update', ...item })),
            pagination: createPagination(result),
          },
        });
      }
    },

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

    *fetchOperationRecord({ payload }, { call, put }) {
      let result = yield call(fetchOperationRecord, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            formHeaderId: result,
          },
        });
      }
      return result;
    },

    *fetchClaimProject({ payload }, { call, put }) {
      let result = yield call(fetchClaimProject, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            lineDetail: result.content,
            linePagiation: createPagination(result),
          },
        });
      }
    },
    // 撤回
    *reCallMyClaim({ payload }, { call }) {
      return getResponse(yield call(reCallMyClaim, payload));
    },
    // -操作记录
    *myClaimFormSync({ payload }, { call }) {
      const response = getResponse(yield call(myClaimFormSync, payload));
      return response;
    },
    // 同步外部系统
    *myClaimFormSyncExternal({ payload }, { call }) {
      const response = getResponse(yield call(myClaimFormSyncExternal, payload));
      return response;
    },
    *myClaimFormCancel({ payload }, { call }) {
      const response = getResponse(yield call(myClaimFormCancel, payload));
      return response;
    },
    *myClaimAdjustTime({ payload }, { call }) {
      const response = getResponse(yield call(myClaimAdjustTime, payload));
      return response;
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
