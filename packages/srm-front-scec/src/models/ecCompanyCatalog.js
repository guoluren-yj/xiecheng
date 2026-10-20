/**
 * ecCompanyCatalog - 平台目录维护
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCompanyId,
  fetchEcCompanyCatalog,
  addOrUpdateEcCompanyCatalog,
  setPermissionSetEnable,
} from '@/services/ecCompanyCatalogService';

export default {
  namespace: 'ecCompanyCatalog',
  state: {
    list: {},
    pagination: {},
    currentCompany: [],
  },
  effects: {
    *fetchEcCompany(_, { call, put }) {
      const res = yield call(fetchEcCompanyId);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompany: result.content,
          },
        });
      }
      return result;
    },
    // 查询平台目录树形数据
    *queryTreeList({ payload }, { put, call }) {
      const res = yield call(fetchEcCompanyCatalog, payload);
      const response = getResponse(res);
      const rowKeys = [];

      /**
       * 组装新dataSource
       * @function getDataSource
       * @param {!Array} [collections = []] - 树节点集合
       * @param {string} parentName - 上级目录名称
       * @returns {Array} - 新的dataSourcee
       */
      function getDataSource(collections = []) {
        return collections.map(n => {
          const m = {
            ...n,
          };
          if (!isEmpty(m.subMenus)) {
            rowKeys.push(n.catalogId);
            m.subMenus = getDataSource(m.subMenus);
          } else {
            m.subMenus = null;
          }
          return m;
        });
      }

      if (response) {
        const dataSource = getDataSource(response.content || []);
        yield put({
          type: 'updateListReducer',
          payload: {
            dataSource,
            rowKeys,
            pagination: createPagination(response),
          },
        });
      }
    },

    // 创建和修改目录
    *addOrUpdateEcCompanyCatalog({ payload }, { call }) {
      const res = yield call(addOrUpdateEcCompanyCatalog, payload);
      return getResponse(res);
    },

    // 启用禁用平台目录
    *setPermissionSetEnable({ payload }, { call }) {
      const res = yield call(setPermissionSetEnable, payload);
      return getResponse(res);
    },
  },
  reducers: {
    updateListReducer(state, { payload }) {
      return {
        ...state,
        list: {
          ...state.list,
          ...payload,
        },
        pagination: payload.pagination,
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
