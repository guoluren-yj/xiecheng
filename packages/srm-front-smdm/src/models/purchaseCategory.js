/**
 * model 自主品类定义
 * @date: 2018-7-2
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';

import { getResponse, createPagination } from 'utils/utils';

import {
  fetchAssignPurchase,
  fetchPurchaseCategory,
  updatePurchaseCategory,
  disableCategory,
  enableCategory,
  disableTemplate,
  enableTemplate,
  fetchCategoryIds,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  fetchTemplateList,
  queryUuid,
  CopyTemplate,
  fetchMateriel,
  saveMateriel,
  deleteMateriel,
  saveAssignPurchase,
  deleteAssignPurchase,
  updateExcessDeliveryFlag,
} from '@/services/purchaseCategoryService';
import { queryIdpValue, queryFileList, removeFileList } from 'services/api';

export const service = {
  async init() {
    return queryIdpValue('SMDM.CATEGORY.IMPORT_STANDARD');
  },
  async initTemplate() {
    return queryIdpValue('SMDM.CATEGORY.REQUIRED');
  },
};

export default {
  namespace: 'smdmPurchaseCategory',

  state: {
    selectedRows: [],
    selectedRowKeys: [],
    modalVisible: false,
    purchaseCategoryList: [], // 品类列表数据
    impStandardList: [], // 品类引入条件值集
    templateData: {}, // 报价模板数据
    cateBidOptions: {}, // 报价模板列表数据
    requiredList: [], // 报价模板必输值集
    materielList: [], // 物料表数据
    assgnPurchaseList: [], // 分配采购madal数据
    materielPagination: {}, // 物料分页
    assgnPurchasePagination: {}, // 分配采购分页
  },

  effects: {
    // 获取初始化数据：引入要求值集
    *init({ payload }, { call, put }) {
      const res = yield call(service.init, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            impStandardList: list,
          },
        });
      }
    },
    // 获取采购品类列表
    *fetchPurchaseCategory({ payload }, { call, put }) {
      const res = yield call(fetchPurchaseCategory, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            purchaseCategoryList: list,
          },
        });
      }
      return list;
    },
    // 获取采购品类列表
    *fetchCategoryIds({ payload }, { call, put }) {
      const res = yield call(fetchCategoryIds, payload);
      if (res) {
        yield put({
          type: 'saveReducers',
          payload: {
            expandedList: res,
          },
        });
      }
      return getResponse(res);
    },
    // 新增或更新采购品类
    *updatePurchaseCategory({ payload }, { call }) {
      const res = yield call(updatePurchaseCategory, payload);
      return getResponse(res);
    },
    // 设置品类启用
    *enableCategory({ payload }, { call }) {
      const res = yield call(enableCategory, payload);
      return getResponse(res);
    },
    // 设置品类禁用
    *disableCategory({ payload }, { call }) {
      const res = yield call(disableCategory, payload);
      return getResponse(res);
    },
    // 设置报价模板启用
    *enableTemplate({ payload }, { call }) {
      const res = yield call(enableTemplate, payload);
      return getResponse(res);
    },
    // 设置报价模板禁用
    *disableTemplate({ payload }, { call }) {
      const res = yield call(disableTemplate, payload);
      return getResponse(res);
    },
    // 获取报价模板初始化数据：必输值集
    *initTemplate({ payload }, { call, put }) {
      const res = yield call(service.initTemplate, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            requiredList: list,
            cateBidOptions: {},
          },
        });
      }
    },
    // 获取报价模板数据
    *fetchTemplate({ payload }, { call, put }) {
      const res = yield call(fetchTemplate, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            templateData: list,
          },
        });
      }
      return list;
    },
    // 获取报价模板行数据
    *fetchTemplateList({ payload }, { call, put }) {
      const res = yield call(fetchTemplateList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            cateBidOptions: list,
          },
        });
      }
      return list;
    },
    // 复制报价模板
    *CopyTemplate({ payload }, { call, put }) {
      const res = yield call(CopyTemplate, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'saveReducers',
          payload: {
            templateData: list,
            cateBidOptions: {
              content: list.cateBidOptions.map((item) => {
                return {
                  ...item,
                  isCreate: true,
                  optionId: uuid(),
                };
              }),
            },
          },
        });
      }
      return list;
    },
    // 更新价模板
    *updateTemplate({ payload }, { call }) {
      const res = yield call(updateTemplate, payload);
      return getResponse(res);
    },
    // 新增报价模板
    *createTemplate({ payload }, { call }) {
      const res = yield call(createTemplate, payload);
      return getResponse(res);
    },
    // 报价模板上传附件
    *fetchUuid({ payload }, { call }) {
      const res = yield call(queryUuid, payload);
      return getResponse(res);
    },
    // 获取文件
    *queryFileList({ payload }, { call }) {
      const res = yield call(queryFileList, payload);
      return getResponse(res);
    },
    // 删除文件
    *removeFile({ payload }, { call }) {
      const res = yield call(removeFileList, payload);
      return getResponse(res);
    },

    // 查询品类下的物料
    *fetchMateriel({ payload }, { call, put }) {
      const res = yield call(fetchMateriel, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { materielList: data.content, materielPagination: createPagination(data) },
        });
      }
    },
    // 保存和品类关联的物料
    *saveMateriel({ payload }, { call }) {
      const res = yield call(saveMateriel, payload);
      return getResponse(res);
    },
    // 删除和品类关联的物料
    *deleteMateriel({ payload }, { call }) {
      const res = yield call(deleteMateriel, payload);
      return getResponse(res);
    },

    // 查询分配采购
    *fetchAssignPurchase({ payload }, { call, put }) {
      const res = yield call(fetchAssignPurchase, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            assgnPurchaseList: data.content.map((item) => {
              return { _status: 'update', ...item };
            }),
            assgnPurchasePagination: createPagination(data),
          },
        });
      }
    },

    // 分配采购保存
    *saveAssignPurchase({ payload }, { call }) {
      const res = yield call(saveAssignPurchase, payload);
      return getResponse(res);
    },

    // 分配采购删除
    *deleteAssignPurchase({ payload }, { call }) {
      const res = yield call(deleteAssignPurchase, payload);
      return getResponse(res);
    },
    *updateExcessDeliveryFlag({ payload }, { call }) {
      const res = yield call(updateExcessDeliveryFlag, payload);
      return getResponse(res);
    },
  },
  reducers: {
    saveReducers(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
