/**
 * interfaceClean - 接口清理 - medal
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { fetchCleanedData, cleanInterface } from '@/services/interfaceCleanService';

export default {
  namespace: 'interfaceClean',
  state: {
    data: {
      list: [],
    },
  },
  effects: {
    // 查询接口段结构表
    *fetchInterfaceClean({ payload }, { call, put }) {
      const response = yield call(fetchCleanedData, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              list: list.content,
            },
          },
        });
      }
    },

    // 新建、创建接口段结构表
    *cleanInterface({ payload }, { call }) {
      const response = yield call(cleanInterface, payload);
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
