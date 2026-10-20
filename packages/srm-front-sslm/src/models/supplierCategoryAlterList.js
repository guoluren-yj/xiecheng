/**
 * supplierCategoryAlterList.js - 供应商分类变更申请查询 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  querySupplierCategoryAlter,
  querySupplierCategoryAlterDetail,
  queryCurrentSupplierCtg,
  queryProcessRecord,
} from '@/services/supplierCategoryAlterService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'supplierCategoryAlterList',

  state: {
    categoryAlterStatusList: [], // 分类变更申请状态
    categoryAlterOpsTypeList: [], // 分类变更申请操作类型
    evaluationLevel: [], // 评级
    supplierCategoryAlterList: {}, // 供应商分类变更申请列表
    supplierCategoryAlterDetail: {}, // 供应商分类变更申请明细
    currentSupplierCtg: {}, // 当前供应商分类
    currentSupplierCtgPage: {}, // 当前供应商分类分页
    categoryAlterAttachmentLine: [], // 附件上传列表
    processRecordList: {}, // 操作记录列表
    expand: false, // 查询条件是否展开
  },

  effects: {
    // 初始化独立值集
    *init(_, { call, put }) {
      const lovCode = {
        categoryAlterStatusList: 'SSLM.SUPPLIER_CTG_ALTER_STATUS',
        categoryAlterOpsTypeList: 'SSLM.SUPPLIER_CTG_ALTER_TYPE',
        evaluationLevel: 'SSLM.EVALUATION_LEVEL',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            categoryAlterStatusList: res.categoryAlterStatusList.filter(
              n => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value)
            ),
            categoryAlterOpsTypeList: res.categoryAlterOpsTypeList,
            evaluationLevel: res.evaluationLevel,
          },
        });
      }
    },
    // 查询供应商分类变更申请列表
    *querySupplierCategoryAlter({ payload }, { call, put }) {
      const res = yield call(querySupplierCategoryAlter, payload);
      const supplierCategoryAlterList = getResponse(res);
      const pagination = createPagination(supplierCategoryAlterList);

      yield put({
        type: 'updateState',
        payload: { supplierCategoryAlterList, pagination },
      });
    },
    // 查询供应商分类变更申请明细
    *querySupplierCategoryAlterDetail({ payload }, { call, put }) {
      const res = yield call(querySupplierCategoryAlterDetail, payload);
      const supplierCategoryAlterDetail = getResponse(res);
      if (supplierCategoryAlterDetail) {
        const { supplierCategoryAlter } = supplierCategoryAlterDetail;
        const { categoryAlterAttachmentLine } = supplierCategoryAlterDetail;
        const { supplierCategoryAlterLinePage } = supplierCategoryAlterDetail;
        const currentSupplierCtgPage = createPagination(supplierCategoryAlterLinePage);

        yield put({
          type: 'updateState',
          payload: {
            supplierCategoryAlterDetail,
            categoryAlterAttachmentLine,
            currentSupplierCtg: supplierCategoryAlterLinePage,
            currentSupplierCtgPage,
          },
        });
        return supplierCategoryAlter;
      }
    },
    // 查询当前供应商分类
    *queryCurrentSupplierCtg({ payload }, { call, put }) {
      const res = yield call(queryCurrentSupplierCtg, payload);
      const currentSupplierCtg = getResponse(res);
      const currentSupplierCtgPage = createPagination(currentSupplierCtg);

      yield put({
        type: 'updateState',
        payload: { currentSupplierCtg, currentSupplierCtgPage },
      });
    },
    // 查询操作记录
    *queryProcessRecord({ payload }, { call, put }) {
      const res = yield call(queryProcessRecord, payload);
      const processRecordList = getResponse(res);

      yield put({
        type: 'updateState',
        payload: { processRecordList },
      });
      return processRecordList;
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
