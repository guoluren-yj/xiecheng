/**
 * model 8D反馈
 * @date: 2018-11-27
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  search8DDetail,
  fetchHistoryVersion,
  fetchApprovalOpinion,
  save8D,
  submit8D,
  saveUUID,
  removeMembers,
  relation8D,
  getEdit,
  fetchSourceInfo,
  fetchPurchaseOrder,
} from '@/services/feedback8DService';
import {
  siteEvalReportHeader,
  delDproblemheaderdetaillines,
  delDproblemheaderdetaillinesA,
} from '@/services/create8DService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';
import { isEmpty, isArray } from 'lodash';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'feedback8D',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    issueType: [], // 问题类型
    significance: [], // 重视度
    urgency: [], // 紧急程度
    rectifyTypeCode: [],
    status: [], // 8D状态
    causeType: [], // 根本原因类型
    icaActions: [], // 措施内容
    zeroOneOption: [], // 是|否| 值集
    problemSource: [], // 8D故障单数据来源
    basicInfo: {}, // 详情数据
    historyVersion: [], // 历史版本
    approvalList: [], // 审批意见
    basicHisInfo: {}, // 历史详情数据
    correlationList: [], // 关联8D列表数据
    sourceInfolist: [], // 来源信息列表
    purchaseOrderList: [], // 关联采购订单
    relatioPagination: {}, // 关联质量整改报告分页
    lineList: [],
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
          issueType: 'SQAM.PROBLEM_TYPE',
          significance: 'SQAM.PROBLEM_IMPORTANCE',
          urgency: 'SQAM.PROBLEM_URGENCY',
          status: 'SQAM.PROBLEM_STATUS',
          rectifyTypeCode: 'SQAM.RECTIFY_TYPE',
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
    // 基本信息
    *fetch8DBasicInfo({ payload }, { call, put }) {
      let result = yield call(search8DDetail, payload);
      result = getResponse(result);
      if (result) {
        const { edProblemTeamList, lineList = [], otherDetailList = [] } = result;
        const newLineList = lineList.map((item) => ({
          ...item,
          _status: 'update',
        }));
        const newLineListA = otherDetailList.map((item) => ({
          ...item,
          _status: 'update',
        }));
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
              edProblemTeamList: edProblemTeamList.map((item) => ({ ...item, _status: 'update' })),
              lineList: newLineList,
              otherInfoAPagination,
              otherDetailList: newLineListA,
            },
          },
        });
      }
    },
    // 保存
    *save8D({ payload }, { call }) {
      const result = yield call(save8D, payload);
      return getResponse(result);
    },
    // 提交
    *submit8D({ payload }, { call }) {
      const result = yield call(submit8D, payload);
      return getResponse(result);
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
    // 审批意见
    *fetchApprovalOpinion({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchApprovalOpinion, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            approvalList: result,
          },
        });
      }
    },
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 保存附件UUID
    *saveUUID({ payload }, { call }) {
      const result = yield call(saveUUID, payload);
      return getResponse(result);
    },
    // 删除8D故障处理小组
    *removeGroupMem({ payload }, { call }) {
      const result = yield call(removeMembers, payload);
      return getResponse(result);
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
    *getEdit({ payload }, { call, put }) {
      let result = yield call(getEdit, payload);
      result = getResponse(result);
      if (result) {
        result = result.filter((item) => !isEmpty(item));
        yield put({
          type: 'updateState',
          payload: {
            getEdit: result,
          },
        });
      }
    },
    *delDproblemheaderdetaillines({ payload }, { call }) {
      const result = yield call(delDproblemheaderdetaillines, payload);
      return getResponse(result);
    },
    *delDproblemheaderdetaillinesA({ payload }, { call }) {
      const result = yield call(delDproblemheaderdetaillinesA, payload);
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
