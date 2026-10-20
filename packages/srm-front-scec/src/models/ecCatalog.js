/**
 * ecCatalog - 平台目录维护
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCatalog,
  addOrUpdateEcCatalog,
  setPermissionSetEnable,
} from '@/services/ecCatalogService';

export default {
  namespace: 'ecCatalog',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 查询平台目录树形数据
    *queryTreeList({ payload }, { put, call }) {
      const res = yield call(fetchEcCatalog, payload);
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
    *addOrUpdateEcCatalog({ payload }, { call }) {
      const res = yield call(addOrUpdateEcCatalog, payload);
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
  },
};
