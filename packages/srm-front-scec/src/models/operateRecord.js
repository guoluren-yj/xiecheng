/**
 * goodsManage - 商品维护查询 - medal
 * @date: 2019-2-9
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchOperateRecord, fetchShareOperateRecord } from '@/services/operateRecordService';

export default {
  namespace: 'operateRecord',
  state: {
    list: {},
    shareList: {},
    pagination: {},
  },
  effects: {
    // 商品操作记录查询
    *fetchOperateRecord({ payload }, { call, put }) {
      const response = yield call(fetchOperateRecord, payload);
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
    // 商品分享操作记录查询
    *fetchShareOperateRecord({ payload }, { call, put }) {
      const response = yield call(fetchShareOperateRecord, payload);
      const shareList = getResponse(response);
      if (shareList) {
        yield put({
          type: 'updateState',
          payload: {
            shareList,
            pagination: createPagination(shareList),
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
