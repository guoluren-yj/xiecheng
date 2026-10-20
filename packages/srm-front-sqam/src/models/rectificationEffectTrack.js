/**
 * model 质改成效追踪
 * @date: 2020-5-14
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  search8DDetail,
  fetchSourceInfo,
  relation8D,
  update8D,
  completeTrack,
  fetchOperatorRecord,
  fetchAssociation,
  fetchPurchaseOrder,
} from '@/services/rectificationEffectTrackService';
import { siteEvalReportHeader } from '@/services/create8DService';
import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';
import { isArray } from 'lodash';

export default {
  namespace: 'rectificationEffectTrack',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    issueType: [], // 问题类型
    significance: [], // 重视度
    urgency: [], // 紧急程度
    status: [], // 问题类型
    rectifyTypeCode: [],
    basicInfo: {}, // 8D详情页：基本信息
    rootCause: {}, // 根本原因
    historyVersion: [], // 历史版本
    operatorRecords: [], // 操作记录
    associationList: [], // 关联8d表格
    sourceInfolist: [], // 来源信息列表
    correlationList: [],
    problemSource: [], // 数据来源
    relatioPagination: {}, // 关联质量整改报告分页
    siteEvalReportList: [],
    siteEvalReportPage: {},
  },
  effects: {
    *siteEvalReportHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(siteEvalReportHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            siteEvalReportList: res.content,
            siteEvalReportPage: createPagination(res),
          },
        });
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          problemSource: 'SQAM.PROBLEM_SOURCE',
          issueType: 'SQAM.PROBLEM_TYPE', // 问题类型
          significance: 'SQAM.PROBLEM_IMPORTANCE', // 重视度
          urgency: 'SQAM.PROBLEM_URGENCY', // 紧急度
          status: 'SQAM.PROBLEM_STATUS',
          actions: 'SQAM.PROBLEM_VALIDATE_RESULT',
          rectifyTypeCode: 'SQAM.RECTIFY_TYPE',
          tenantId: getCurrentOrganizationId(),
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

    // 查询8D
    *fetch8D({ payload }, { call, put }) {
      const { problemStatus, ...payloads } = payload;
      const result = getResponse(yield call(search8D, payloads));
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

    // 基本信息
    *fetch8DBasicInfo({ payload }, { call, put }) {
      let result = yield call(search8DDetail, payload);
      result = getResponse(result);
      if (result) {
        const { lineList = [], otherDetailList = [] } = result;
        const otherInfoPagination = {
          empty: true,
          needCountFlag: null,
          number: 0,
          numberOfElements: 0,
          size: lineList.length < 10 ? 10 : lineList.length,
          totalElements: 0,
          totalPages: lineList.length,
        };
        const otherInfoAPagination = {
          empty: true,
          needCountFlag: null,
          number: 0,
          numberOfElements: 0,
          size: otherDetailList.length < 10 ? 10 : otherDetailList.length,
          totalElements: 0,
          totalPages: otherDetailList.length,
        };
        yield put({
          type: 'updateState',
          payload: {
            basicInfo: {
              ...result,
              otherInfoPagination,
              otherInfoAPagination,
            },
          },
        });
      }
    },

    // 查询来源信息
    *fetchSourceInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchSourceInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sourceInfolist: result,
          },
        });
      }
    },
    // 关联8D
    *relation8D({ payload }, { call, put }) {
      let result = yield call(relation8D, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            correlationList: isArray(result) ? result : result.content,
            relatioPagination: createPagination(result),
          },
        });
      }
    },

    // 更新8D
    *update8D({ payload }, { call }) {
      const result = yield call(update8D, payload);
      return getResponse(result);
    },

    *completeTrack({ payload }, { call }) {
      const result = yield call(completeTrack, payload);
      return getResponse(result);
    },
    // 操作记录查询
    *fetchOperatorRecord({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchOperatorRecord, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operatorRecords: result,
          },
        });
      }
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 关联8D
    *fetchAssociation({ payload }, { call, put }) {
      const result = yield call(fetchAssociation, payload);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            associationList: result,
          },
        });
      }
    },
    // 查询关联采购订单
    *fetchPurchaseOrder({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPurchaseOrder, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseOrderList: result,
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
