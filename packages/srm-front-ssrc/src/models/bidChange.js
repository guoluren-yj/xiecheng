/**
 * models - 招标变更/数据列表
 * @date: 2020-02-06
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
// import { isEmpty } from 'lodash';
// import { queryMapIdpValue } from 'services/api';

import {
  fetchDataList,
  fetchTimeAddressChange,
  timeAddressChange,
} from '@/services/bidChangeService';

export default {
  namespace: 'bidChange',
  state: {
    dataList: [], // 列表页
    pagination: {}, // 列表页分页
    timeAddressInfo: {}, // 时间地点变更基本信息
  },
  effects: {
    *fetchDataList({ payload }, { call, put }) {
      // 查询列表页数据
      let result = yield call(fetchDataList, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dataList: result.content,
            pagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchTimeAddressChange({ payload }, { call, put }) {
      // 查询列表页数据
      let result = yield call(fetchTimeAddressChange, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            timeAddressInfo: result,
          },
        });
      }
      return result;
    },
    *timeAddressChange({ payload }, { call }) {
      // 查询列表页数据
      let result = yield call(timeAddressChange, payload);
      result = getResponse(result);
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
