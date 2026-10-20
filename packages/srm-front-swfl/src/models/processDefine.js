/**
 * model 流程设置/流程定义
 * @date: 2018-8-16
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  fetchProcessList,
  addProcess,
  queryRemind,
  addRemind,
  fetchDeployHistory,
  fetchDeployDetail,
  fetchProcessDetail,
  fetchProcessImage,
  deleteProcess,
  verifyReleaseProcess,
  releaseProcess,
  checkProcessKey,
  deleteDeploy,
  fetchCategory,
  importProcess,
  fetchDocuments,
  copyValue,
  fetchProcessModelDetail,
  fetchProcessModelNodes,
  fetchNodesLine,
  deleteApproveChainLine,
  saveApproveChainLine,
  queryApproveChainLine,
  queryApproveChainLineDetail,
  saveApproveChainLineDetail,
  deleteApprovalLineDetail,
  saveProcessSetting,
} from '../services/processDefineService';

export default {
  namespace: 'processDefine',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    deployHistory: {}, // 流程部署记录
    category: [], // 流程分类
    documents: [], // 流程单据
    IdpValues: {}, // 值集数据
  },
  effects: {
    *fetchCategory({ payload }, { call, put }) {
      const result = yield call(fetchCategory, payload);
      if (getResponse(result)) {
        yield put({
          type: 'updateState',
          payload: {
            category: result.map((item) => ({
              value: item.categoryId,
              meaning: item.description,
            })),
          },
        });
      }
    },
    *fetchIdpValue({ payload }, { call, put }) {
      const IdpValues = getResponse(yield call(queryMapIdpValue, payload));
      yield put({
        type: 'updateState',
        payload: {
          IdpValues: IdpValues || {},
        },
      });
    },
    *fetchProcessList({ payload }, { call, put }) {
      let result = yield call(fetchProcessList, payload);
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
    // 流程部署
    *fetchDeployHistory({ payload }, { call }) {
      const result = yield call(fetchDeployHistory, payload);
      return getResponse(result);
    },
    // 部署详情-部署信息
    *fetchDeployDetail({ payload }, { call }) {
      const result = yield call(fetchDeployDetail, { ...payload });
      return getResponse(result);
    },
    // 部署详情-流程信息
    *fetchProcessDetail({ payload }, { call }) {
      const result = yield call(fetchProcessDetail, { ...payload });
      return getResponse(result);
    },
    // 部署详情-预览图
    *fetchProcessImage({ payload }, { call }) {
      const result = yield call(fetchProcessImage, { ...payload });
      return getResponse(result);
    },
    // 流程添加
    *createProcess({ payload }, { call }) {
      const result = yield call(addProcess, { ...payload });
      return getResponse(result);
    },
    // 查询待办定时提醒
    *getRemind({ payload }, { call }) {
      const result = yield call(queryRemind, { ...payload });
      return getResponse(result);
    },
    // 新增待办定时提醒
    *createRemind({ payload }, { call }) {
      const result = yield call(addRemind, { ...payload });
      return getResponse(result);
    },
    // 流程删除
    *deleteProcess({ payload }, { call }) {
      const result = yield call(deleteProcess, { ...payload });
      return getResponse(result);
    },
    // 流程发布前的校验
    *verifyReleaseProcess({ payload }, { call }) {
      const result = yield call(verifyReleaseProcess, { ...payload });
      return getResponse(result);
    },
    // 流程发布
    *releaseProcess({ payload }, { call }) {
      const result = yield call(releaseProcess, { ...payload });
      return getResponse(result);
    },
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkProcessKey, { ...payload });
      return result;
    },
    *deleteDeploy({ payload }, { call }) {
      const result = yield call(deleteDeploy, { ...payload });
      return getResponse(result);
    },

    // 导入
    *importProcess({ payload }, { call }) {
      const result = yield call(importProcess, payload);
      return getResponse(result);
    },

    // 复制
    *copyValue({ payload }, { call }) {
      const result = yield call(copyValue, payload);
      return getResponse(result);
    },

    *fetchDocuments({ payload }, { call, put }) {
      let result = yield call(fetchDocuments, payload);
      result = getResponse(result);
      if (result) {
        const documents = result.processDocumentList.map((item) => ({
          value: item.documentId,
          meaning: `${item.description}-${item.documentCode}`,
          sourceParentId: item.sourceParentId,
        }));
        yield put({
          type: 'updateState',
          payload: {
            documents,
          },
        });
      }
    },

    *fetchProcessModelDetail({ params }, { call }) {
      const response = getResponse(yield call(fetchProcessModelDetail, params));
      return response || {};
    },

    *fetchProcessModelNodes({ params }, { call }) {
      const response = getResponse(yield call(fetchProcessModelNodes, params));
      return response || [];
    },

    *fetchNodesLine({ params }, { call }) {
      const response = getResponse(yield call(fetchNodesLine, params));
      const dataSource = (response || {}).content || [];
      const pagination = createPagination(response || {});
      return { dataSource, pagination };
    },

    *deleteNodesLine({ params }, { call }) {
      const response = getResponse(yield call(deleteApproveChainLine, params));
      return response || {};
    },

    *saveNodesLine({ params }, { call }) {
      const response = getResponse(yield call(saveApproveChainLine, params));
      return response || {};
    },

    *queryApproveChainLine({ params }, { call }) {
      const response = getResponse(yield call(queryApproveChainLine, params));
      return response || {};
    },

    *queryApproveChainLineDetail({ params }, { call }) {
      const response = getResponse(yield call(queryApproveChainLineDetail, params));
      const dataSource = (response || {}).content || [];
      const pagination = createPagination(response || {});
      return { dataSource, pagination };
    },

    *saveApproveChainLineDetail({ params }, { call }) {
      const response = getResponse(yield call(saveApproveChainLineDetail, params));
      return response || {};
    },

    *deleteApprovalLineDetail({ params }, { call }) {
      const response = getResponse(yield call(deleteApprovalLineDetail, params));
      return response || {};
    },

    *updateProcessSetting({ params }, { call }) {
      const response = getResponse(yield call(saveProcessSetting, params));
      return response;
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
