/**
 * mixConfigure -商城资源
 * @date: 2020-01-10
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchConfigureList, fetchAddList } from '@/services/mixConfigureService';

export default {
  namespace: 'mixConfigure',
  state: {
    configureList: [],
    pagination: {},
  },
  effects: {
    *fetchConfigureList({ payload }, { call, put }) {
      const response = yield call(fetchConfigureList, payload);
      const res = getResponse(response);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            configureList: res.content,
            pagination: createPagination(res),
          },
        });
      }
    },
    *fetchAddList({ payload }, { call }) {
      const response = yield call(fetchAddList, payload);
      return getResponse(response);
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
