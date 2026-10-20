/*
 * investigationDetailMaintain - 调查表明细维护
 * @date: 2018/10/13 10:39:06
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchInvestigationDetail,
  handleRelease,
  handleDelete,
  handleSave,
} from '@/services/investigationDetailMaintainService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

/**
 * 调查表明细维护
 */
export default {
  namespace: 'investigationDetailMaintain',
  state: {
    detail: {}, // 明细数据
    investigateTypes: [], // 调查表类型
    processStatusList: [], // 调查表状态列表
  },
  effects: {
    // 查询值集
    *initCode(params, { call, put }) {
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
    },
    // 发布
    *handlerRelease({ payload }, { call, put }) {
      const result = getResponse(yield call(handleRelease, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return getResponse(result);
    },
    // 删除
    *handlerDeleteInvestigation({ payload }, { call }) {
      const result = yield call(handleDelete, payload);
      return getResponse(result);
    },
    // 保存
    *handlerSaveInvestigation({ payload }, { call, put }) {
      const result = getResponse(yield call(handleSave, payload));
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
