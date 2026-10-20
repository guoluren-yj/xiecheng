/**
 * groupMaterielMapping - 集团物料映射
 * @date: 2020-2-11
 * @author hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import { queryIdpValue, queryUnifyIdpValue } from 'services/api';
import {
  fetchCategoryMappingList,
  fetchEcCategoryMappingList,
  fetchProductMappingList,
  fetchEcProductMappingList,
  fetchCategoryList,
  fetchMaterielList,
  setCategoryMap,
  setEcCategoryMap,
  setProductMap,
  setEcProductMap,
  delCategoryMap,
  delEcCategoryMap,
  delProductMap,
  delEcProductMap,
} from '@/services/groupMaterielMappingService';

const organizationId = getCurrentOrganizationId(); // 租户ID

export default {
  namespace: 'groupMaterielMapping',
  state: {
    mapStatusList: [], // 映射状态值集
    productSourceList: [], // 商品来源值集
    categoryMapList: [], // 目录映射物料
    ecCategoryMapList: [], // 电商分类映射物料
    productMapList: [], // 电商商品映射物料
    ecProductMapList: [], // 目录化商品映射物料
    categoryMapPagination: {}, // 目录映射物料分页信息
    ecCategoryMapPagination: {}, // 电商商品映射物料分页信息
    productMapPagination: {}, // 电商商品映射物料分页信息
    ecProductMapPagination: {}, // 目录化商品映射物料分页信息
    categoryList: [], // 品类列表
    materielList: [], // 物料列表
    categoryPagination: [], // 品类列表分页信息
    materielPagination: [], // 物料列表分页信息
  },
  effects: {
    // 查询映射状态/商品来源值集
    *fetchValueList(_, { call, put }) {
      const mapStatusList = getResponse(yield call(queryIdpValue, 'SCEC.MAPPING_STATUS'));
      const productSourceList = getResponse(
        yield call(queryUnifyIdpValue, 'SCEC.GROUP_EC_CLIENT', {
          tenantId: organizationId,
        })
      );
      if (mapStatusList || productSourceList) {
        yield put({
          type: 'updateState',
          payload: {
            mapStatusList,
            productSourceList,
          },
        });
      }
    },
    // 查询目录映射物料
    *fetchCategoryMappingList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchCategoryMappingList, { ...payload }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            categoryMapList: response.content.map(item => ({ ...item, _status: 'update' })),
            categoryMapPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询电商分类映射物料
    *fetchEcCategoryMappingList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchEcCategoryMappingList, { ...payload }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ecCategoryMapList: response.content.map(item => ({ ...item, _status: 'update' })),
            ecCategoryMapPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询电商商品映射物料
    *fetchProductMappingList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchProductMappingList, { ...payload }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            productMapList: response.content.map(item => ({ ...item, _status: 'update' })),
            productMapPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询目录化商品映射物料
    *fetchEcProductMappingList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchEcProductMappingList, { ...payload }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            ecProductMapList: response.content.map(item => ({ ...item, _status: 'update' })),
            ecProductMapPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询品类列表
    *fetchCategoryList({ payload }, { call, put }) {
      const categoryList = getResponse(yield call(fetchCategoryList, { ...payload }));
      if (categoryList) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList,
          },
        });
      }
      return categoryList;
    },
    // 查询物料列表
    *fetchMaterielList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchMaterielList, { ...payload }));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            materielList: response.content,
            materielPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 目录映射物料
    *setCategoryMap({ payload }, { call }) {
      return getResponse(yield call(setCategoryMap, payload));
    },
    // 电商分类映射物料
    *setEcCategoryMap({ payload }, { call }) {
      return getResponse(yield call(setEcCategoryMap, payload));
    },
    // 电商商品映射物料
    *setProductMap({ payload }, { call }) {
      return getResponse(yield call(setProductMap, payload));
    },
    // 目录化商品映射物料
    *setEcProductMap({ payload }, { call }) {
      return getResponse(yield call(setEcProductMap, payload));
    },
    // 删除目录物料映射
    *delCategoryMap({ payload }, { call }) {
      return getResponse(yield call(delCategoryMap, payload));
    },
    // 删除电商分类物料映射
    *delEcCategoryMap({ payload }, { call }) {
      return getResponse(yield call(delEcCategoryMap, payload));
    },
    // 删除电商商品物料映射
    *delProductMap({ payload }, { call }) {
      return getResponse(yield call(delProductMap, payload) || {});
    },
    // 删除目录化商品物料映射
    *delEcProductMap({ payload }, { call }) {
      return getResponse(yield call(delEcProductMap, payload));
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
