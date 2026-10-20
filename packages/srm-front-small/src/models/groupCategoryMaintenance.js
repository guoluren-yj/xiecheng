/**
 * groupCategoryMaintenance - 集团目录维护
 * @date: 2019-2-2
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import uuid from 'uuid/v4';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcCatalog,
  saveAssignCatalog,
  fetchAssignCompany,
  saveAssignCompany,
  getCategoryTreeList,
  addOrUpdateEcCatalog,
  setPermissionSetEnable,
  addCategoryToDirectory,
  queryStoreList,
  configUpdateCompanyCatalog,
  handleCataSave,
  batchSetEnable,
  fetchCompanyList,
  fetchList,
  savePriceLimit,
  delPriceLimit,
  fetchPriceLimitList,
  fetchSubLevelList,
  fetchFirstLevelList,
  assignCategory,
} from '@/services/groupCategoryMaintenanceService';

export default {
  namespace: 'groupCategoryMaintenance',
  state: {
    list: [],
    pagination: {},
    categoryTreeList: [],
    rowKeys: [],
    assignList: [],
    assignPagination: {},
    catalogRowKeys: [],
    catalogList: [],
    catalogPagination: {},
    companyCatalogList: [],
    companyCatalogPagination: {},
    priceLimitList: [], // 单价限制列表
    priceLimitPagination: {}, // 单价限制列表分页信息
    assignCategoryList: [], // 用户分配的目录列表
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
        return collections.map((n) => {
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
          type: 'updateState',
          payload: {
            rowKeys,
            list: dataSource,
            pagination: createPagination(response),
          },
        });
      }
      return response;
    },

    // 查询商城展示目录list
    *queryStoreList({ payload }, { call }) {
      const res = yield call(queryStoreList, payload);
      const result = getResponse(res);
      return result;
    },

    // 创建和修改目录configUpdateCompanyCatalog
    *configUpdateCompanyCatalog({ payload }, { call }) {
      const res = yield call(configUpdateCompanyCatalog, payload);
      return getResponse(res);
    },

    // 保存排序后的目录
    *handleCataSave({ payload }, { call }) {
      const res = yield call(handleCataSave, payload);
      const result = getResponse(res);
      return result;
    },
    // 创建和修改目录
    *addOrUpdateEcCatalog({ payload }, { call }) {
      const res = yield call(addOrUpdateEcCatalog, payload);
      return getResponse(res);
    },
    // 批量启用禁用平台目录
    *batchSetEnable({ payload }, { call }) {
      const res = yield call(batchSetEnable, payload);
      return getResponse(res);
    },
    // 启用禁用平台目录
    *setPermissionSetEnable({ payload }, { call }) {
      const res = yield call(setPermissionSetEnable, payload);
      return getResponse(res);
    },
    // 启用平台分类作为目录
    *addCategoryToDirectory({ payload }, { call }) {
      const res = yield call(addCategoryToDirectory, payload);
      return getResponse(res);
    },
    // 查询分类
    *getCategoryTreeList({ payload }, { call }) {
      const res = yield call(getCategoryTreeList, payload);
      return getResponse(res);
    },
    // 查询所有分类
    *getCategoryTreeAllList({ payload }, { call }) {
      const res = yield call(getCategoryTreeList, payload);
      return getResponse(res);
    },
    // 查询目录分配公司
    *fetchAssignCompany({ payload }, { call, put }) {
      const res = yield call(fetchAssignCompany, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            assignList: result.content || [],
            assignPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存目录分配公司
    *saveAssignCompany({ payload }, { call }) {
      const res = yield call(saveAssignCompany, payload);
      const result = getResponse(res);
      return result;
    },
    // 查询公司的目录
    *fetchCatalog({ payload }, { put, call }) {
      const res = yield call(fetchEcCatalog, payload);
      const response = getResponse(res);

      if (response) {
        const addField = (menu = []) => {
          return menu.map((item) => {
            if (item.subMenus && item.subMenus.length > 0) {
              return { ...item, selected: 0, subMenus: addField(item.subMenus) };
            } else return { ...item, selected: 0 };
          });
        };
        const dataSource = addField(response.content || []);
        yield put({
          type: 'updateState',
          payload: {
            catalogList: dataSource,
            catalogPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 保存公司分配目录
    *saveAssignCatalog({ payload }, { call }) {
      const res = yield call(saveAssignCatalog, payload);
      const result = getResponse(res);
      return result;
    },
    // 预览目录
    *fetchCatalogPreview({ payload }, { call }) {
      const res = yield call(queryStoreList, payload);
      const response = getResponse(res);
      return response;
    },
    // 目录查看tab公司列表
    *fetchCatalogCompany({ payload }, { put, call }) {
      const res = yield call(fetchCompanyList, payload);
      const response = getResponse(res);

      if (response) {
        const dataSource = (response.content || []).map((r, i) => ({ ...r, sortNum: i + 1 }));
        yield put({
          type: 'updateState',
          payload: {
            companyCatalogList: dataSource,
            companyCatalogPagination: createPagination(response),
          },
        });
      }
      return response;
    },
    *fetchList({ payload }, { call }) {
      return getResponse(yield call(fetchList, payload));
    },
    // 查询单价限制列表
    *fetchPriceLimitList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchPriceLimitList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            priceLimitList: response.content.map((item) => ({ ...item, _status: 'update' })),
            priceLimitPagination: createPagination(response),
          },
        });
      }
    },
    // 删除单价限制
    *delPriceLimit({ payload }, { call }) {
      return getResponse(yield call(delPriceLimit, payload));
    },
    // 保存单价限制
    *savePriceLimit({ payload }, { call }) {
      return getResponse(yield call(savePriceLimit, payload));
    },
    // 查询分配给账户的一级目录
    *fetchFirstLevelList({ payload }, { put, call }) {
      const response = getResponse(yield call(fetchFirstLevelList, payload)) || [];
      if (response) {
        const selectedAll = !response.some((i) => i.selectFlag === 0);
        yield put({
          type: 'updateState',
          payload: {
            assignCategoryList: [
              {
                catalogName: intl
                  .get('small.categoryVisibilityAssignment.model.allCategory')
                  .d('全部目录'),
                catalogId: uuid(),
                parentCatalogId: -2, // 全部分类节点的父节点id设置为-2
                catalogLevel: 0, // 全部分类的分类层级设置为0
                subMenus: response,
                selectFlag: selectedAll ? 1 : 0,
              },
            ],
          },
        });
      }
      return response;
    },
    // 查询分配给账户的子级（二级/三级）目录
    *fetchSubLevelList({ payload }, { call }) {
      return getResponse(yield call(fetchSubLevelList, payload));
    },
    // 给账号分配目录
    *assignCategory({ payload }, { call }) {
      return getResponse(yield call(assignCategory, payload));
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
