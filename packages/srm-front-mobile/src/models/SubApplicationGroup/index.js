import { getResponse } from 'utils/utils';

import { querySubApplication } from '../../services/SubApplicationService';

export default {
  namespace: 'subApplicationGroup',

  state: {},

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const { content } = getResponse(yield call(querySubApplication, {}));
      yield put({
        type: 'updateState',
        payload: {
          content,
        },
      });
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
