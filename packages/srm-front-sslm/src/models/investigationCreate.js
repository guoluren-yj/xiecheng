/**
 * model 供应商调查问卷创建
 * @date: 2018-8-13
 * @version: 0.0.1
 * @author:  dengtingmin <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchInvestigateList,
  investigateRelease,
  investigateDelete,
} from '@/services/investigationCreateService';

export default {
  namespace: 'investigationCreate',
  state: {
    list: {},
    pagination: {},
    display: true,
  },

  effects: {
    // 查询调查表列表
    *fetchInvestigateList({ payload }, { call, put }) {
      const res = yield call(fetchInvestigateList, payload);
      const list = getResponse(res);
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

    // 发布调查表
    *investigateRelease({ payload }, { call }) {
      const res = yield call(investigateRelease, payload);
      return getResponse(res);
    },

    // 删除调查表
    *investigateDelete({ payload }, { call }) {
      const res = yield call(investigateDelete, payload);
      return getResponse(res);
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
