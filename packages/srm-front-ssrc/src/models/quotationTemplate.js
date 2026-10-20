/**
 * model - 报价模板
 * @date: 2019-08-15
 * @author: <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import {
  queryQuotationTemplate,
  saveQuotationTemplate,
  releaseQuotationTemplate,
  unlockQuotationTemplate,
  queryTemplateDetail,
  queryDetaliItem,
  fetchDetailElement,
  queryTemplateDetailRow,
  saveRowDetail,
  saveElementDetail,
  saveTemplateDetail,
  saveQuoRowDetail,
  saveQuoElementDetail,
  deleteTemplateDetail,
  deleteElementDetail,
  queryAssignCategory,
  queryUndistributedMaterial,
  queryAssignedMaterial,
  deleteMaterial,
  addMaterial,
  queryCopyData,
  copyTemplate,
  queryDetailHeader,
  fetchTwoDetails,
  changeEnabledFlag,
} from '@/services/quotationTemplateService';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

function dealChildren(data) {
  // 处理树状table
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      if (item.childFlag) {
        return {
          ...item,
          children: [],
        };
      } else {
        return item;
      }
    });
  }
  return config;
}

export default {
  namespace: 'quotationTemplate',
  state: {
    code: {}, // 模板维度值集
    quotationTemplateList: [], // 报价模板列表
    quotationTemplatePagination: {}, // 报价模板分页参数
    templateDetail: {}, // 模板明细头数据
    templateDetailList: [], // 模板明细列表
    elementDetailList: [], // 自定义明细项列表
    templateDetailPagination: {}, // 模板明细分页参数
    elementDetailPagination: {}, // 模板明细项分页
    undistributedMaterialList: [], // 未分配物料列表
    undistributedMaterialPagination: {}, // 未分配物料分页参数
    assignedMaterialList: [], // 已分配物料列表
    assignedMaterialPagination: {}, // 已分配物料分页参数
    copyDataList: [], // 可复制品类／物料列表
    copyDataPagination: {}, // 可复制品类／物料分页列表
    detailHeader: {}, // 报价明细头
  },
  effects: {
    // 查询值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },

    // 查询报价模板
    *queryQuotationTemplate({ payload }, { call, put }) {
      const result = getResponse(yield call(queryQuotationTemplate, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationTemplateList: result.content,
            quotationTemplatePagination: createPagination(result),
          },
        });
      }
    },

    // 保存报价模板
    *saveQuotationTemplate({ payload }, { call }) {
      const result = getResponse(yield call(saveQuotationTemplate, payload));
      return result;
    },

    // 发布报价模板
    *releaseQuotationTemplate({ payload }, { call }) {
      const result = getResponse(yield call(releaseQuotationTemplate, payload));
      return result;
    },

    // 解锁报价模板
    *unlockQuotationTemplate({ payload }, { call }) {
      const result = getResponse(yield call(unlockQuotationTemplate, payload));
      return result;
    },

    // 报价模板明细查询
    *queryTemplateDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(queryTemplateDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            templateDetail: result,
            templateDetailList: result.quotationTplDtlPage.content,
            templateDetailPagination: createPagination(result.quotationTplDtlPage),
          },
        });
      }
      return result;
    },

    // 自定义报价明细列
    *queryTemplateDetailRow({ payload }, { call, put }) {
      const result = getResponse(yield call(queryTemplateDetailRow, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            templateDetailList: result.content,
            templateDetailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 自定义报价明细项
    *fetchDetailElement({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDetailElement, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            elementDetailList: dealChildren(dealDataState(result.content)),
            elementDetailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询-自定义报价明细项二级
    *fetchTwoDetails({ payload }, { call, put }) {
      const { elementDetailList = [], ...otherPayload } = payload;
      const result = getResponse(yield call(fetchTwoDetails, otherPayload));
      let newElementDetailList = elementDetailList;
      if (result) {
        if (!isEmpty(result)) {
          newElementDetailList = elementDetailList.map(item => {
            if (item.templateDetailId === otherPayload.templateDetailId) {
              return {
                ...item,
                children: dealDataState(result),
              };
            } else {
              return item;
            }
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            elementDetailList: newElementDetailList,
          },
        });
      }
      return newElementDetailList;
    },
    // 自定义报价明细列
    *queryDetaliItem({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDetaliItem, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailItemList: result.content,
            detailItemPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 保存报价模板明细
    *saveTemplateDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveTemplateDetail, payload));
      return result;
    },
    // 保存报价模板明细列
    *saveQuoRowDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveQuoRowDetail, payload));
      return result;
    },
    // 保存报价模板明细项
    *saveQuoElementDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveQuoElementDetail, payload));
      return result;
    },

    // 保存自定义报价明细列
    *saveRowDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveRowDetail, payload));
      return result;
    },
    // 保存自定义报价明细项
    *saveElementDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveElementDetail, payload));
      return result;
    },

    // 删除报价模板明细
    *deleteTemplateDetail({ payload }, { call }) {
      const result = getResponse(yield call(deleteTemplateDetail, payload));
      return result;
    },
    // 删除自定义明细项
    *deleteElementDetail({ payload }, { call }) {
      const result = getResponse(yield call(deleteElementDetail, payload));
      return result;
    },
    // 改变启用
    *changeEnabledFlag({ payload }, { call }) {
      const result = getResponse(yield call(changeEnabledFlag, payload));
      return result;
    },

    // 查询品类树形结构
    *queryAssignCategory({ payload }, { call }) {
      const result = getResponse(yield call(queryAssignCategory, payload));
      const selectedRows = [];
      function getSelectedRows(collection = []) {
        collection.forEach(n => {
          if (n.assignFlag !== 0) {
            selectedRows.push({ ...n, deleteFlag: 0 });
          }
          if (!isEmpty(n.children)) {
            getSelectedRows(n.children);
          }
        });
      }
      getSelectedRows(result);
      return {
        dataSource: result || [],
        selectedRows,
      };
    },

    // 查询未分配物料
    *queryUndistributedMaterial({ payload }, { call, put }) {
      const result = getResponse(yield call(queryUndistributedMaterial, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            undistributedMaterialList: result.content,
            undistributedMaterialPagination: createPagination(result),
          },
        });
      }
    },

    // 查询已分配物料
    *queryAssignedMaterial({ payload }, { call, put }) {
      const result = getResponse(yield call(queryAssignedMaterial, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            assignedMaterialList: result.content,
            assignedMaterialPagination: createPagination(result),
          },
        });
      }
    },

    // 删除当前维度值
    *deleteMaterial({ payload }, { call }) {
      const result = getResponse(yield call(deleteMaterial, payload));
      return result;
    },

    // 新增当前维度值
    *addMaterial({ payload }, { call }) {
      const result = getResponse(yield call(addMaterial, payload));
      return result;
    },

    // 查询可复制品类／物料列表
    *queryCopyData({ payload }, { call, put }) {
      const result = getResponse(yield call(queryCopyData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            copyDataList: result.content,
            copyDataPagination: createPagination(result),
          },
        });
      }
    },

    // 复制模板
    *copyTemplate({ payload }, { call }) {
      const result = getResponse(yield call(copyTemplate, payload));
      return result;
    },

    // 查询报价明细维护头
    *queryDetailHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDetailHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailHeader: result,
          },
        });
      }
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
