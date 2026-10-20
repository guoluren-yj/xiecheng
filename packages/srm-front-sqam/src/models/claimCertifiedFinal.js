/*
 * @Description: 索赔单最终确认models
 * @Date: 2020-05-12 11:28:56
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  // searchMyClaimForm,
  // searchMyClaimFormDetail,
  // fetchMyClaimForm,
  fetchMyClaim,
  searchDetail,
  print,
  fetchOperationRecord,
  fetchClaimProject,
  saveResultExc,
  submitResultExc,
} from '@/services/claimCertifiedFinalService';
// import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';

export default {
  namespace: 'claimCertifiedFinal',
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
    // 详情保存
    *saveResultExc({ payload }, { call }) {
      const res = getResponse(yield call(saveResultExc, payload));
      return res;
    },
    // 详情提交
    *submitResultExc({ payload }, { call }) {
      const res = getResponse(yield call(submitResultExc, payload));
      return res;
    },

    *searchMyClaimForm({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMyClaim, payload));
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
            lineDetail: result.content?.map((item) => ({ _status: 'update', ...item })),
            linePagiation: createPagination(result),
          },
        });
      }
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
