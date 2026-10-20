/**
 * commonApplication.js - 供应商生命周期管理申请单通用 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import { getResponse, getCurrentOrganizationId, createPagination } from 'utils/utils';
import {
  queryLifecycleInfo,
  querySupplierClassification,
  deleteClassify,
  queryReviewDetail,
  onDraggerUploadRemove,
  queryQualifiedScoreInfo,
  queryScorer,
  batchMaintainGrader,
  saveScorer,
  deleteScorer,
  validateSuitable,
  queryLineAttachment,
  saveLineAttachment,
  deleteLineAttachment,
  getOperationsRecord,
  getReviewRecord,
  queryPurchaseData,
  queryPurchaseHeader,
  queryPurchaseLines,
  deletePurchaseLines,
  backScore,
} from '@/services/commonApplicationService';

/**
 * 重构供货能力数据
 * @param {*} dataList
 */
function restructureData(dataList) {
  if (!isEmpty(dataList)) {
    const { content = [] } = dataList;
    const data = content.map(item => {
      return {
        ...item,
        itemLineId: uuid(),
        isLocal: true,
        tenantId: getCurrentOrganizationId(),
        enabledFlag: 1,
      };
    });
    return data;
  } else {
    return [];
  }
}

export default {
  namespace: 'commonApplication',

  state: {
    code: {}, // 值集集合
    lifecycleInfo: {}, // 供应商生命周期头信息
    supplierClassifyData: [], // 供应商列表信息
    reviewMaterialData: {}, // 供货能力清单表格
    recommendMateriaData: [], // 供货能力表部分数据
    scoreInfo: [], // 评分信息
    scorerList: [], // 合格申请评分人列表
    editScorerList: [], // 编辑中的合格申请评分人列表
    operationsRecord: [], // 单据操作记录
    reviewRecord: [], // 单据审批记录
    purchaseHeadInfo: {}, // 头数据源
    purchaseList: [], // 行数据源
    purchaseListPagination: {}, // 行分页参数
  },

  effects: {
    // 值集查询
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            code: res,
          },
        });
      }
      return res;
    },

    // 查询供应商头信息
    *queryLifecycleInfo({ payload }, { call, put }) {
      const lifecycleInfo = getResponse(yield call(queryLifecycleInfo, payload));
      if (!isEmpty(lifecycleInfo)) {
        yield put({
          type: 'updateState',
          payload: { lifecycleInfo },
        });
      }
      return lifecycleInfo;
    },
    // 查询供应商分类列表信息
    *querySupplierClassification({ payload }, { call, put }) {
      const response = yield call(querySupplierClassification, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyData: (data.content || []).map(n => ({
              ...n,
              categoryAlterLineId: uuid(),
            })),
          },
        });
      }
    },
    // 删除供应商分类
    *deleteClassify({ payload }, { call }) {
      const res = yield call(deleteClassify, payload);
      return res;
    },
    // 查询供货能力清单
    *queryReviewDetail({ payload }, { call, put }) {
      const data = getResponse(yield call(queryReviewDetail, payload));
      if (!isEmpty(data)) {
        yield put({
          type: 'updateState',
          payload: {
            reviewMaterialData: data,
            recommendMateriaData: restructureData(data),
          },
        });
      }
    },
    // 根据附件url删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    // 查询评分信息
    *queryQualifiedScoreInfo({ payload }, { call, put }) {
      const scoreInfo = getResponse(yield call(queryQualifiedScoreInfo, payload));
      if (scoreInfo) {
        const newScoreInfo = scoreInfo.map(item => ({ ...item, _status: 'create' }));
        yield put({
          type: 'updateState',
          payload: { scoreInfo: newScoreInfo },
        });
      }
    },
    // 查询评分人
    *queryScorer({ payload }, { call, put }) {
      const scorerList = getResponse(yield call(queryScorer, payload));
      yield put({
        type: 'updateState',
        payload: { scorerList },
      });
      return scorerList || [];
    },
    // 批量维护评分人
    *batchMaintainGrader({ payload }, { call }) {
      const res = getResponse(yield call(batchMaintainGrader, payload));
      return res;
    },
    // 保存评分人
    *saveScorer({ payload }, { call }) {
      const res = getResponse(yield call(saveScorer, payload));
      return res;
    },
    // 删除评分人
    *deleteScorer({ payload }, { call }) {
      const res = getResponse(yield call(deleteScorer, payload));
      return res;
    },
    // 评分模板适用校验
    *validateSuitable({ payload }, { call }) {
      const res = getResponse(yield call(validateSuitable, payload));
      return res;
    },
    // 查询供货能力清单行附件
    *queryLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryLineAttachment, payload));
      return res;
    },
    // 保存供货能力清单行附件
    *saveLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveLineAttachment, payload));
      return res;
    },
    // 删除供货能力清单行附件
    *deleteLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteLineAttachment, payload));
      return res;
    },
    *getOperationsRecord({ payload }, { call, put }) {
      const result = getResponse(yield call(getOperationsRecord, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationsRecord: result,
          },
        });
      }
    },
    *getReviewRecord({ payload }, { call, put }) {
      const result = getResponse(yield call(getReviewRecord, payload));
      if (result) {
        const list = result
          .map(item => {
            return {
              historicTaskExtList: []
                .concat(
                  ...((item.approvalHistories &&
                    typeof item.approvalHistories.map === 'function' &&
                    item.approvalHistories.map(hisItem => hisItem.historicTaskExtList)) ||
                    [])
                )
                .reverse(),
              nodeName: item.nodeName,
              nodeNameMeaning: item.nodeNameMeaning,
            };
          })
          .reverse();
        yield put({
          type: 'updateState',
          payload: {
            reviewRecord: list,
          },
        });
      }
    },
    // 查询采购/财务页签历史数据
    *queryPurchaseData({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPurchaseData, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseHeadInfo: res.lifeChangeSync || {},
            purchaseList:
              res.lifeChangeSyncPfs?.map(n => ({
                ...n,
                _status: 'create',
                supplierSyncPfId: uuid(),
              })) || [],
            purchaseListPagination: createPagination({
              number: 0,
              size: 10,
              totalElements: res.lifeChangeSyncPfs?.length,
            }),
          },
        });
      }
      return res;
    },
    // 查询采购/财务页签头信息
    *queryPurchaseHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPurchaseHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseHeadInfo: res,
          },
        });
      }
      return res;
    },
    // 查询采购/财务页签行信息
    *queryPurchaseLines({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPurchaseLines, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseList: res.content,
            purchaseListPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 删除采购/财务页签行信息
    *deletePurchaseLines({ payload }, { call }) {
      const res = getResponse(yield call(deletePurchaseLines, payload));
      return res;
    },
    // 退回评分
    *backScore({ payload }, { call }) {
      const res = getResponse(yield call(backScore, payload));
      return res;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearOperationsRecord(state) {
      return {
        ...state,
        operationsRecord: [],
        reviewRecord: [],
      };
    },
  },
};
