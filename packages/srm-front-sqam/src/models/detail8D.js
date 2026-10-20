/**
 * model 我收到的8D
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  search8DDetail,
  // fetchAssociation,
  fetchOperatorRecord,
  fetchHistoryVersion,
  fetchAssociation,
} from '@/services/detail8DService';
import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'detail8D',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    issueType: [], // 问题类型
    significance: [], // 重视度
    urgency: [], // 紧急程度
    status: [], // 问题类型
    // basicInfo: {}, // 8D详情页：基本信息
    rootCause: {}, // 根本原因
    // historyVersion: [], // 历史版本
    // operatorRecords: [], // 操作记录
    // associationList: [], // 关联8d表格
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
    // 查询8D
    *fetch8D({ payload }, { call, put }) {
      let result = yield call(search8D, payload);
      result = getResponse(result);
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
    *fetch8DBasicInfo({ payload }, { call }) {
      const result = yield call(search8DDetail, payload);
      return getResponse(result);
    },
    // 操作记录查询
    *fetchOperatorRecord({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperatorRecord, payload));
      return result;
      // if (result) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       operatorRecords: result,
      //     },
      //   });
      // }
    },
    // 历史版本查询
    *fetchHistoryVersion({ payload }, { call }) {
      const result = getResponse(yield call(fetchHistoryVersion, payload));
      return result;
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
    *fetchAssociation({ payload }, { call }) {
      const result = yield call(fetchAssociation, payload);
      return result;
      // if (result) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       associationList: result,
      //     },
      //   });
      // }
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
