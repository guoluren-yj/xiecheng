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
} from '@/services/costCenterService';
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
      };
    });
  }
  return config;
}

export default {
  namespace: 'costCenter',
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
    yesOrNoList: [],
  },
  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const res = getResponse(
        yield call(queryMapIdpValue, {
          yesOrNoList: 'HPFM.FLAG',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          yesOrNoList: res.yesOrNoList,
        },
      });
    },
    // 获取"期间定义(TabPane)"数据
    *searchPeriodHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(searchHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            periodHeader: {
              list: dealDataState(result.content),
              pagination: createPagination(result),
              periodData: [],
              refDetial: {},
            },
          },
        });
      }
      return result;
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
