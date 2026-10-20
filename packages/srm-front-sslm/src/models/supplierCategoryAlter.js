/**
 * supplierCategoryAlter.js - 供应商分类变更 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  querySupplierCategoryAlter,
  saveSupplierCategoryAlter,
  approveSupplierCategoryAlter,
  rejectSupplierCategoryAlter,
  batchSubmitSupplierCategoryAlter,
  submitSupplierCategoryAlter,
  deleteSupplierCategoryAlter,
  querySupplierCategoryAlterDetail,
  queryCurrentSupplierCtg,
  onDraggerUploadRemove,
  deleteAttachment,
  queryProcessRecord,
  queryCategoryInfo,
  querySupplierInfo,
} from '@/services/supplierCategoryAlterService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'supplierCategoryAlter',

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
    categoryInfo: {}, // 变更分类评分等级及评分信息
    pagination: {}, // 分页参数
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
              (n) => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value)
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
    // 变更分类评分及评分等级
    *queryCategoryInfo({ payload }, { call, put }) {
      const res = yield call(queryCategoryInfo, payload);
      const categoryInfo = getResponse(res);

      yield put({
        type: 'updateState',
        payload: { categoryInfo },
      });
      return categoryInfo;
    },
    // 新增或修改供应商分类节点
    *saveSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(saveSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 同意供应商分类变更申请
    *approveSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(approveSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 拒绝供应商分类变更申请
    *rejectSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(rejectSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 提交供应商分类变更申请
    *submitSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(submitSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 批量提交供应商分类变更申请
    *batchSubmitSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(batchSubmitSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 删除供应商分类变更申请
    *deleteSupplierCategoryAlter({ payload }, { call }) {
      const res = yield call(deleteSupplierCategoryAlter, payload);
      return getResponse(res);
    },
    // 查询供应商分类变更申请明细
    *querySupplierCategoryAlterDetail({ payload }, { call, put }) {
      const res = yield call(querySupplierCategoryAlterDetail, payload);
      const supplierCategoryAlterDetail = getResponse(res);
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
    },
    // 查询当前供应商分类
    *queryCurrentSupplierCtg({ payload }, { call, put }) {
      const { isNew, ...others } = payload;
      const res = yield call(queryCurrentSupplierCtg, others);
      const currentSupplierCtg = getResponse(res);
      if (isNew && currentSupplierCtg.content) {
        currentSupplierCtg.content = currentSupplierCtg.content.map((item) => ({
          categoryAlterLineId: item.categoryAssignId,
          ...item,
        }));
      }

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
    // 删除供应商分类附件行表
    *deleteAttachment({ payload }, { call }) {
      const response = yield call(deleteAttachment, payload);
      return getResponse(response);
    },
    // 删除服务器文件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    // 工作台新建时查询供应商信息
    *querySupplierInfo({ payload }, { call }) {
      const responce = getResponse(yield call(querySupplierInfo, payload));
      return responce;
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
