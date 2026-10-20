/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-02-05 14:18:18
 * @LastEditors: yanglin
 * @LastEditTime: 2023-06-16 15:36:09
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchList,
  addOrderType,
  fetchApplicationType,
  fetchAddApplicationType,
} from '@/services/purchaseOrderService';

export default {
  namespace: 'purchaseOrder',

  state: {
    dataList: [],
    query: {},
  },

  effects: {
    *fetchList({ payload }, { call, put }) {
      const { ...query } = payload;
      const result = getResponse(yield call(fetchList, { ...query }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            dataList: result,
          },
        });
      }
    },
    *addOrderType({ payload }, { call }) {
      const data = yield call(addOrderType, payload);
      return getResponse(data);
    },
    // 查询申请类型列表
    *fetchApplicationType({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchApplicationType, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            applicationTypeList: result.content,
            applicationTypePagination: createPagination(result),
          },
        });
      }
    },
    *fetchAddApplicationType({ payload }, { call }) {
      const data = yield call(fetchAddApplicationType, payload);
      return getResponse(data);
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
