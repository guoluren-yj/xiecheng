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
  queryListTree,
  queryCode,
  queryFormulaList,
  queryOptionsList,
  indicatorsEnable,
  createIndicator,
  updateIndicator,
  saveIndicatorFmls,
  saveIndicatorOpls,
  saveIndicatorRef,
  queryIndicatorsListTreeRef,
  queryIndicatorsListTree,
  queryFormulaListOrg,
  queryImportData, // 导入数据
  queryStatus, // 刷新数据
  queryRefreshData, // 查询数据
  queryCheckData, // 核对数据
  querySubmitImportData, // 提交导入保存
  queryParamDefinition,
  saveParamDefinition,
  queryParamConfig,
  saveParamConfig,
  deleteParamConfig,
  deleteIndicatorOpls,
  batchQueryScoringTemp,
  queryScoringTemp,
  batchHandleUpdateScoringTemp,
  handleUpdateScoringTemp,
  handleDelete,
} from '@/services/supplierKpiIndicatorService';
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
  namespace: 'supplierKpiIndicatorOrg',

  state: {
    code: {},
    batch: '', // 批次号，上传数据后生成
    /*
     *当前数据状态。
     *涵盖上传中-完成，核验中-完成，导入中-完成。
     *状态1标识上传请求完成，但未收到服务器返回数据。
     */
    status: '',
    dataSource: [], // 当前处理的数据
    errData: [], // 当前dataSource中的错误行，并非全部
    pagination: {}, // 分页控制
    correctPagination: {}, // 标准指标定义导入分页
    indicatorTypeCode: [], // 指标类型值集
    matchRuleList: [], // 公式配置条件值集
    isVetoSelectList: [], // 勾选式下拉框值集 是 否
  },

  effects: {
    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            indicatorTypeCode: list.indicatorTypeMeaning,
            matchRuleList: list.matchRuleList,
            isVetoSelectList: list.isVetoSelectList,
          },
        });
      }
    },
    // 导入数据
    *importData({ payload }, { call }) {
      const response = getResponse(yield call(queryImportData, payload));
      return response;
    },

    // 刷新数据
    *queryStatus({ payload }, { call }) {
      const statusRes = getResponse(yield call(queryStatus, payload));
      return statusRes;
    },

    // 查询数据
    *fetchRefreshData({ payload }, { call, put }) {
      const { batch } = payload;
      if (batch !== '') {
        const dataSource = getResponse(yield call(queryRefreshData, payload));
        if (dataSource) {
          const { content = [] } = dataSource;
          const errData = [];
          const _dataSource = [];
          content.forEach(item => {
            if (['IMPORT_FAILED', 'VALID_FAILED', 'ERROR'].includes(item._dataStatus)) {
              errData.push({
                ...JSON.parse(item._data),
                errorMsg: item.errorMsg,
                _lineNo: errData.length,
              });
            }
            _dataSource.push({
              ...JSON.parse(item._data),
              lineNo: _dataSource.length,
            });
          });
          yield put({
            type: 'updateState',
            payload: {
              dataSource: _dataSource,
              correctPagination: createPagination(dataSource),
              errData,
            },
          });
        }
      }
    },

    // 核对数据
    *fetchCheckData({ payload }, { call }) {
      const response = getResponse(yield call(queryCheckData, payload));
      return response;
    },

    // 提交数据
    *fetchSubmitImportData(params, { call }) {
      const { payload } = params;
      const response = getResponse(yield call(querySubmitImportData, payload));
      return response;
    },
    // 查询列表
    *queryList({ params }, { call }) {
      const response = getResponse(yield call(queryList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryListTree({ params }, { call }) {
      const response = getResponse(yield call(queryListTree, params));
      return {
        dataSource: assignListTree(response) || [],
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
    *indicatorsEnable({ enabled, data }, { call }) {
      const response = yield call(indicatorsEnable, enabled, data);
      return response;
    },
    *queryFormulaList({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryFormulaList, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryOptionsList({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryOptionsList, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *createIndicator({ payload }, { call }) {
      const response = yield call(createIndicator, payload);
      return response;
    },
    *updateIndicator({ payload }, { call }) {
      const response = yield call(updateIndicator, payload);
      return response;
    },
    *queryIndicatorsListTreeRef({ params }, { call }) {
      const response = getResponse(yield call(queryIndicatorsListTreeRef, params));
      return {
        dataSource: assignListTree(response) || [],
      };
    },
    *queryIndicatorsListTree({ params }, { call }) {
      const response = getResponse(yield call(queryIndicatorsListTree, params));
      return {
        dataSource: assignListTree(response) || [],
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
    *saveIndicatorRef({ data }, { call }) {
      const response = yield call(saveIndicatorRef, data);
      return response;
    },
    *queryFormulaListOrg({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryFormulaListOrg, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
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
    // 删除选项配置行
    *deleteIndicatorOpls({ params }, { call }) {
      const response = getResponse(yield call(deleteIndicatorOpls, params));
      return response;
    },
    // 批量更新至评分模板
    *batchHandleUpdateScoringTemp({ params }, { call }) {
      const response = getResponse(yield call(batchHandleUpdateScoringTemp, params));
      return response;
    },
    // 更新至评分模板
    *handleUpdateScoringTemp({ params }, { call }) {
      const response = getResponse(yield call(handleUpdateScoringTemp, params));
      return response;
    },
    // 批量查询评分模板
    *batchQueryScoringTemp({ params }, { call }) {
      const response = getResponse(yield call(batchQueryScoringTemp, params));
      return response;
    },
    // 查询评分模板
    *queryScoringTemp({ params }, { call }) {
      const response = getResponse(yield call(queryScoringTemp, params));
      return response;
    },
    // 删除指标
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
  },
};
