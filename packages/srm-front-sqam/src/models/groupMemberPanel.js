/**
 * model component/GroupMemberPanel
 * @date: 2019-11-12
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'groupMemberPanel',
  state: {
    code: {},
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
