import { createPagination, getResponse } from 'utils/utils';
import {
  querySupplierInventoryList,
  fetchOperationList,
  querySupplierInventoryInputList,
  fetchOccupancyList,
} from '@/services/supplierInventoryService';

export default {
  namespace: 'supplierInventory',

  state: {
    supplierInventoryData: [],
    supplierInventoryPagination: {},
    supplierInventoryInputData: [],
    supplierInventoryInputPagination: {},
  },

  effects: {
    // 查询我的库存列表
    *querySupplierInventoryList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const result = getResponse(yield call(querySupplierInventoryList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            supplierInventoryData: content.map(n => {
              return {
                ...n,
                _status: 'update',
              };
            }),
            supplierInventoryPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取操作记录列表数据
    *fetchOperationList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationList, payload));
      return result;
    },
    // 获取占用数量列表数据
    *fetchOccupancyList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOccupancyList, payload));
      return result;
    },
    // 查询我的库存录入列表
    *querySupplierInventoryInputList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const result = getResponse(yield call(querySupplierInventoryInputList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            supplierInventoryInputData: content,
            supplierInventoryInputPagination: createPagination(result),
          },
        });
      }
      return result;
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
