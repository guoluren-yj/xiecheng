/**
 * model 8D审核
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  searchAllDetail,
  submitAskPca,
  submitCompleted8D,
  submitAuditReject,
  submitAbandon,
  fetchHistoryVersion,
  fetchOperatorRecord,
  fetchAssociation,
  save8D,
  relation8D,
  fetchSourceInfo,
  fetchPurchaseOrder,
  saveUUID,
  updateTime,
  siteInvestigateReport,
} from '@/services/audit8DService';
import { siteEvalReportHeader, delDproblemheaderdetaillines } from '@/services/create8DService';
import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';
import { isArray } from 'lodash';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'audit8D',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    historyVersion: [], // 历史版本
    operatorRecords: [], // 操作记录
    issueType: [], // 问题类型
    significance: [], // 重视度
    rectifyTypeCode: [],
    urgency: [], // 紧急程度
    status: [], // 8D状态
    causeType: [], // 根本原因类型
    icaActions: [], // 措施内容
    zeroOneOption: [], // 是|否| 值集
    basicInfo: {}, // 详情页信息
    associationList: [], // 关联8d表格
    sourceInfolist: [], // 来源信息列表
    purchaseOrderList: [], // 关联采购订单
    correlationList: [], // 关联质量整改报告
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
    // 保存
    *save8D({ payload }, { call }) {
      const result = yield call(save8D, payload);
      return getResponse(result);
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
    // 历史版本查询
    *fetchHistoryVersion({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchHistoryVersion, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyVersion: result.content,
          },
        });
      }
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
    // 获取8D详情数据
    *fetch8DBasicInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(searchAllDetail, payload));
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
              lineList: lineList.map((item) => ({ ...item, _status: 'update' })),
              otherInfoPagination,
              otherInfoAPagination,
              otherDetailList: otherDetailList.map((item) => ({ ...item, _status: 'update' })),
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

    // 获取lov
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          issueType: 'SQAM.PROBLEM_TYPE',
          significance: 'SQAM.PROBLEM_IMPORTANCE',
          rectifyTypeCode: 'SQAM.RECTIFY_TYPE',
          urgency: 'SQAM.PROBLEM_URGENCY',
          status: 'SQAM.PROBLEM_STATUS',
          problemSource: 'SQAM.PROBLEM_SOURCE',
          causeType: 'SQAM.ROOT_CAUSE_TYPE',
          icaActions: 'SQAM.ICA_ACTION',
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
    // 继续反馈PCA
    *continuePca(payload, { call }) {
      const result = yield call(submitAskPca, payload);
      return getResponse(result);
    },
    // 完成8D
    *completed8D(payload, { call }) {
      const result = yield call(submitCompleted8D, payload);
      return getResponse(result);
    },
    // 审批拒绝
    *auditReject(payload, { call }) {
      const result = yield call(submitAuditReject, payload);
      return getResponse(result);
    },
    // 废弃8D
    *abandon(payload, { call }) {
      const result = yield call(submitAbandon, payload);
      return getResponse(result);
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
    // 保存附件UUID
    *saveUUID({ payload }, { call }) {
      const result = yield call(saveUUID, payload);
      return getResponse(result);
    },
    // 时间调整
    *updateTime({ payload }, { call }) {
      const result = yield call(updateTime, payload);
      return getResponse(result);
    },

    // 现场考察单
    *siteInvestigateReport({ payload }, { call, put }) {
      const res = getResponse(yield call(siteInvestigateReport, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            siteInvestigateReportList: res.content,
            siteInvestigateReportPage: createPagination(res),
          },
        });
      }
    },
    *delDproblemheaderdetaillines({ payload }, { call }) {
      const result = yield call(delDproblemheaderdetaillines, payload);
      return getResponse(result);
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
