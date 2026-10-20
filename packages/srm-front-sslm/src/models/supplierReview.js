/**
 * model - 合格供应商评审
 * @date: 2018-9-20
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { queryUnifyIdpValue } from 'services/api';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  querySupplierReview,
  queryDetail,
  onDraggerUploadRemove,
  saveSupplierReview,
  submitSupplierReview,
  deleteEnclosureData,
  querySupplierClassification,
  queryReviewDetail,
  queryMaterialsCategories,
} from '@/services/supplierReviewService';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'supplierReview',
  state: {
    code: {}, // 值集集合
    requisitionDataSoruce: [], // 评审表数据
    scoreInforDataSoruce: [], // 评分信息表数据
    enclosureDataSource: [], // 附件表数据
    headerInfo: {}, // 头信息
    supplierClassificationData: [], // 供应商分类
    reviewMaterialData: {}, // 供货能力清单
    reviewMaterialPagination: {}, // 供货能力清单分页信息
    materialsCategoriesList: [], // 推荐物料/品类
    reviewedList: [], // 已评审列表
    reviewedPagination: {}, // 已评审列表分页参数
  },
  effects: {
    // 查询值集
    *init(_, { call, put }) {
      const stageList = getResponse(
        yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE', { tenantId })
      );
      if (stageList) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              stageList,
            },
          },
        });
      }
    },

    // 查询数据
    *querySupplierReview({ payload }, { call, put }) {
      const response = yield call(querySupplierReview, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            requisitionDataSoruce: data,
            pagination: createPagination(data),
          },
        });
      }
    },
    // 查询已评审数据
    *queryReviewedList({ payload }, { call, put }) {
      const response = yield call(querySupplierReview, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            reviewedList: data.content,
            reviewedPagination: createPagination(data),
          },
        });
      }
    },
    // 查询详情
    *queryDetail({ payload }, { call, put }) {
      const response = yield call(queryDetail, payload);
      const data = getResponse(response);
      if (data) {
        const { scoreLines, qualifiedAttachmentLines, ...headerInfo } = data;
        yield put({
          type: 'updateState',
          payload: {
            scoreInforDataSoruce: scoreLines,
            enclosureDataSource: qualifiedAttachmentLines,
            headerInfo,
          },
        });
      }
      return data || {};
    },
    // 删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    *saveSupplierReview({ payload }, { call }) {
      const response = yield call(saveSupplierReview, payload);
      return getResponse(response);
    },
    *submitSupplierReview({ payload }, { call }) {
      const response = yield call(submitSupplierReview, payload);
      return getResponse(response);
    },
    // 删除附件表格数据
    *deleteEnclosureData({ payload }, { call }) {
      const response = yield call(deleteEnclosureData, payload);
      return getResponse(response);
    },
    // 查询供应商分类表
    *querySupplierClassification({ payload }, { call, put }) {
      const response = yield call(querySupplierClassification, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { supplierClassificationData: data },
        });
      }
    },

    // 查询供货能力清单
    *queryReviewDetail({ payload }, { call, put }) {
      const data = getResponse(yield call(queryReviewDetail, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            reviewMaterialData: data,
            reviewMaterialPagination: createPagination(data),
          },
        });
      }
    },

    // 查询推荐物料/品类
    *queryMaterialsCategories({ payload }, { call, put }) {
      const data = getResponse(yield call(queryMaterialsCategories, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            materialsCategoriesList: data,
          },
        });
      }
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
