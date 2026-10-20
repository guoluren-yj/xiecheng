/**
 * model 我收到的8D
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  fetchContinueSupplier,
  fetchShortMeature,
  fetchRootReason,
  fetchCorrectActive,
  fetchApplyItem,
  fetchStandard,
} from '@/services/common8DService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();
export default {
  namespace: 'common8D',
  state: {
    continueSupplierList: [], // 保证持续供货措施列表
    continueSupplierPagination: {}, // 保证持续供货措施分页
    shortMeatureList: [], // 短期措施列表
    shortMeaturePagination: {}, // 短期措施分页
    rootReasonList: [], // 根本原因列表
    rootReasonPagination: {}, // 根本原因分页
    correctList: [], // 纠正措施列表
    correctPagination: {}, // 纠正措施分页
    applyItemList: [], // 适用项目列表
    applyItemPagination: {}, // 适用项目措施
    standardList: [], // 是否标准化列表
    standardPagination: {}, // 是否标准化分页
  },
  effects: {
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          issueType: 'SQAM.PROBLEM_TYPE',
          significance: 'SQAM.PROBLEM_IMPORTANCE',
          urgency: 'SQAM.PROBLEM_URGENCY',
          status: 'SQAM.PROBLEM_STATUS',
          problemSource: 'SQAM.PROBLEM_SOURCE',
          icaActions: 'SQAM.ICA_ACTION',
          causeType: 'SQAM.ROOT_CAUSE_TYPE',
          zeroOneOption: 'HPFM.FLAG',
          tenantId,
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
      }
    },

    /**
     * 保证持续供货措施
     */
    *fetchContinueSupplier({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchContinueSupplier, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            continueSupplierList: result.content.map((item) => ({ _status: 'update', ...item })),
            continueSupplierPagination: createPagination(result),
          },
        });
      }
    },

    /**
     * 短期措施
     */
    *fetchShortMeature({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchShortMeature, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            shortMeatureList: result.content.map((item) => ({ _status: 'update', ...item })),
            shortMeaturePagination: createPagination(result),
          },
        });
      }
    },

    /**
     * 根本原因分析
     */
    *fetchRootReason({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchRootReason, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            rootReasonList: result.content.map((item) => ({ _status: 'update', ...item })),
            rootReasonPagination: createPagination(result),
          },
        });
      }
    },

    /**
     * 永久纠正措施
     */
    *fetchCorrectActive({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchCorrectActive, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            correctList: result.content.map((item) => ({ _status: 'update', ...item })),
            correctPagination: createPagination(result),
          },
        });
      }
    },

    /**
     * 是否适用以下项目
     */
    *fetchApplyItem({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchApplyItem, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            applyItemList: result.content.map((item) => ({ _status: 'update', ...item })),
            applyItemPagination: createPagination(result),
          },
        });
      }
    },

    /**
     * 相关标准化
     */
    *fetchStandard({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchStandard, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            standardList: result.content.map((item) => ({ _status: 'update', ...item })),
            standardPagination: createPagination(result),
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
