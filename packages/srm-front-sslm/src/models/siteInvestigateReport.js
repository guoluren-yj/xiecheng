/**
 * siteInvestigateReport - 现场考察报告modal
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryManageList,
  queryFillingList,
  queryFilledList,
  queryResultList,
  listInvalid,
  listDelete,
  queryBasicInfo,
  queryMaterialCategory,
  saveMaterialCategory,
  deleteMaterialCategory,
  queryTeam,
  saveTeam,
  deleteTeam,
  queryAttachment,
  saveAttachment,
  deleteAttachment,
  onDraggerUploadRemove,
  queryScoreInfo,
  queryFillingScoreInfo,
  queryScorer,
  queryScorerInfo,
  saveScorer,
  deleteScorer,
  queryScoreStatus,
  queryResults,
  saveAll,
  performScore,
  submitApproval,
  summaryStatistics,
  detailInvalid,
  queryOperationRecord,
  saveFillingScore,
  submitFillingScore,
  queryCopyPerson,
  submitFeedback,
  querySupplierMaterialCategory,
  queryReceivedBasicInfo,
  publishReport,
  saveManageScoreInfo,
  batchSaveGrader,
  handlePrint,
  handleBackScore,
  detailDelete,
  querySupplierInfo,
  queryProblemHeader,
  handleBack,
  queryGradeAttachment,
  saveGradeAttachment,
  deleteGradeAttachment,
  weightSameJudge,
  transmitScorer,
  batchCancel,
} from '@/services/siteInvestigateReportService';

export default {
  namespace: 'siteInvestigateReport',

  state: {
    code: {}, // 值集集合
    attCode: {}, // 值集集合
    manageList: [], // 管理列表
    manageListPagination: {}, // 管理列表分页
    fillingList: [], // 填制列表
    fillingListPagination: {}, // 填制列表分页
    filledList: [], // 已填制列表
    filledListPagination: {}, // 已填制分页
    resultList: [], // 结果查询列表
    resultListPagination: {}, // 结果查询分页
    scorerList: [], // 评分人列表
    scoreStatusList: [], // 评分状态列表
    operationRecordList: [], // 操作记录
    operationRecordPagination: {}, // 操作记录分页
    copyPersonList: [], // 联系人列表
    copyPersonPagination: {}, // 联系人列表分页
    scoreInfo: [],
  },

  effects: {
    // 值集查询
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { code: res },
        });
      }
      return res;
    },
    // 附件信息值集查询
    *queryAttMapIdpValue({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { attCode: res },
        });
      }
      return res;
    },

    // 现场考察结果查询值集查询
    *resultInit({ payload }, { call }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      return res || {};
    },

    // 现场考察报告管理列表查询
    *queryManageList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryManageList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            manageList: res.content,
            manageListPagination: createPagination(res),
          },
        });
      }
    },

    //  现场考察报告填制列表查询
    *queryFillingList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryFillingList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            fillingList: res.content,
            fillingListPagination: createPagination(res),
          },
        });
      }
    },

    //  现场考察报告填制列表查询
    *queryFilledList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryFilledList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            filledList: res.content,
            filledListPagination: createPagination(res),
          },
        });
      }
    },

    //  现场考察结果查询列表查询
    *queryResultList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryResultList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            resultList: res.content,
            resultListPagination: createPagination(res),
          },
        });
      }
    },

    // 现场考察报告管理列表作废
    *listInvalid({ payload }, { call }) {
      const res = getResponse(yield call(listInvalid, payload));
      return res;
    },

    // 现场考察报告管理列表删除
    *listDelete({ payload }, { call }) {
      const res = getResponse(yield call(listDelete, payload));
      return res;
    },

    // 基本信息查询
    *queryBasicInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryBasicInfo, payload));
      return res;
    },

    // 基本信息查询
    *queryReceivedBasicInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryReceivedBasicInfo, payload));
      return res;
    },

    // 物料／品类查询
    *queryMaterialCategory({ payload }, { call }) {
      const res = getResponse(yield call(queryMaterialCategory, payload));
      return res;
    },

    // 供应商物料／品类查询
    *querySupplierMaterialCategory({ payload }, { call }) {
      const res = getResponse(yield call(querySupplierMaterialCategory, payload));
      return res;
    },

    // 物料／品类保存
    *saveMaterialCategory({ payload }, { call }) {
      const res = getResponse(yield call(saveMaterialCategory, payload));
      return res;
    },

    // 物料／品类删除
    *deleteMaterialCategory({ payload }, { call }) {
      const res = getResponse(yield call(deleteMaterialCategory, payload));
      return res;
    },

    // 考察小组查询
    *queryTeam({ payload }, { call }) {
      const res = getResponse(yield call(queryTeam, payload));
      return res;
    },

    // 考察小组保存
    *saveTeam({ payload }, { call }) {
      const res = getResponse(yield call(saveTeam, payload));
      return res;
    },

    // 考察小组删除
    *deleteTeam({ payload }, { call }) {
      const res = getResponse(yield call(deleteTeam, payload));
      return res;
    },

    // 附件信息查询
    *queryAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryAttachment, payload));
      return res;
    },

    // 附件信息保存
    *saveAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveAttachment, payload));
      return res;
    },

    // 附件信息删除
    *deleteAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteAttachment, payload));
      return res;
    },

    // 根据附件url删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const res = getResponse(yield call(onDraggerUploadRemove, payload));
      return res;
    },

    // 评分信息查询
    *queryScoreInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(queryScoreInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scoreInfo: res,
          },
        });
      }
      return res;
    },

    // 填制-评分信息查询
    *queryFillingScoreInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryFillingScoreInfo, payload));
      return res;
    },

    // 评分人查询
    *queryScorer({ payload }, { call, put }) {
      const res = getResponse(yield call(queryScorer, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scorerList: res.content.map(n => ({ ...n, _status: 'update' })),
          },
        });
      }
    },

    // 查询评分人汇总信息
    *queryScorerInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryScorerInfo, payload));
      return res;
    },

    // 评分人保存
    *saveScorer({ payload }, { call }) {
      const res = getResponse(yield call(saveScorer, payload));
      return res;
    },

    // 评分人删除
    *deleteScorer({ payload }, { call }) {
      const res = getResponse(yield call(deleteScorer, payload));
      return res;
    },

    // 评分状态查询
    *queryScoreStatus({ payload }, { call, put }) {
      const res = getResponse(yield call(queryScoreStatus, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            scoreStatusList: res.content,
          },
        });
      }
    },

    // 考察结果查询
    *queryResults({ payload }, { call }) {
      const res = getResponse(yield call(queryResults, payload));
      return res;
    },

    // 明细大保存
    *saveAll({ payload }, { call }) {
      const res = getResponse(yield call(saveAll, payload));
      return res;
    },

    // 执行评分
    *performScore({ payload }, { call }) {
      const res = getResponse(yield call(performScore, payload));
      return res;
    },

    // 统计汇总
    *summaryStatistics({ payload }, { call }) {
      const res = getResponse(yield call(summaryStatistics, payload));
      return res;
    },

    // 提交审批
    *submitApproval({ payload }, { call }) {
      const res = getResponse(yield call(submitApproval, payload));
      return res;
    },

    // 发布
    *publishReport({ payload }, { call }) {
      const res = getResponse(yield call(publishReport, payload));
      return res;
    },

    // 明细作废
    *detailInvalid({ payload }, { call }) {
      const res = getResponse(yield call(detailInvalid, payload));
      return res;
    },

    // 操作记录查询
    *queryOperationRecord({ payload }, { call, put }) {
      const res = getResponse(yield call(queryOperationRecord, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: res.content,
            operationRecordPagination: createPagination(res),
          },
        });
      }
    },

    // 现场考察报告填制-保存
    *saveFillingScore({ payload }, { call }) {
      const res = getResponse(yield call(saveFillingScore, payload));
      return res;
    },

    // 现场考察报告填制-提交
    *submitFillingScore({ payload }, { call }) {
      const res = getResponse(yield call(submitFillingScore, payload));
      return res;
    },

    // 查询抄送人
    *queryCopyPerson({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCopyPerson, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            copyPersonList: res.content,
            copyPersonPagination: createPagination(res),
          },
        });
      }
    },

    // 提交反馈
    *submitFeedback({ payload }, { call }) {
      const res = getResponse(yield call(submitFeedback, payload));
      return res;
    },

    // 现场考察报告管理详情页评分信息保存接口
    *saveManageScoreInfo({ payload }, { call }) {
      const res = getResponse(yield call(saveManageScoreInfo, payload));
      return res;
    },

    *batchSaveGrader({ payload }, { call }) {
      const res = getResponse(yield call(batchSaveGrader, payload));
      return res;
    },

    // 考察报告结果-打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
    },

    // 退回评分
    *handleBackScore({ payload }, { call }) {
      const res = getResponse(yield call(handleBackScore, payload));
      return res;
    },

    // 详情页-删除
    *detailDelete({ payload }, { call }) {
      const res = getResponse(yield call(detailDelete, payload));
      return res;
    },

    // 查询质量整改单据头ID
    *queryProblemHeader({ payload }, { call }) {
      const res = getResponse(yield call(queryProblemHeader, payload));
      return res;
    },

    // 工作台新建时查询供应商信息
    *querySupplierInfo({ payload }, { call }) {
      const responce = getResponse(yield call(querySupplierInfo, payload));
      return responce;
    },

    // 退回
    *handleBack({ payload }, { call }) {
      const res = getResponse(yield call(handleBack, payload));
      return res;
    },

    // 查询评分附件
    *queryGradeAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryGradeAttachment, payload));
      return res;
    },

    // 保存评分附件
    *saveGradeAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveGradeAttachment, payload));
      return res;
    },

    // 删除评分附件
    *deleteGradeAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteGradeAttachment, payload));
      return res;
    },
    // 判断权重是否相同
    *weightSameJudge({ payload }, { call }) {
      const res = yield call(weightSameJudge, payload);
      return getResponse(res);
    },
    // 转交评分人
    *transmitScorer({ payload }, { call }) {
      const res = yield call(transmitScorer, payload);
      return getResponse(res);
    },
    // 放弃评分
    *batchCancel({ payload }, { call }) {
      const res = yield call(batchCancel, payload);
      return getResponse(res);
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
