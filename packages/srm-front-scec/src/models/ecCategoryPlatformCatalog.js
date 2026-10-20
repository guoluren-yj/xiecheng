/**
 * ecCategoryPlatformCatalog -电商分类映射平台目录 model
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCategoryPlatformCatalog,
  setPlatformEcCategoryMap,
  setPermissionSetEnable,
} from '@/services/ecCategoryPlatformCatalogService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'ecCategoryPlatformCatalog',
  state: {
    list: {},
    pagination: {},
    mapStatusList: [],
  },
  effects: {
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
    *fetchEcCategoryPlatformCatalog({ payload }, { call, put }) {
      const response = yield call(fetchEcCategoryPlatformCatalog, { ...payload });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },
    *setPlatformEcCategoryMap({ payload }, { call }) {
      const res = yield call(setPlatformEcCategoryMap, payload);
      return getResponse(res);
    },

    // 启用禁用平台目录
    *setPermissionSetEnable({ payload }, { call }) {
      const res = yield call(setPermissionSetEnable, payload);
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
