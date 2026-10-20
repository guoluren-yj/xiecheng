/**
 * ecCategoryCompanyCatalog -电商分类映射公司目录 model
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCategoryCompanyCatalog,
  setEcCategoryMap,
  setPermissionSetEnable,
} from '@/services/ecCategoryCompanyCatalogService';
import { fetchEcCategoryCatalog } from '@/services/ecCategoryCatalogService';

export default {
  namespace: 'ecCategoryCompanyCatalog',
  state: {
    list: {},
    companyList: {},
    pagination: {},
    comPagination: {},
    mapStatusList: [],
  },
  effects: {
    // 查询集团映射
    *fetchEcCategoryCatalog({ payload }, { call, put }) {
      const response = yield call(fetchEcCategoryCatalog, { ...payload });
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
    // 查询公司映射
    *fetchEcCategoryCompanyCatalog({ payload }, { call, put }) {
      const response = yield call(fetchEcCategoryCompanyCatalog, { ...payload });
      const companyList = getResponse(response);
      if (companyList) {
        yield put({
          type: 'updateState',
          payload: {
            companyList,
            comPagination: createPagination(companyList),
          },
        });
      }
    },

    // 映射操作
    *setEcCategoryMap({ payload }, { call }) {
      const res = yield call(setEcCategoryMap, payload);
      return getResponse(res);
    },

    // 启用禁用公司目录
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
