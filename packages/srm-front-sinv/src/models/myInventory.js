import { createPagination, getResponse } from 'utils/utils';
import {
  queryMyInventoryList,
  saveInventory,
  deleteInventory,
  fetchOperationList,
  queryMyInventoryInputList,
  fetchOccupancyList,
} from '@/services/myInventoryService';
import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'myInventory',

  state: {
    myInventoryData: [],
    myInventoryPagination: {},
    myInventoryInputData: [],
    myInventoryInputPagination: {},
  },

  effects: {
    // 供应商值集查询
    *queryIdpValue({ payload }, { call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'SPUC_SUPPLIER_QUERY', payload));
      return res;
    },
    // 查询我的库存列表
    *queryMyInventoryList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const result = getResponse(yield call(queryMyInventoryList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            myInventoryData: content.map((n) => {
              return {
                ...n,
                _status: 'update',
              };
            }),
            myInventoryPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存库存
    *saveInventory({ params }, { call }) {
      const res = getResponse(yield call(saveInventory, params));
      return res;
    },
    // 删除库存行
    *deleteInventory({ data }, { call }) {
      const res = getResponse(yield call(deleteInventory, data));
      return res;
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
    *queryMyInventoryInputList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const result = getResponse(yield call(queryMyInventoryInputList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            myInventoryInputData: content,
            myInventoryInputPagination: createPagination(result),
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
