/**
 * model 我发起的8D
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  search8DDetail,
  fetchAssociation,
  fetchOperatorRecord,
  fetchHistoryVersion,
  fetchSourceInfo,
  relation8D,
  fetchPurchaseOrder,
  printPage,
  fetchListPrint,
  copyQualityRectification,
  syncExternalSystem,
  save8D,
  recall,
} from '@/services/initiated8DService';
import { siteEvalReportHeader, deleteTeamMembers } from '@/services/create8DService';
import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';
import { isArray } from 'lodash';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'initiated8D',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    issueType: [], // 问题类型
    significance: [], // 重视度
    urgency: [], // 紧急程度
    rectifyTypeCode: [],
    status: [], // 问题类型
    problemSource: [], // 数据来源
    basicInfo: {}, // 基本信息
    icaActions: [], // 临时围堵措施—保证持续供货：措施内容
    causeType: [], // 原因类型
    operatorRecords: [], // 操作记录
    historyVersion: [], // 历史版本
    versionDetail: {}, // 历史版本明细
    associationList: [], // 关联8d表格
    sourceInfolist: [], // 来源信息列表
    correlationList: [], // 关联质量整改报告
    purchaseOrderList: [], // 关联采购订单
    selectedRowKeys8D: [], // 记录选中数据,不要删掉SKG二开按钮需要使用
    relatioPagination: {}, // 关联质量整改报告分页
    siteEvalReportList: [],
    siteEvalReportPage: {},
    queryParamsInfo: {}, // 记录查询条件，供二开导出之类的需求获取查询条件
  },
  effects: {
    *save8D({ payload }, { call }) {
      const result = yield call(save8D, payload);
      return getResponse(result);
    },
    // 删除小组成员
    *deleteTeamMembers({ payload }, { call }) {
      const result = yield call(deleteTeamMembers, payload);
      return getResponse(result);
    },
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
    // 查询8D
    *fetch8D({ payload }, { call, put }) {
      const result = getResponse(yield call(search8D, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
            queryParamsInfo: payload,
          },
        });
      }
    },
    // 基本信息
    *fetch8DBasicInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(search8DDetail, payload));
      if (result) {
        const { lineList = [], edProblemTeamList = [], otherDetailList = [] } = result;
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
              lineList: lineList?.map((item) => ({ ...item, _status: 'update' })),
              edProblemTeamList: edProblemTeamList.map((item) => ({ ...item, _status: 'update' })),
              otherInfoAPagination,
              otherDetailList: otherDetailList?.map((item) => ({ ...item, _status: 'update' })),
            },
          },
        });
        return result;
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

    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          issueType: 'SQAM.PROBLEM_TYPE',
          significance: 'SQAM.PROBLEM_IMPORTANCE',
          urgency: 'SQAM.PROBLEM_URGENCY',
          rectifyTypeCode: 'SQAM.RECTIFY_TYPE',
          status: 'SQAM.PROBLEM_STATUS',
          problemSource: 'SQAM.PROBLEM_SOURCE',
          icaActions: 'SQAM.ICA_ACTION',
          causeType: 'SQAM.ROOT_CAUSE_TYPE',
          zeroOneOption: 'HPFM.FLAG',
          otherItem: 'SQAM.OTHER_PROJECT',
          validateType: 'SQAM.PROBLEM_VALIDATE_RESULT',
          tenantId,
          participateNode: 'SQAM.FEEDBACK_JOIN_POINT', // 参与节点
          camp: 'SQAM.EDPROBLEM.CAMP', // 代表方
          idd: 'HPFM.IDD',
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
    // 打印
    *print({ payload }, { call }) {
      const result = getResponse(yield call(printPage, payload));
      return result;
    },
    // 批量打印
    *fetchListPrint({ payload }, { call }) {
      const res = getResponse(yield call(fetchListPrint, payload));
      return res;
    },
    *copyQualityRectification({ payload }, { call }) {
      const res = getResponse(yield call(copyQualityRectification, payload));
      return res;
    },
    // 同步
    *syncExternalSystem({ payload }, { call }) {
      const res = getResponse(yield call(syncExternalSystem, payload));
      return res;
    },
    // 撤回
    *recall({ payload }, { call }) {
      const result = yield call(recall, payload);
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
