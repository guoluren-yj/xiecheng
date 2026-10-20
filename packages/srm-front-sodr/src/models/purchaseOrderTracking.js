/*
 * purchaseOrderTracking - 采购订单跟踪报表
 * @date: 2020/02/27 11:49:14
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { fetchList } from '@/services/purchaseOrderTrackingService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseOrderTracking',

  state: {
    enumMap: {},
    trackingList: [], // 采购订单跟踪报表列表数据
    trackingPagination: {}, // 列表分页数据
  },

  effects: {
    // 查询列表数据
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            trackingList: (result.content || []).map((i) => ({ ...i, _status: 'update' })),
            trackingPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询列表数据
    *fetchListPage({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, { ...payload, onlyCountFlag: 'Y' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            trackingPagination: createPagination(result),
          },
        });
      }
    },
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          type: 'SODR.PO_STATUS',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
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
