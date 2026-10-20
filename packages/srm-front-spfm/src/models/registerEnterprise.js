/**
 * model 注册公司
 * @date: 2018-8-24
 * @author: yanglin <lin.yang05@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { fetchEnterprise } from '@/services/registerEenterpriseService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'registerEnterprise',

  state: {
    enterpriseList: [], // 注册企业列表
    pagination: {}, // 分页对象
  },

  effects: {
    // 获取注册企业信息
    *fetchEnterprise({ payload }, { call, put }) {
      const res = yield call(fetchEnterprise, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            enterpriseList: list.content,
            pagination: createPagination(list),
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
