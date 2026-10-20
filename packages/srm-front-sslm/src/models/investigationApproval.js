/*
 * investigationApproval - 调查表审批
 * @date: 2018/10/13 10:47:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchApprovalList,
  fetchInvestigationDetail,
  handleAgree,
  handleReject,
  fetchRecordList,
  inviteRefuse,
} from '@/services/investigationApprovalService';

const tenantId = getCurrentOrganizationId();

/**
 * 调查表审批
 */
export default {
  namespace: 'investigationApproval',
  state: {
    approvalList: [],
    pagination: {},
    statusList: [], // 调查表状态
    detail: {},
    enumMap: {}, // 值集
    recordList: {}, // 调查表审批列表
    recordPagination: {}, // 调查表分页
  },
  effects: {
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          types: 'SSLM.INVESTIGATE_TYPE',
          investigateLevelCode: 'SSLM.INVESTIGATE_LEVEL',
          investigateTypeCode: 'SSLM.INVESTIGATE_TYPE',
          tenantId,
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
    // 查询列表
    *fetchApprovalList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchApprovalList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            approvalList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 查询详情
    *fetchInvestigationDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigationDetail, payload));
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
    // 同意
    *handleAgree({ payload }, { call, put }) {
      const result = getResponse(yield call(handleAgree, payload));
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
    // 调查表审批拒绝
    *handleReject({ payload }, { call, put }) {
      const result = getResponse(yield call(handleReject, payload));
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
    // 邀约拒绝
    *handleInviteRefuse({ payload }, { call }) {
      const result = getResponse(yield call(inviteRefuse, payload));
      return result;
    },
    // 查询调查表审批记录'
    *fetchRecordList({ payload }, { put, call }) {
      const res = yield call(fetchRecordList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            recordList: list,
            recordPagination: createPagination(list),
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
