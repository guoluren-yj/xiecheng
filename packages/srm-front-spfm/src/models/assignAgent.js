/**
 * assignAgent 分配采购员
 * @date: 2020-02-18
 * @author: ls <shuo.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import {
  fetchPurAgent,
  deletePurAgent,
  addPurAgent,
  setDefaultPurAgent,
} from '@/services/assignAgentService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'assignAgent',

  state: {
    purAgentList: [], // 分配采购组织
    purOrgPagination: {}, // 分配采购组织分页
  },

  effects: {
    // 获取分配采购组织
    *fetchPurAgent({ payload }, { call, put }) {
      const res = yield call(fetchPurAgent, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            purAgentList: response.content,
            purOrgPagination: createPagination(response),
          },
        });
      }
    },
    // 分配采购组织删除
    *deletePurAgent({ payload }, { call }) {
      const res = getResponse(yield call(deletePurAgent, payload));
      return res;
    },
    // 分配采购组织新增
    *addPurAgent({ payload }, { call }) {
      const res = getResponse(yield call(addPurAgent, payload));
      return res;
    },
    // 设置默认的采购员
    *setDefaultPurAgent({ payload }, { call }) {
      const res = getResponse(yield call(setDefaultPurAgent, payload));
      return res;
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
