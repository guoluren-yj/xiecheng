/**
 * model - 导入Erp
 * @date: 2019-1-8
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  querySupplierAddress,
  querySupplierContact,
  querySupplierAccount,
  saveSupplierAccount,
  queryFinance,
  saveFinance,
  deleteFinance,
  queryErp,
  saveErp,
  importData, // 导入SAP
  importEbsData, // 导入EBS
  fetchCreateRow, // 采购/财务新增接口
  queryEbs, // 查询ebs数据
  querySuLocation, // 查询供应商信息
  saveSuLocation, // 保存供应商信息
  deleteSuLocation, // 删除供应商信息
  queryOUMessage, // 查询OU信息
  saveOUMessage, // 保存OU信息
  deleteOUMessage, // 删除OU信息
  hang, // 暂不处理
  hangEbs, // ebs暂不处理
  deleteLine, // 删除
  deleteEbsOuId, // 删除OU层信息
  handleInterfaceQuery, // 查询"接口查询"
  batchImportAgain, // 批量重新导入
  handleReloadQuery, // 重新查询
} from '@/services/importErpService';

export default {
  namespace: 'importErp',

  state: {
    code: {}, // 值集
    financeList: [], // 采购财务
    financePagination: {}, // 采购财务分页参数
    erpList: [], // 导入Erp数据
    erpPagination: {}, // 分页
    supplierAddressList: [],
    supplierAddressPagination: {},
    supplierContactList: [],
    supplierContactPagination: {},
    supplierAccountList: [],
    supplierAccountPagination: {},
    purchaseAccountData: {}, // 采购/财务modal 新建时显示数据
    applicationStatus: [], // 值集
    ebsList: [], // 导入EBS数据
    ebsPagination: {}, // 导入EBS分页信息
    supplierLoData: [], // 供应商地址数据
    supplierLoPagination: {}, // 供应商地址分页信息
    OuMessageList: [], // OU信息数据弹出框信息
    OuMessagePagination: {}, // OU信息分页信息
    interfaceList: [], // 接口查询数据集合
    interfacePagination: {}, // 接口查询分页参数
  },

  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 新增接口查询页面
    *fetchCreateRow({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchCreateRow, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: { purchaseAccountData: response },
        });
      }
      return response;
    },

    // 供应商地址查询
    *querySupplierAddress({ payload }, { call, put }) {
      const response = yield call(querySupplierAddress, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierAddressList: data,
            supplierAddressPagination: createPagination(data),
          },
        });
      }
    },

    // 供应商联系人查询
    *querySupplierContact({ payload }, { call, put }) {
      const response = yield call(querySupplierContact, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierContactList: data,
            supplierContactPagination: createPagination(data),
          },
        });
      }
    },

    // 供应商账户查询
    *querySupplierAccount({ payload }, { call, put }) {
      const response = yield call(querySupplierAccount, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierAccountList: data.content,
            supplierAccountPagination: createPagination(data),
          },
        });
      }
    },

    // 供应商账户保存
    *saveSupplierAccount({ payload }, { call }) {
      return getResponse(yield call(saveSupplierAccount, payload));
    },

    // 采购/财务查询
    *queryFinance({ payload }, { call, put }) {
      const response = yield call(queryFinance, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            financeList: data.content,
            financePagination: createPagination(data),
          },
        });
      }
    },

    // 保存采购/财务
    *saveFinance({ payload }, { call }) {
      const response = yield call(saveFinance, payload);
      return getResponse(response);
    },

    // 删除采购/财务
    *deleteFinance({ payload }, { call }) {
      const response = yield call(deleteFinance, payload);
      return getResponse(response);
    },

    // 导入SAP查询
    *queryErp({ payload }, { call, put }) {
      const response = yield call(queryErp, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            erpList: data.content,
            erpPagination: createPagination(data),
          },
        });
      }
    },

    // 保存
    *saveErp({ payload }, { call }) {
      const response = yield call(saveErp, payload);
      return getResponse(response);
    },

    // 暂不处理
    *hang({ payload }, { call }) {
      const response = yield call(hang, payload);
      return getResponse(response);
    },

    // Ebs暂不处理
    *hangEbs({ payload }, { call }) {
      const response = yield call(hangEbs, payload);
      return getResponse(response);
    },

    // 导入SAP
    *importData({ payload }, { call }) {
      const response = yield call(importData, payload);
      return getResponse(response);
    },
    // 导入EBS
    *importEbsData({ payload }, { call }) {
      const response = yield call(importEbsData, payload);
      return getResponse(response);
    },

    // 查询值集
    *queryCode({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { applicationStatus: res.applicationStatus },
        });
      }
    },

    // 导入EBS数据查询
    *queryEbs({ payload }, { call, put }) {
      const response = getResponse(yield call(queryEbs, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ebsList: response.content,
            ebsPagination: createPagination(response),
          },
        });
      }
    },

    // 查询供应商地址信息
    *querySuLocationInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(querySuLocation, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLoData: res.content || [],
            supplierLoPagination: createPagination(res),
          },
        });
      }
    },
    // 保存供应商地址信息
    *saveSuLocationInfo({ payload }, { call }) {
      const res = getResponse(yield call(saveSuLocation, payload));
      return res;
    },
    // 删除供应商地址信息
    *deleteSuLocationInfo({ payload }, { call }) {
      const res = getResponse(yield call(deleteSuLocation, payload));
      return res;
    },

    // 弹出框OU信息查询
    *queryOUMessage({ payload }, { call, put }) {
      const res = getResponse(yield call(queryOUMessage, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            OuMessageList: res.content || [],
            OuMessagePagination: createPagination(res),
          },
        });
      }
    },
    // 保存供应商OU信息
    *saveOUMessage({ payload }, { call }) {
      const res = getResponse(yield call(saveOUMessage, payload));
      return res;
    },
    // 删除供应商OU信息
    *deleteOUMessage({ payload }, { call }) {
      const res = getResponse(yield call(deleteOUMessage, payload));
      return res;
    },

    *deleteLine({ payload }, { call }) {
      const res = getResponse(yield call(deleteLine, payload));
      return res;
    },

    *deleteEbsOuId({ payload }, { call }) {
      const res = getResponse(yield call(deleteEbsOuId, payload));
      return res;
    },
    // 查询"接口查询"
    *handleInterfaceQuery({ payload }, { call, put }) {
      const res = getResponse(yield call(handleInterfaceQuery, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceList: res.content,
            interfacePagination: createPagination(res),
          },
        });
      }
    },
    // 批量重新导入
    *batchImportAgain({ payload }, { call }) {
      const res = getResponse(yield call(batchImportAgain, payload));
      return res;
    },
    *handleReloadQuery({ payload }, { call }) {
      const res = getResponse(yield call(handleReloadQuery, payload));
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
  },
};
