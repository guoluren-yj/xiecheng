/**
 * model 8D创建
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  search8D,
  release8D,
  delete8D,
  searchDetail,
  searchDetail1,
  save8D,
  update8D,
  saveUUID,
  relation8D,
  saveRelation8D,
  deleteRelation8D,
  fetchAddRelation8D,
  queryTeamMembers,
  queryParentCode,
  deleteTeamMembers,
  fetchQuoteData,
  quoteAndCreate,
  fetchSourceInfo,
  deleteSourceInfo,
  fetchIncomingSearch,
  fetchPurchaseOrder,
  savePurchaseOrder,
  delPurchaseOrder,
  fetchLovSql,
  selectCreate8DConfig,
  fetchTrxHeader,
  fetchTrxHeaderSupplier,
  trxQuoteAndCreate,
  siteInvestigateReport,
  userID,
  searchCreateDetail,
  delDproblemheaderdetaillines,
  delDproblemheaderdetaillinesA,
  siteEvalReportHeader,
} from '@/services/create8DService';
import { queryList } from '@/services/evaluationQueryService';
import { queryMapIdpValue, removeFileOrg, queryFileListOrg } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'create8D',
  state: {
    list: [], // 8D数据列表
    pagination: {}, // 分页信息
    detail: {}, // 8D详情
    issueType: [], // 问题类型
    significance: [], // 重视度
    urgency: [], // 紧急程度
    rectifyTypeCode: [], // 整改单类型
    defectType: [], // 缺陷类型
    quoteList: [], // 引用检验单列表数据
    quotePage: {}, // 引用检验单分页信息
    sourceInfolist: [], // 来源信息列表
    purchaseOrderList: [], // 关联采购订单
    quoteTrxList: [], // 引用检验单列表数据
    quoteTrxPage: {}, // 引用检验单分页信息
    siteInvestigateReportPage: {}, // 现场考察单
    siteInvestigateReportList: [], // 现场考察单列表数据
    evalDataSource: [], // 年度考评结果列表
    relation8DPagination: {}, // 关联质量整改报告分页
    // evalPagination: {}, // 分页器
    siteEvalReportList: [],
    siteEvalReportPage: {},
    selectedRows: [],
  },
  effects: {
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
            detail: {},
          },
        });
      }
    },
    // 8D详情
    *fetchDetail({ payload }, { call, put }) {
      const {congratulationUnitCode,...rest} = payload;
      const newResult = yield call(searchCreateDetail, {
        ...rest,
        customizeUnitCode: congratulationUnitCode,
      });
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      if (result) {
        const { lineList = [], otherDetailList = [] } = result;
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
          size: newLineList.length < 10 ? 10 : newLineList.length,
          totalElements: 0,
          totalPages: newLineList.length,
        };
        const otherInfoPaginationA = {
          empty: true,
          needCountFlag: null,
          number: 0,
          numberOfElements: 0,
          size: newLineListA.length < 10 ? 10 : newLineListA.length,
          totalElements: 0,
          totalPages: newLineListA.length,
        };
        yield put({
          type: 'updateState',
          payload: {
            detail: {
              ...result,
              lineList: newLineList,
              otherInfoPagination: createPagination(otherInfoPagination),
              otherInfoAPagination: createPagination(otherInfoPaginationA),
              edProblemAction: newResult.edProblemAction,
              otherDetailList: newLineListA,
            },
          },
        });
      }
    },
    // 8D详情
    *changeDetail({ payload }, { call, put }) {
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      if (result) {
        const { sourceDocNum, objectVersionNumber } = result;
        yield put({
          type: 'updateStateValue',
          payload: {
            sourceDocNum,
            objectVersionNumber,
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
    // 查询上传平台配置
    *fetchUploadInfo({ payload }, { call }) {
      let result = yield call(searchDetail1, payload);
      result = getResponse(result);
      return result;
    },
    // 发布8D
    *release8D({ payload }, { call }) {
      const result = yield call(release8D, payload);
      return getResponse(result);
    },
    // 删除8D
    *delete8D({ payload }, { call }) {
      const result = yield call(delete8D, payload);
      return getResponse(result);
    },
    // 保存8D
    *save8D({ payload }, { call }) {
      const result = yield call(save8D, payload);
      return getResponse(result);
    },
    // 更新8D
    *update8D({ payload }, { call }) {
      const result = yield call(update8D, payload);
      return getResponse(result);
    },
    // 保存附件UUID
    *saveUUID({ payload }, { call }) {
      const result = yield call(saveUUID, payload);
      return getResponse(result);
    },
    // 查询关联8D
    *relation8D({ payload }, { call, put }) {
      let result = yield call(relation8D, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            relation8DPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存关联8D
    *saveRelation8D({ payload }, { call }) {
      const result = yield call(saveRelation8D, payload);
      return getResponse(result);
    },
    // 查询可新增的关联8D
    *fetchAddRelation8D({ payload }, { call }) {
      const result = yield call(fetchAddRelation8D, payload);
      return getResponse(result);
    },
    // 删除关联8D
    *deleteRelation8D({ payload }, { call }) {
      const result = yield call(deleteRelation8D, payload);
      return getResponse(result);
    },
    // 查询小组成员
    *queryTeamMembers({ payload }, { call }) {
      const result = yield call(queryTeamMembers, payload);
      return getResponse(result);
    },
    // 删除小组成员
    *deleteTeamMembers({ payload }, { call }) {
      const result = yield call(deleteTeamMembers, payload);
      return getResponse(result);
    },
    // 查询引用检验单数据
    *fetchQuoteData({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchQuoteData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quoteList: res.content,
            quotePage: createPagination(res),
          },
        });
      }
    },
    // 引用创建
    *quoteAndCreate({ payload }, { call }) {
      const res = getResponse(yield call(quoteAndCreate, payload));
      return res;
    },

    // 查询来源信息
    *fetchSourceInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchSourceInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sourceInfolist: result.map((item) => ({ ...item, _status: 'update' })),
          },
        });
      }
    },

    // 删除来源信息
    *deleteSourceInfo({ payload }, { call }) {
      const result = getResponse(yield call(deleteSourceInfo, payload));
      return result;
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

    *savePurchaseOrder({ payload }, { call }) {
      const result = yield call(savePurchaseOrder, payload);
      return getResponse(result);
    },

    *delPurchaseOrder({ payload }, { call }) {
      const result = getResponse(yield call(delPurchaseOrder, payload));
      return result;
    },

    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          issueType: 'SQAM.PROBLEM_TYPE', // 问题类型
          significance: 'SQAM.PROBLEM_IMPORTANCE', // 重视度
          urgency: 'SQAM.PROBLEM_URGENCY', // 紧急度
          rectifyTypeCode: 'SQAM.RECTIFY_TYPE',
          problemStatus: 'SQAM.PROBLEM_STATUS', // 状态
          problemSource: 'SQAM.PROBLEM_SOURCE', // 数据来源
          participantNode: 'SQAM.FEEDBACK_JOIN_POINT', // 参与节点
          camp: 'SQAM.EDPROBLEM.CAMP', // 代表方
          defectType: 'SQAM.PROBLEM_DEFECT_TYPE', // 缺陷类型
          decisionResult: 'SQAM.DECISION_RESULT', // 决策结果
          assessmentResult: 'SQAM.ASSESSMENT_RESULT', // 评估结果
          idd: 'HPFM.IDD',
          tenantId,
          dateRangeList: 'SQAM.DATE_RANGE',
          flagList: 'HPFM.FLAG',
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
        return result;
      }
    },
    *fetchDefectTypDe({ payload }, { call, put }) {
      const result = getResponse(
        yield call(queryParentCode, {
          lovCode: 'SQAM.PROBLEM_DEFECT_TYPE', // 缺陷类型
          parentValue: payload,
          tenantId,
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            defectType: result,
          },
        });
      }
    },
    // 查询引用质检单创建定义查询条件
    *fetchIncomingSearch({ payload }, { call }) {
      const result = getResponse(yield call(fetchIncomingSearch, payload));
      return result;
    },

    // 查询引用质检单创建定义查询条件
    *fetchLovSql({ payload }, { call }) {
      const result = getResponse(yield call(fetchLovSql, payload));
      return result;
    },
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 引用检验单创建查询配置接口
    *selectCreate8DConfig({ payload }, { call }) {
      const result = yield call(selectCreate8DConfig, payload);
      return getResponse(result);
    },

    // 查询引用检验单数据
    *fetchTrxHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchTrxHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quoteTrxList: res.content,
            quoteTrxPage: createPagination(res),
          },
        });
      }
    },
    // 查询引用检验单数据 供应商
    *fetchTrxHeaderSupplier({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchTrxHeaderSupplier, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quoteTrxList: res.content,
            quoteTrxPage: createPagination(res),
          },
        });
      }
    },
    // 事务引用创建
    *trxQuoteAndCreate({ payload }, { call }) {
      const res = getResponse(yield call(trxQuoteAndCreate, payload));
      return res;
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
    // /**
    //  * 获取年度考评结果列表
    //  * @param {?Object} payload - 请求参数
    //  */
    *fetchList({ payload }, { put, call }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evalDataSource: result,
            // evalPagination: createPagination(result),
          },
        });
      }
    },

    // 获取个人中心配置
    *fetctUserID({ payload }, { call, put }) {
      let result = yield call(userID, payload);
      result = getResponse(result);
      if (result && result.enabledFlag === 1) {
        yield put({
          type: 'updateState',
          payload: {
            detail: {
              invOrganizationName: result.organizationName,
              invOrganizationId: result.organizationId,
              companyId: result.companyId,
              companyName: result.companyName,
              ouId: result.ouId,
              ouName: result.ouName,
            },
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
    updateStateValue(state, { payload }) {
      const { detail } = state;
      return {
        ...state,
        detail: { ...detail, ...payload },
      };
    },
  },
};
