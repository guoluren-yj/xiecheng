/**
 * models 寻源立项
 * @date: 2020-2-24
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { isEmpty } from 'lodash';

import { getResponse, createPagination } from 'utils/utils';

import {
  fetchProjectSetupHeader,
  saveProjectSetup,
  projectSetupSubmit,
  deleteProjectSetup,
  cancelProjectSetup,
  deleteItemLines,
  saveItemLine,
  fetchItemLine,
  deleteSupplierLines,
  saveSupplier,
  fetchSupplier,
  deletePlanLines,
  savePlanList,
  fetchPlan,
  fetchBulkSupplierData,
  createProject,
  fetchListData,
  createQuoteApproval,
  fetchQuoteApproval,
  checkApplyToInquiry,
  fetchSectionLine,
  saveSectionList,
  deleteSectionLines,
  fetchAddMaterialData,
  saveSectionItemLine,
  fetchExistItemLine, // 查询已有物料
  saveSecItemLines,
} from '@/services/projectSetupService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data, flag = false) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: flag ? '' : 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'projectSetup',
  state: {
    ListDataSource: [],
    pagination: {},
    quoteApprovalList: [], // 引用申请立项
    quoteApprovalPagination: {},
    header: {}, // 立项头信息
    code: {}, // 值集
    itemLine: [],
    itemLinePagination: {},
    supplierLine: [], // supplier
    supplierLinePagination: {},
    bulkSupplierList: [], // 批量查找供应商data lsit
    bulkSupplierListPagination: {}, // 批量查找供应商分页
    sectionLine: [], // 标段/包行信息
    sectionPagination: [], // 标段/包分页信息
    addMaterialData: [], // 添加物料Modal数据
    addMaterialPagination: {}, // 添加物料Modal数据
    existItemLine: [], // 已有物料查询
    existItemLinePagination: {}, // 已有物料分页
    isStandardModelsFlag: true, // 使用标准models标识，用于区分特殊二开场景【route走标准，models走二开】
    ladderLevelData: [], // 阶梯报价数据
  },
  effects: {
    // 获取模板信息
    *fetchBulkSupplierData({ payload }, { call, put }) {
      let result = yield call(fetchBulkSupplierData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bulkSupplierList: result.content,
            bulkSupplierListPagination: createPagination(result),
          },
        });
      }
    },
    // 供应商list
    *fetchSupplier({ payload }, { call, put }) {
      const { detailFlag } = payload;
      let result = yield call(fetchSupplier, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content, detailFlag),
            supplierLinePagination: createPagination(result),
          },
        });
      }
    },
    // 保存
    *saveSupplier({ payload }, { call }) {
      const result = yield call(saveSupplier, payload);
      return getResponse(result);
    },
    // 供应商列表行-批量删除
    *deleteSupplierLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteSupplierLines, payload));
      return result;
    },
    // 获取计划 list
    *fetchPlan({ payload }, { call, put }) {
      let result = yield call(fetchPlan, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planLine: dealDataState(result.content),
            planLinePagination: createPagination(result),
          },
        });
      }
    },
    // 查询标段/包信息
    *fetchSectionLine({ payload }, { call, put }) {
      const { detailFlag } = payload;
      let result = yield call(fetchSectionLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sectionLine: dealDataState(result.content, detailFlag),
            sectionPagination: createPagination(result),
          },
        });
      }
    },
    // 保存标段/包信息
    *saveSectionList({ payload }, { call }) {
      const result = yield call(saveSectionList, payload);
      return getResponse(result);
    },
    // 标段/包信息-批量删除
    *deleteSectionLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteSectionLines, payload));
      return result;
    },
    // 保存计划列表
    *savePlanList({ payload }, { call }) {
      const result = yield call(savePlanList, payload);
      return getResponse(result);
    },
    // 计划列表行-批量删除
    *deletePlanLines({ payload }, { call }) {
      const result = getResponse(yield call(deletePlanLines, payload));
      return result;
    },
    // 寻源立项基本信息
    *fetchProjectSetupHeader({ payload }, { call, put }) {
      let result = yield call(fetchProjectSetupHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    // 寻源立项/保存
    *saveProjectSetup({ payload }, { call }) {
      const result = getResponse(yield call(saveProjectSetup, payload));
      return result;
    },
    //  寻源立项/提交
    *projectSetupSubmit({ payload }, { call }) {
      const result = getResponse(yield call(projectSetupSubmit, payload));
      return result;
    },
    // 寻源立项/删除
    *deleteProjectSetup({ payload }, { call }) {
      const result = getResponse(yield call(deleteProjectSetup, payload));
      return result;
    },
    // 寻源立项/取消
    *cancelProjectSetup({ payload }, { call }) {
      const result = getResponse(yield call(cancelProjectSetup, payload));
      return result;
    },
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 寻源立项物品 查询
    *fetchItemLine({ payload }, { call, put }) {
      const { detailFlag } = payload;
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataState(result.content, detailFlag),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 新增物品明细行
    *saveItemLine({ payload }, { call }) {
      const result = getResponse(yield call(saveItemLine, payload));
      return result;
    },
    // 物品明细行-批量删除
    *deleteItemLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteItemLines, payload));
      return result;
    },
    // 寻源立项 创建
    *createProject({ payload }, { call }) {
      const result = getResponse(yield call(createProject, payload));
      return result;
    },

    // 寻源立项列表
    *fetchListData({ payload }, { call, put }) {
      let result = yield call(fetchListData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ListDataSource: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *fetchQuoteApproval({ payload }, { call, put }) {
      let result = yield call(fetchQuoteApproval, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteApprovalList: result.content,
            quoteApprovalPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    *fetchQuoteApprovalPage({ payload }, { call, put }) {
      let result = yield call(fetchQuoteApproval, { ...payload, onlyCountFlag: 'Y' });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteApprovalPagination: createPagination(result),
          },
        });
      }
    },

    *createQuoteApproval({ payload }, { call }) {
      const result = getResponse(yield call(createQuoteApproval, payload));
      return result;
    },

    // 申请转询价创建前校验API
    *checkApplyToInquiry({ payload }, { call }) {
      const result = getResponse(yield call(checkApplyToInquiry, payload));
      return result;
    },
    // 查询分标段物品行
    *fetchAddMaterialData({ payload }, { call, put }) {
      let result = yield call(fetchAddMaterialData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            addMaterialData: dealDataState(result.content),
            addMaterialPagination: createPagination(result),
          },
        });
      }
    },
    // 保存分标段物品行
    *saveSectionItemLine({ payload }, { call }) {
      const result = getResponse(yield call(saveSectionItemLine, payload));
      return result;
    },
    // 删除分标段物品行
    *deleteSectionItemLine({ payload }, { call }) {
      const result = getResponse(yield call(deleteItemLines, payload));
      return result;
    },
    // 批量导入查询已有物品行
    *fetchExistItemLine({ payload }, { call, put }) {
      let result = yield call(fetchExistItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            existItemLine: result.content,
            existItemLinePagination: createPagination(result),
          },
        });
      }
    },
    // 批量导入已有物品行
    *saveSecItemLines({ payload }, { call }) {
      const result = getResponse(yield call(saveSecItemLines, payload));
      return result;
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
