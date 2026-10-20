/**
 * model - 供应商能力
 * @date: 2018-10-3
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  queryUUID,
  queryFileListOrg,
  removeFileOrg,
  queryUnifyIdpValue,
  queryMapIdpValue,
} from 'services/api';
import {
  queryList,
  queryHeaderInfo,
  // queryCategoryMaterial,
  deleteCategoryMaterialData,
  deleteEnclosureTableData,
  querySupplierClassification,
  queryEnclosure,
  saveAll,
  queryReviewList,
  queryReviewDetail,
  queryOperation,
  checkValid,
  onDraggerUploadRemove,
  queryLineAttachment,
  saveLineAttachment,
  deleteLineAttachment,
  submitLines,
  handleValidate,
  querySupplierInfo,
  expandCategory,
  queryAbilityDimension,
  queryCategoryUsePost,
  saveBatchLine,
} from '@/services/supplyAbilityService';

export default {
  namespace: 'supplyAbility',
  state: {
    code: {}, // 值集集合
    definitionData: {}, // 供货能力定义表
    headerInfo: {}, // 详细表单信息
    categoryMaterialData: {}, // 物料/品类表
    supplierClassificationData: {},
    enclosureData: [], // 附件表
    reviewData: {}, // 评审列表页
    reviewMaterialData: {}, // 评审推荐物料/品类表数据
    operationData: {}, // 操作记录
    stageList: [], // 阶段列表
    enclosureVisible: false, // 判断附件三个必填字段是否为空
  },
  effects: {
    // 查询值集
    *queryValueSet({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { code: res },
        });
      }
    },
    // 值集查询
    *init({ payload }, { call }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      return res;
    },
    // 查询列表页
    *queryList({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { definitionData: data, definitionPagination: createPagination(data) },
        });
      }
      // 异步获取 totalElements
      if (data && data.needCountFlag === 'Y') {
        const resForCount = yield call(queryList, { ...payload, onlyCountFlag: 'Y' });
        const listForCount = getResponse(resForCount);
        if (listForCount) {
          yield put({
            type: 'updateState',
            payload: {
              definitionData: data,
              definitionPagination: createPagination(listForCount),
            },
          });
        }
      }
    },
    // 查询供应商分类
    *querySupplierClassification({ payload }, { call, put }) {
      const response = yield call(querySupplierClassification, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { supplierClassificationData: data },
        });
      }
      return data || {};
    },
    // 查询详情页
    *queryDetail({ payload }, { call, put }) {
      const { bodyData, ...others } = payload;
      const header = getResponse(yield call(queryHeaderInfo, others));
      const categoryMaterial = getResponse(yield call(queryCategoryUsePost, payload));
      const enclosure = getResponse(yield call(queryEnclosure, others));
      if (!isEmpty(header)) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: header,
            categoryMaterialData: categoryMaterial,
            enclosureData: enclosure,
          },
        });
      }
      const allData = {
        headerInfo: header,
        categoryMaterialData: categoryMaterial,
        enclosureData: enclosure,
      };
      return allData;
    },
    // 查询详情物料行
    *queryCategoryMaterial({ payload }, { call }) {
      const res = getResponse(yield call(queryCategoryUsePost, payload));
      return res;
    },

    // 删除推荐物料/品类
    *deleteCategoryMaterialData({ payload }, { call }) {
      return getResponse(yield call(deleteCategoryMaterialData, payload));
    },
    // 删除附件表
    *deleteEnclosureTableData({ payload }, { call }) {
      return getResponse(yield call(deleteEnclosureTableData, payload));
    },
    // 保存所有
    *saveAll({ payload }, { call }) {
      return getResponse(yield call(saveAll, payload));
    },

    // 查询评审列表
    *queryReviewList({ payload }, { call, put }) {
      const response = yield call(queryReviewList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { reviewData: data },
        });
      }
    },
    // 查询评审详情
    *queryReviewDetail({ payload }, { call, put }) {
      const data = getResponse(yield call(queryReviewDetail, payload));
      if (!isEmpty(data)) {
        yield put({
          type: 'updateState',
          payload: {
            reviewMaterialData: data,
            reviewMaterialPagination: createPagination(data),
          },
        });
      }
      // 异步获取 totalElements
      if (data && data.needCountFlag === 'Y') {
        const resForCount = yield call(queryReviewDetail, { ...payload, onlyCountFlag: 'Y' });
        const listForCount = getResponse(resForCount);
        if (listForCount) {
          yield put({
            type: 'updateState',
            payload: {
              reviewMaterialData: data,
              reviewMaterialPagination: createPagination(listForCount),
            },
          });
        }
      }
    },
    // 查询操作记录
    *queryOperation({ payload }, { call, put }) {
      const data = getResponse(yield call(queryOperation, payload));
      if (!isEmpty(data)) {
        yield put({
          type: 'updateState',
          payload: {
            operationData: data,
          },
        });
      }
    },

    // 创建供货清单的校验
    *checkValid({ payload }, { call }) {
      const res = yield call(checkValid, payload);
      return getResponse(res);
    },

    // 查询UUID
    *fetchUuid({ payload }, { call }) {
      const res = yield call(queryUUID, payload);
      return getResponse(res);
    },

    // 获取文件
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
    },
    // 通过uuid删除附件
    *removeFileOrg({ payload }, { call }) {
      const res = yield call(removeFileOrg, payload);
      return getResponse(res);
    },
    // 通过url删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const res = yield call(onDraggerUploadRemove, payload);
      return getResponse(res);
    },

    // 查询阶段列表
    *queryStageList({ payload }, { call, put }) {
      const stageList = getResponse(
        yield call(queryUnifyIdpValue, payload.lovCode, { tenantId: payload.organizationId })
      );
      yield put({
        type: 'updateState',
        payload: {
          stageList,
        },
      });
    },
    *enclosureVisible({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          ...payload,
        },
      });
      return payload;
    },
    // 查询供货能力清单行附件
    *queryLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryLineAttachment, payload));
      return res;
    },
    // 保存供货能力清单行附件
    *saveLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveLineAttachment, payload));
      return res;
    },
    // 删除供货能力清单行附件
    *deleteLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteLineAttachment, payload));
      return res;
    },
    // 提交勾选数据
    *submitLines({ payload }, { call }) {
      return getResponse(yield call(submitLines, payload));
    },
    // 校验勾选数据
    *handleValidate({ payload }, { call }) {
      return getResponse(yield call(handleValidate, payload));
    },
    // 工作台新建时查询供应商信息
    *querySupplierInfo({ payload }, { call }) {
      const responce = getResponse(yield call(querySupplierInfo, payload));
      return responce;
    },
    // 查询配置中心供货能力管控维度
    *queryAbilityDimension({ payload }, { call }) {
      const responce = getResponse(yield call(queryAbilityDimension, payload));
      return responce;
    },
    // 一键拓展
    *expandCategory({ payload }, { call }) {
      const response = getResponse(yield call(expandCategory, payload));
      return response;
    },
    // 保存批量编辑物料/品类
    *saveBatchLine({ payload }, { call }) {
      return getResponse(yield call(saveBatchLine, payload));
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
