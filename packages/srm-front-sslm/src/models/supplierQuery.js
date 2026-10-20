/**
 * model 平台供应商汇总查询
 * @date: 2018-8-15
 * @version: 0.0.1
 * @author:  dengtingmin <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchSupplierPool,
  fetchLifeCyclesStages,
  queryCategory,
  queryPageSize,
} from '@/services/supplierQueryService';
import { fetchSupplierLifeCycle } from '@/services/supplierDetailService';

export default {
  namespace: 'supplierQuery',

  state: {
    code: {},
    supplierList: {},
    pagination: {},
    supplierStage: {},
  },

  effects: {
    // 统一获取值级的数据
    *batchCode({ payload }, { put, call }) {
      const { lovCodes } = payload;
      const code = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: {
            code,
          },
        });
      }
    },

    // 查询平台级供应商list
    *fetchSupplierPool({ payload }, { put, call }) {
      const { stageId = 'all' } = payload;
      const res = yield call(fetchSupplierPool, payload);
      const list = getResponse(res);

      if (list) {
        const page = createPagination(list);
        yield put({
          type: 'storeList',
          payload: {
            stageId,
            list,
            page,
          },
        });
      }

      // 异步获取 totalElements
      if (list && list.needCountFlag === 'Y') {
        yield put({
          type: 'fetchSupplierPoolPageInfo',
          payload: {
            queryParam: {
              ...payload,
              onlyCountFlag: 'Y',
            },
            list,
          },
        });
      }
    },

    // 异步查询平台级供应商列表分页数据
    *fetchSupplierPoolPageInfo({ payload }, { put, call }) {
      const { queryParam = {}, list = {} } = payload;
      const { stageId = 'all' } = queryParam || {};
      const resForCount = yield call(fetchSupplierPool, { ...queryParam });
      const listForCount = getResponse(resForCount);
      yield put({
        type: 'storeList',
        payload: {
          stageId,
          list,
          page: createPagination(listForCount),
        },
      });
    },

    *fetchLifeCyclesStages({ payload }, { put, call }) {
      const res = yield call(fetchLifeCyclesStages, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierStage: list,
          },
        });
      }
      return list;
    },

    // 查询品类
    *queryCategory({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCategory, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            categoryList: res.content,
            categoryPagination: createPagination(res),
          },
        });
      }
    },
    /**
     * 查询生命周期
     */
    *fetchSupplierLifeCycle({ payload }, { call }) {
      const response = yield call(fetchSupplierLifeCycle, payload);
      const data = getResponse(response);
      return data;
    },

    // 查询默认分页size
    *queryPageSize({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPageSize, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            pageSizeMap: res,
          },
        });
      }
      return res;
    },
  },

  reducers: {
    storeList(state, { payload }) {
      const { page, list, stageId } = payload;
      const { supplierList, pagination } = state;
      return {
        ...state,
        supplierList: {
          ...supplierList,
          [stageId]: list,
        },
        pagination: {
          ...pagination,
          [stageId]: page,
        },
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
