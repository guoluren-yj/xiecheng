/*
 * investigationWrite - 调查表填写
 * @date: 2018/10/13 11:05:42
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchWriteList,
  fetchReceivedInvestigationDetail,
  handlePrint,
  fetchPrivacyPolicy,
  fetchPrivacyPolicyText,
  handleExcelPrint,
  fetchSinglePrivacyPolicyText,
  saveOperatorInfo,
} from '@/services/investigationWriteService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'investigationWrite',

  state: {
    investigationList: [], // 调查表列表
    pagination: {},
    investigateTypes: [], // 调查表类型
    processStatusList: [], // 状态列表
    detail: {},
    privacyPolicyText: [], // 存储静态文件
    printType: [], // 打印类型
  },

  effects: {
    // 查询列表
    *fetchWriteList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchWriteList, payload));
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
    *init(params, { call, put }) {
      const lovCode = {
        inviteTypeCode: 'SSLM.INVESTIGATE_TYPE',
        statusCode: 'SSLM.INVESTIGATE_STATUS',
        investigateLevelCode: 'SSLM.INVESTIGATE_LEVEL',
        printType: 'SSLM_INVESTIGATE_PRINT_CODE',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            printType: res.printType,
            investigateTypes: res.inviteTypeCode,
            processStatusList: res.statusCode.filter(
              n => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value)
            ),
            investigateLevelList: res.investigateLevelCode,
          },
        });
      }
    },
    // 查询详情
    *fetchReceivedInvestigationDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReceivedInvestigationDetail, payload));
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
    // pdf打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
    },
    // excel打印
    *handleExcelPrint({ payload }, { call }) {
      const res = getResponse(yield call(handleExcelPrint, payload));
      return res;
    },
    // 查询采购方是否启用隐私政策
    *fetchPrivacyPolicy({ payload }, { call }) {
      const res = getResponse(yield call(fetchPrivacyPolicy, payload));
      return res;
    },
    // 查询隐私政策详细
    *fetchPrivacyPolicyText({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchPrivacyPolicyText, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            privacyPolicyText: res || [],
          },
        });
      }
    },
    // 查询平台静态文本
    *fetchPlatformPolicyText({ payload }, { call }) {
      const res = yield call(fetchSinglePrivacyPolicyText, payload);
      return getResponse(res);
    },
    // 保存操作人信息
    *saveOperatorInfo({ payload }, { call }) {
      const response = yield call(saveOperatorInfo, payload);
      const res = getResponse(response);
      return res;
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
