/*
 * supplierKpiIndicator - 供应商绩效-标准指标定义-平台级model
 * @date: 2018/12/13
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  queryCode,
  saveEvalTemplate,
  publishEvalTpl,
  fetchScoreCompany,
  saveCompany,
  queryIndicatorsListTree,
  queryIndicatorsListTreeRef,
  queryIndicatorsFormulas,
  queryOptionsList,
  createIndicator,
  updateIndicator,
  indicatorsEnable,
  saveIndicatorFmls,
  saveIndicatorOpls,
  queryIndicatorsResponsibleList,
  saveIndicatorsResponsibleList,
  deleteIndicators,
  insertOrUpdateIndicators,
  unlockEvalTpl,
  queryEvalTplScopeList,
  queryEvaluationAuto,
  saveEvaluationAuto,
  queryEvalTplScopeSupplierList,
  saveEvalTplScope,
  deleteEvalTplScope,
  saveIndicatorRef,
  queryEvalTplScopeCategoryList,
  saveEvalTplScopeCategoryList,
  deleteEvalTplScopeItemList,
  saveEvalTplScopeItemList,
  queryEvalTplScopeItemList,
  queryUnifyIdpValue,
  queryFormulaListOrg,
  queryOptionsListOrg,
  queryEvaluationAutoCategory,
  queryEvaluationDimension,
  addEvaluationDimension,
  queryEvaluationAutoCategoryPage,
  fetchSupplierLovData,
  queryParamDefinition,
  saveParamDefinition,
  queryParamConfig,
  saveParamConfig,
  deleteParamConfig,
  deleteOptions,
  batchUpdateIndicator,
  fetchHistoricalVersionInfo,
  handleDelete,
} from '@/services/evaluationTemplateService';
import { fetchSupplierClassify } from '@/services/investigationCreateService';
import { queryMapIdpValue } from 'services/api';

function assignListTree(collection = [], parentIndicatorName, parentPath = []) {
  return collection.map(n => {
    const item = n;
    item.parentPath = [].concat(parentPath);
    if (parentIndicatorName) {
      item.parentIndicatorName = parentIndicatorName;
      item.parentPath.push(item.parentIndicatorId);
    }
    if (!isEmpty(item.children)) {
      item.children = assignListTree(item.children, item.indicatorName, item.parentPath);
      item.isNoEnableChildren = !item.children.some(o => o.enabledFlag === 1);
    } else {
      item.isNoChildren = true;
      item.isNoEnableChildren = true;
    }

    return item;
  });
}

export default {
  namespace: 'evaluationTemplate',

  state: {
    code: {},
    paramsCache: {},
    supplierList: [],
    EvaluationAutoData: {},
    EvaluationAutoCategoryData: [],
    EvaluationAutoCategoryKeys: [],
    EvaluationAutoCategoryDatapagination: [],
    permissionsList: [],
    supplierClassifyList: [],
    matchRuleList: [], // 公式配置条件值集
    isVetoSelectList: [],
    historicalVersionData: [],
  },

  effects: {
    *init({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            matchRuleList: list.matchRuleList,
            isVetoSelectList: list.isVetoSelectList,
          },
        });
      }
    },
    // 查询列表
    *queryList({ params }, { call, put }) {
      const response = getResponse(yield call(queryList, params));
      if (!isEmpty(params)) {
        yield put({
          type: 'updateState',
          payload: {
            paramsCache: params,
          },
        });
      }
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查询值集
    *queryCode({ payload }, { put, call }) {
      const response = yield call(queryCode, payload);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [payload.lovCode]: response,
          },
        });
      }
    },
    *queryUnifyIdpValue({ payload = {} }, { put, call }) {
      const { lovCode, params } = payload;
      const response = yield call(queryUnifyIdpValue, lovCode, params);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [lovCode]: response,
          },
        });
      }
    },
    *saveEvalTemplate({ data }, { call }) {
      const response = yield call(saveEvalTemplate, data);
      return response;
    },
    *publishEvalTpl({ data }, { call }) {
      const response = yield call(publishEvalTpl, data);
      return response;
    },
    *enableEvalTemplate({ data }, { call }) {
      const response = yield call(saveEvalTemplate, [data]);
      return response;
    },

    *queryIndicatorsListTree({ params }, { call }) {
      const response = getResponse(yield call(queryIndicatorsListTree, params));
      return {
        dataSource: assignListTree(response) || [],
      };
    },
    *queryIndicatorsListTreeRef({ params }, { call }) {
      const response = getResponse(yield call(queryIndicatorsListTreeRef, params));
      return {
        dataSource: assignListTree(response) || [],
      };
    },
    *createIndicator({ data }, { call }) {
      const response = yield call(createIndicator, data);
      return response;
    },
    *updateIndicator({ payload }, { call }) {
      const response = yield call(updateIndicator, payload);
      return response;
    },
    *batchUpdateIndicator({ payload }, { call }) {
      const response = yield call(batchUpdateIndicator, payload);
      const res = getResponse(response);
      return res;
    },
    *indicatorsEnable({ enabled, data }, { call }) {
      const response = yield call(indicatorsEnable, enabled, data);
      return response;
    },
    *queryFormulaList({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryIndicatorsFormulas, indicatorId, params));
      return {
        dataSource: response || [],
        // pagination: createPagination(response || {}),
      };
    },
    *queryOptionsList({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryOptionsList, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryFormulaListOrg({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryFormulaListOrg, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryOptionsListOrg({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryOptionsListOrg, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *saveIndicatorFmls({ indicatorId, data }, { call }) {
      const response = yield call(saveIndicatorFmls, indicatorId, data);
      return response;
    },
    *saveIndicatorOpls({ indicatorId, data }, { call }) {
      const response = yield call(saveIndicatorOpls, indicatorId, data);
      return response;
    },
    *saveIndicatorRef({ payload }, { call }) {
      const response = yield call(saveIndicatorRef, payload);
      return response;
    },
    *queryIndicatorsResponsibleList(
      { indicatorId, params, indicationAssignStatus = '' },
      { call, put }
    ) {
      const response = getResponse(yield call(queryIndicatorsResponsibleList, indicatorId, params));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            permissionsList:
              indicationAssignStatus === 'edit'
                ? response.map(item => ({ ...item, _status: 'update' }))
                : response,
          },
        });
      } else {
        yield put({
          type: 'updateState',
          payload: {
            permissionsList: [],
          },
        });
      }
      return {
        dataSource: response || [],
        // pagination: createPagination(response || {}),
      };
    },
    *saveIndicatorsResponsibleList({ indicatorId, payload }, { call }) {
      const response = getResponse(yield call(saveIndicatorsResponsibleList, indicatorId, payload));
      return response;
    },
    *deleteIndicators({ indicatorId, payload }, { call }) {
      const response = getResponse(yield call(deleteIndicators, indicatorId, payload));
      return response;
    },
    *insertOrUpdateIndicators({ indicatorId, payload }, { call }) {
      const response = getResponse(yield call(insertOrUpdateIndicators, indicatorId, payload));
      return response;
    },
    *unlockEvalTpl({ data }, { call }) {
      const response = yield call(unlockEvalTpl, data);
      return response;
    },
    *queryEvalTplScopeList({ templateId, params }, { call }) {
      const response = getResponse(yield call(queryEvalTplScopeList, templateId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // kpi自动考评配置查询
    *queryEvaluationAuto({ templateId }, { call, put }) {
      const response = getResponse(yield call(queryEvaluationAuto, templateId));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            EvaluationAutoData: response,
          },
        });
      }
      return {
        dataSource: response || {},
      };
    },
    // kpi自动考评配置保存
    *saveEvaluationAuto({ data }, { call }) {
      const response = getResponse(yield call(saveEvaluationAuto, data));
      return response;
    },
    // kpi自动考评维度查询
    *queryEvaluationAutoCategory({ payload }, { call, put }) {
      const response = yield call(queryEvaluationDimension, {
        evalTplId: payload.templateId,
        evalDimension: payload.evalDimension,
      });
      const data = getResponse(response);
      const res = yield call(queryEvaluationAutoCategory, {
        evalTplId: payload.templateId,
        evalDimension: payload.evalDimension,
      });
      const checkedData = getResponse(res);
      if (checkedData && data) {
        yield put({
          type: 'updateState',
          payload: {
            EvaluationAutoCategoryData: data,
            EvaluationAutoCategoryKeys: checkedData.map(d => d.evalDimensionValue),
          },
        });
      }
    },
    // kpi自动考核增加维度
    *addEvaluationDimension({ payload }, { call }) {
      const response = getResponse(yield call(addEvaluationDimension, payload));
      return response;
    },

    // 自动考评分配维度查询分页查询
    *queryEvaluationAutoCategoryPage({ payload }, { call, put }) {
      const response = getResponse(yield call(queryEvaluationAutoCategoryPage, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            EvaluationAutoCategoryData: response.content,
            EvaluationAutoCategoryDatapagination: createPagination(response),
          },
        });
      }
      return {
        dataSource: response || {},
      };
    },

    *queryEvalTplScopeSupplierList({ templateId, params }, { call }) {
      const response = getResponse(yield call(queryEvalTplScopeSupplierList, templateId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *saveEvalTplScope({ templateId, data }, { call }) {
      const response = yield call(saveEvalTplScope, templateId, data);
      return response;
    },
    *deleteEvalTplScope({ templateId, data }, { call }) {
      const res = yield call(deleteEvalTplScope, templateId, data);
      return { success: isEmpty(res) && !res.failed, response: res };
    },
    *queryEvalTplScopeCategoryList({ scopeId, params }, { call }) {
      const response = getResponse(yield call(queryEvalTplScopeCategoryList, scopeId, params));
      const selectedRows = [];
      function getSelectedRows(collection = []) {
        collection.forEach(n => {
          if (n.evalTplScopeDtlId !== null) {
            selectedRows.push({ ...n, deleteFlag: 0 });
          }
          if (!isEmpty(n.children)) {
            getSelectedRows(n.children);
          }
        });
      }
      getSelectedRows(response);
      return {
        dataSource: response || [],
        selectedRows,
      };
    },
    *saveEvalTplScopeCategoryList({ scopeId, data }, { call }) {
      const response = yield call(saveEvalTplScopeCategoryList, scopeId, data);
      return response;
    },
    *deleteEvalTplScopeItemList({ scopeId, data }, { call }) {
      const res = yield call(deleteEvalTplScopeItemList, scopeId, data);
      return { success: isEmpty(res) && !res.failed, response: res };
    },
    *saveEvalTplScopeItemList({ scopeId, data }, { call }) {
      const response = yield call(saveEvalTplScopeItemList, scopeId, data);
      return response;
    },
    *queryEvalTplScopeItemList({ scopeId, params }, { call }) {
      const response = getResponse(yield call(queryEvalTplScopeItemList, scopeId, params));
      const selectedRows = [];
      ((response || {}).content || []).forEach(n => {
        if (n.evalTplScopeDtlId !== null) {
          selectedRows.push({ ...n, deleteFlag: 0 });
        }
      });
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
        selectedRows,
      };
    },

    // 获取分配适用公司
    *fetchCompany({ payload }, { call }) {
      const response = yield call(fetchScoreCompany, payload);
      const data = getResponse(response);
      return data;
    },
    // 保存使用公司
    *saveCompany({ payload }, { call }) {
      const response = yield call(saveCompany, payload);
      return getResponse(response);
    },

    /**
     * 获得供应商lov数据
     */
    *fetchSupplierLovData({ payload }, { call, put }) {
      const res = yield call(fetchSupplierLovData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierList: list.content,
            supplierPagination: createPagination(list || {}),
          },
        });
      }
    },

    /**
     * 查询供应商分类
     */
    *fetchSupplierClassify({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchSupplierClassify, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyList: res,
          },
        });
      }
    },
    // 查询参数定义
    *queryParamDefinition({ params }, { call }) {
      const response = getResponse(yield call(queryParamDefinition, params));
      return response;
    },
    // 保存参数定义
    *saveParamDefinition({ params }, { call }) {
      const response = getResponse(yield call(saveParamDefinition, params));
      return response;
    },
    // 查询参数配置
    *queryParamConfig({ params }, { call }) {
      const response = getResponse(yield call(queryParamConfig, params));
      return response;
    },
    // 保存参数配置
    *saveParamConfig({ params }, { call }) {
      const response = getResponse(yield call(saveParamConfig, params));
      return response;
    },
    // 删除参数配置
    *deleteParamConfig({ params }, { call }) {
      const response = getResponse(yield call(deleteParamConfig, params));
      return response;
    },
    // 删除选项配置
    *deleteOptions({ params }, { call }) {
      const response = getResponse(yield call(deleteOptions, params));
      return response;
    },
    // 查询历史版本信息
    *fetchHistoricalVersionInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchHistoricalVersionInfo, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historicalVersionData: (result || {}).content || [],
            pagination: createPagination(result || {}),
          },
        });
      }
    },
    *handleDelete({ params }, { call }) {
      const response = getResponse(yield call(handleDelete, params));
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
    addPermissionsList(state, { payload }) {
      const { permissionsList } = state;
      const { data = {} } = payload;
      permissionsList.push(data);
      return {
        ...state,
        permissionsList,
      };
    },
    updatePermissionsList(state, { payload }) {
      const { permissionsList } = state;
      const { data = {} } = payload;
      return {
        ...state,
        permissionsList: permissionsList.map(item => {
          if (item.evalTplIndRespId === data.evalTplIndRespId) {
            return {
              ...item,
              ...data,
            };
          } else {
            return item;
          }
        }),
      };
    },

    deletePermissionsList(state, { payload }) {
      const { permissionsList } = state;
      const { selectedRowKeys } = payload;
      const result = permissionsList.filter(item => {
        return !selectedRowKeys.includes(item.evalTplIndRespId);
      });
      return {
        ...state,
        permissionsList: result,
      };
    },
  },
};
