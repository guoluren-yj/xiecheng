/**
 * model 租户级期间定义
 * @date: 2018-7-12
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import {
  searchHeader,
  searchLine,
  savePeriodHeader,
  searchPeriodRule,
  savePeriod,
  searchRef,
} from '@/services/periodOrgService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'periodOrg',
  state: {
    periodHeader: {
      // TabPane: "期间定义"
      list: [], // 数据列表
      pagination: {}, // 分页参数
      periodData: [], // 期间维护(Modal)数据列表
    },
    periodLine: {
      // TabPane: "期间查询"
      list: [], // 数据列表
      pagination: {}, // 分页参数
    },
  },
  effects: {
    // 获取"期间定义(TabPane)"数据
    *searchPeriodHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(searchHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            periodHeader: {
              list: result.content,
              pagination: createPagination(result),
              periodData: [],
              refDetial: {},
            },
          },
        });
      }
    },
    // 获取"期间查询(TabPane)"数据
    *searchPeriodLine({ payload }, { call, put }) {
      let result = yield call(searchLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            periodLine: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    *savePeriodHeader({ payload }, { call }) {
      const result = yield call(savePeriodHeader, payload);
      return getResponse(result);
    },
    // 获取期间明细
    *searchPeriodRule({ payload }, { call, put }) {
      const { periodSetId, tenantId, periodHeader } = payload;
      let result = yield call(searchPeriodRule, { periodSetId, tenantId });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            periodHeader: {
              ...periodHeader,
              periodData: [...result],
            },
          },
        });
      }
    },
    *savePeriod({ payload }, { call }) {
      const result = yield call(savePeriod, payload);
      return getResponse(result);
    },
    // 引用云级期间定义
    *searchRefData({ payload }, { call }) {
      const { tenantId } = payload;
      const result = yield call(searchRef, { tenantId });
      return getResponse(result);
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
