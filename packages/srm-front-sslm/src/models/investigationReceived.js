/*
 * investigationReceived - 我收到的调查表
 * @date: 2018/10/13 10:51:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchReceivedList,
  fetchReceivedInvestigationDetail,
} from '@/services/investigationReceivedService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'investigationReceived',

  state: {
    investigationList: [], // 调查表列表
    pagination: {},
    investigateTypes: [], // 调查表类型
    processStatusList: [], // 状态列表
    investigateLevelList: [], // 调查表管控制度
    detail: {},
  },

  effects: {
    // 查询列表
    *fetchReceivedList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReceivedList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            investigationList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 查询值集
    *init(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SSLM.INVESTIGATE_TYPE',
        statusCode: 'SSLM.INVESTIGATE_STATUS',
        investigateLevelCode: 'SSLM.INVESTIGATE_LEVEL',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            investigateTypes: res.inviteTypeCode,
            processStatusList: res.statusCode.filter(
              (n) => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value)
            ),
            investigateLevelList: res.investigateLevelCode,
          },
        });
      }
    },
    // 查询详情
    *fetchReceivedInvestigationDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReceivedInvestigationDetail, payload));
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
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
