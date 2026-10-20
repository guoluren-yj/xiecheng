/**
 * ecMaterielMapping -电商分类映射租户目录 model
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId, getResponse, createPagination } from 'utils/utils';
import {
  fetchCatalogRefs,
  fetchEcCatalogRefs,
  fetchEcProductCatalogRefs,
  fetchProductCatalogRefs,
  setCatalogRefsMap,
  setEcCatalogRefsMap,
  setEcProductCatalogRefsMap,
  setProductCatalogRefsMap,
  deleteCatalogRefsMap,
  deleteEcCatalogRefsMap,
  deleteEcProductCatalogRefsMap,
  deleteProductCatalogRefsMap,
  fetchReference,
  fetchMaterielCode,
  fetchCategoryCode,
} from '@/services/ecMaterielMappingService';
import { queryIdpValue, queryUnifyIdpValue } from 'services/api';

const organizationId = getCurrentOrganizationId(); // 租户ID

export default {
  namespace: 'ecMaterielMapping',
  state: {
    catalogRefsList: {}, // 目录映射物料list
    ecCatalogRefsList: {}, // 电商分类映射物料list
    ecProductCatalogList: {}, // 商品(电商)映射物料list
    productCatalogList: {}, // 商品(目录化)映射物料list
    catalogPagination: {}, // 目录映射物料分页
    ecCatalogPagination: {}, // 电商分类映射物料分页
    ecProductCatalogPagination: {}, // 商品(电商)映射物料分页
    productCatalogPagination: {}, // 商品(目录化)映射物料分页
    mapStatusList: [], // 映射状态值集
    ecPlatformList: [], // 商品来源值集
    materielList: [],
    materielPagination: {},
    categoryList: [],
  },
  effects: {
    // 物料查询
    *fetchMaterielCode({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchMaterielCode, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            materielList: result.content,
            materielPagination: createPagination(result),
          },
        });
      }
    },

    // 品类查询
    *fetchCategoryCode({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchCategoryCode, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList: result,
          },
        });
      }
    },

    // 集团引用
    *fetchReference({ payload }, { call }) {
      const response = yield call(fetchReference, payload);
      const result = getResponse(response);
      return result;
    },

    // 查询映射状态值集
    *queryMapStatusList(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SCEC.MAPPING_STATUS');
      const mapStatusList = getResponse(response);
      if (mapStatusList) {
        yield put({
          type: 'updateState',
          payload: {
            mapStatusList,
          },
        });
      }
    },

    // 查询商品来源值集
    *queryEcPlatformList({ payload }, { call, put }) {
      const response = yield call(queryUnifyIdpValue, 'SCEC.EC_COMPANY_ASSIGN', {
        ...payload,
        tenantId: organizationId,
      });
      const ecPlatformList = getResponse(response);
      if (ecPlatformList) {
        yield put({
          type: 'updateState',
          payload: {
            ecPlatformList,
          },
        });
      }
    },

    // 目录化映射物料查询
    *fetchCatalogRefs({ payload }, { call, put }) {
      const response = yield call(fetchCatalogRefs, { ...payload });
      const catalogRefsList = getResponse(response);
      if (catalogRefsList) {
        yield put({
          type: 'updateState',
          payload: {
            catalogRefsList,
            catalogPagination: createPagination(catalogRefsList),
          },
        });
      }
    },

    // 电商分类映射物料查询
    *fetchEcCatalogRefs({ payload }, { call, put }) {
      const response = yield call(fetchEcCatalogRefs, { ...payload });
      const ecCatalogRefsList = getResponse(response);
      if (ecCatalogRefsList) {
        yield put({
          type: 'updateState',
          payload: {
            ecCatalogRefsList,
            ecCatalogPagination: createPagination(ecCatalogRefsList),
          },
        });
      }
    },

    // 商品(电商)映射物料查询
    *fetchEcProductCatalogRefs({ payload }, { call, put }) {
      const response = yield call(fetchEcProductCatalogRefs, { ...payload });
      const ecProductCatalogList = getResponse(response);
      if (ecProductCatalogList) {
        yield put({
          type: 'updateState',
          payload: {
            ecProductCatalogList,
            ecProductCatalogPagination: createPagination(ecProductCatalogList),
          },
        });
      }
    },

    // 商品(目录化)映射物料查询
    *fetchProductCatalogRefs({ payload }, { call, put }) {
      const response = yield call(fetchProductCatalogRefs, { ...payload });
      const productCatalogList = getResponse(response);
      if (productCatalogList) {
        yield put({
          type: 'updateState',
          payload: {
            productCatalogList,
            productCatalogPagination: createPagination(productCatalogList),
          },
        });
      }
    },

    // 目录化映射物料-映射
    *setCatalogRefsMap({ payload }, { call }) {
      const res = yield call(setCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 电商分类映射物料-映射
    *setEcCatalogRefsMap({ payload }, { call }) {
      const res = yield call(setEcCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 商品(电商)映射物料-映射
    *setEcProductCatalogRefsMap({ payload }, { call }) {
      const res = yield call(setEcProductCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 商品(目录化)映射物料-映射
    *setProductCatalogRefsMap({ payload }, { call }) {
      const res = yield call(setProductCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 删除目录映射物料
    *deleteCatalogRefsMap({ payload }, { call }) {
      const res = yield call(deleteCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 删除电商分类映射物料
    *deleteEcCatalogRefsMap({ payload }, { call }) {
      const res = yield call(deleteEcCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 删除商品(电商)映射物料
    *deleteEcProductCatalogRefsMap({ payload }, { call }) {
      const res = yield call(deleteEcProductCatalogRefsMap, payload);
      return getResponse(res);
    },

    // 删除商品(目录化)映射物料
    *deleteProductCatalogRefsMap({ payload }, { call }) {
      const res = yield call(deleteProductCatalogRefsMap, payload);
      return getResponse(res);
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
