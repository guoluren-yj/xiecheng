/**
 * billUpdateRule.js - 开票即对账规则配置
 * @date: 2018-11-12
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryRules,
  addRules,
  updateRules,
  queryRuleLines,
  deleteRuleLines,
  saveRuleLines,
} from '@/services/sodr/billUpdateRuleService';

export default {
  namespace: 'billUpdateRule',

  state: {
    ruleList: [], // 业务类型配置列表
    detailList: {}, // 业务类型配置详情
    pagination: {}, // 配置详情行列表分页
  },

  effects: {
    // 查询开票即对账规则头列表
    *queryRules(_, { call, put }) {
      const ruleList = getResponse(yield call(queryRules));
      if (ruleList) {
        yield put({
          type: 'updateState',
          payload: {
            ruleList,
          },
        });
      }
      return ruleList;
    },
    // 批量创建开票即对账规则头列表
    *addRules({ payload }, { call }) {
      const res = yield call(addRules, payload);
      return getResponse(res);
    },
    // 批量修改开票即对账规则头列表
    *updateRules({ payload }, { call, put }) {
      const res = yield call(updateRules, payload);
      const ruleList = getResponse(res);
      yield put({
        type: 'updateState',
        payload: {
          ruleList,
        },
      });
      return ruleList;
    },
    // 查询开票即对账规则行列表
    *queryRuleLines({ payload }, { call, put }) {
      const { ruleId } = payload;
      const list = getResponse(yield call(queryRuleLines, payload));
      const page = createPagination(list);
      if (list) {
        yield put({
          type: 'storeList',
          payload: {
            ruleId,
            list,
            page,
          },
        });
      }
    },
    // 批量删除开票即对账规则行
    *deleteRuleLines({ payload }, { call }) {
      const res = yield call(deleteRuleLines, payload);
      return getResponse(res);
    },
    // 批量保存开票即对账规则行
    *saveRuleLines({ payload }, { call }) {
      const res = yield call(saveRuleLines, payload);
      return getResponse(res);
    },
  },

  reducers: {
    storeList(state, { payload }) {
      const { page, list, ruleId } = payload;
      const { detailList, pagination } = state;
      return {
        ...state,
        detailList: {
          ...detailList,
          [ruleId]: list,
        },
        pagination: {
          ...pagination,
          [ruleId]: page,
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
