/*
 * document.js - 流程单据
 * @date: 2019-04-28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, isTenantRoleLevel } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import {
  fetchList,
  createDocuments,
  deleteDocuments,
  fetchVariableList,
  fetchDetailHeader,
  fetchCustomizeField,
  updateHeader,
  handleSaveVariables,
  handleSearchCategories,
  deleteVariable,
  handleUpdateVariables,
  fetchFormList,
  fetchEmailList,
  handleSaveForm,
  handleUpdateForm,
  deleteForm,
  deleteEmail,
  handleSaveEmail,
  handleUpdateEmail,
  copySiteRecord,
  fetchApprovalList,
  handleSaveApprovalGroup,
  deleteApprovalGroup,
  fetchApprovalGroupFieldList,
  handleSaveApprovalGroupField,
  deleteApprovalGroupField,
} from '../services/documentsService';

export default {
  namespace: 'documents',
  state: {
    dataSource: [],
    pagination: {},
    enumMap: {},
    documentCuszFieldList: [],
  },
  effects: {
    // 查询值集
    *fetchEnumMap(params, { call, put }) {
      const lookupMap = getResponse(
        yield call(queryMapIdpValue, {
          variableTypes: 'HWFP.PROCESS.VARIABLE_TYPE',
          documentSourceTypes: 'HPFM.PROCESS_DOCUMENT_SOURCE',
          componentTypes: 'HWFP.PROCESS.COMPONENT_TYPE',
          outputTypes: 'HWFP.APPROVAL_GROUP_OUTPUT_TYPE',
          moduleForm: 'HWFP.MODULE',
          usageStatus: 'HWFP.FORM.UAGGE_STATUS',
          searchFlagList: 'HPFM.ENABLED_FLAG',
        })
      );
      const enumMap = {
        ...(lookupMap || {}),
      };
      if (isTenantRoleLevel()) {
        const documentCuszFieldList = getResponse(
          yield call(queryUnifyIdpValue, 'HWFP.DOCUMENT_CUSZ_FIELD')
        );
        enumMap.documentCuszFieldList = documentCuszFieldList || [];
      }
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 查询列表数据
    *fetchList({ payload }, { call, put }) {
      const res = yield call(fetchList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: list.content || [],
            pagination: createPagination(list),
          },
        });
      }
    },
    // 新建保存
    *createDocuments({ payload }, { call }) {
      const res = yield call(createDocuments, payload);
      return getResponse(res);
    },
    // 修改头
    *updateHeader({ payload }, { call }) {
      const res = yield call(updateHeader, payload);
      return getResponse(res);
    },
    // 删除流程单据
    *deleteDocuments({ payload }, { call }) {
      const res = yield call(deleteDocuments, payload);
      return getResponse(res);
    },
    // 查询详情头
    *fetchDetailHeader({ payload }, { call }) {
      const res = yield call(fetchDetailHeader, payload);
      return getResponse(res);
    },
    // 查询字段名
    *fetchCustomizeField({ payload }, { call }) {
      const res = yield call(fetchCustomizeField, payload);
      return getResponse(res);
    },
    // 查询详情变量列表
    *fetchVariableList({ payload }, { call }) {
      const res = yield call(fetchVariableList, payload);
      return getResponse(res);
    },
    // 查询详情表单列表
    *fetchFormList({ payload }, { call }) {
      const res = yield call(fetchFormList, payload);
      return getResponse(res);
    },
    // 查询详情邮件列表
    *fetchEmailList({ payload }, { call }) {
      const res = yield call(fetchEmailList, payload);
      return getResponse(res);
    },
    // 保存详情流程变量
    *handleSaveVariables({ payload }, { call }) {
      const res = yield call(handleSaveVariables, payload);
      return getResponse(res);
    },
    // 更新详情流程变量
    *handleUpdateVariables({ payload }, { call }) {
      const res = yield call(handleUpdateVariables, payload);
      return getResponse(res);
    },
    // 保存详情流程表单
    *handleSaveForm({ payload }, { call }) {
      const res = yield call(handleSaveForm, payload);
      return getResponse(res);
    },
    // 更新详情流程表单
    *handleUpdateForm({ payload }, { call }) {
      const res = yield call(handleUpdateForm, payload);
      return getResponse(res);
    },
    // 保存详情邮件表单
    *handleSaveEmail({ payload }, { call }) {
      const res = yield call(handleSaveEmail, payload);
      return getResponse(res);
    },
    // 更新详情邮件表单
    *handleUpdateEmail({ payload }, { call }) {
      const res = yield call(handleUpdateEmail, payload);
      return getResponse(res);
    },
    // 删除流程变量
    *deleteVariable({ payload }, { call }) {
      const res = yield call(deleteVariable, payload);
      return getResponse(res);
    },
    // 删除流程表单
    *deleteForm({ payload }, { call }) {
      const res = yield call(deleteForm, payload);
      return getResponse(res);
    },
    // 删除邮件表单
    *deleteEmail({ payload }, { call }) {
      const res = yield call(deleteEmail, payload);
      return getResponse(res);
    },
    // 查询流程分类
    *handleSearchCategories({ payload }, { call }) {
      const res = yield call(handleSearchCategories, payload);
      return getResponse(res);
    },
    // 复制平台级流程单据
    *copySiteRecord({ payload }, { call }) {
      const res = yield call(copySiteRecord, payload);
      return getResponse(res);
    },
    // 查询详情审批组列表
    *fetchApprovalList({ payload }, { call }) {
      const res = yield call(fetchApprovalList, payload);
      return getResponse(res);
    },
    // 保存详情审批组表单
    *handleSaveApprovalGroup({ payload }, { call }) {
      const res = yield call(handleSaveApprovalGroup, payload);
      return getResponse(res);
    },
    // 删除审批组表单
    *deleteApprovalGroup({ payload }, { call }) {
      const res = yield call(deleteApprovalGroup, payload);
      return getResponse(res);
    },
    // 查询详情审批组字段定义列表
    *fetchApprovalGroupFieldList({ payload }, { call }) {
      const res = yield call(fetchApprovalGroupFieldList, payload);
      return getResponse(res);
    },
    // 保存详情审批组字段定义表单
    *handleSaveApprovalGroupField({ payload }, { call }) {
      const res = yield call(handleSaveApprovalGroupField, payload);
      return getResponse(res);
    },
    // 删除审批组字段定义表单
    *deleteApprovalGroupField({ payload }, { call }) {
      const res = yield call(deleteApprovalGroupField, payload);
      return getResponse(res);
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
