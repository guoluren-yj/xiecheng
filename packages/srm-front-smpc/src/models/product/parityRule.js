import { getResponse } from 'utils/utils';
import {
  fetchParityList,
  fetchSaveList,
  fetchTypeTree,
} from '@/services/product/parityRuleService';

export default {
  namespace: 'parityRule',
  state: {
    ruleList: [], // 列表
    newRuleList: [], // 列表2
    ruleData: {},
    treeList: [], // 分类
  },

  effects: {
    // 列表查询
    *fetchParityList({ payload }, { call, put }) {
      const res = yield call(fetchParityList, payload);
      const result = getResponse(res);
      yield put({
        type: 'updateState',
        payload: {
          ruleData: {},
          ruleList: [],
        },
      });
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ruleData: res,
            ruleList: result.compareAttrVOS.map((item) => ({ ...item, _status: 'update' })),
          },
        });
      }
      return result;
    },

    // 保存
    *fetchSaveList({ payload }, { call }) {
      const res = yield call(fetchSaveList, payload);
      const result = getResponse(res);
      return result;
    },

    // 查询分类
    *fetchTypeTree({ payload = {} }, { call, put }) {
      const res = yield call(fetchTypeTree, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            treeList: result,
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
