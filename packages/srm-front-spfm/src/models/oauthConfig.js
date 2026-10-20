/*
 * oauthConfig 免密登陆
 * @date: 2020/3/20
 * @author: HB <xiquan.ke02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchOauthList,
  fetchDetail,
  deleteItem,
  addConfig,
  saveConfig,
  getPublicKey,
} from '@/services/oauthConfigService';

export default {
  namespace: 'oauthConfig',

  state: {
    list: [], // 数据
    pagination: {},
  },

  effects: {
    *fetchOauthList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchOauthList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            list: response.content,
            pagination: createPagination(response),
          },
        });
      }
    },

    *fetchDetail({ payload }, { call }) {
      return getResponse(yield call(fetchDetail, payload));
    },

    *addConfig({ payload }, { call }) {
      return getResponse(yield call(addConfig, payload));
    },

    *saveConfig({ payload }, { call }) {
      return getResponse(yield call(saveConfig, payload));
    },

    *deleteItem({ payload }, { call }) {
      return getResponse(yield call(deleteItem, payload));
    },

    *getPublicKey({ payload }, { call }) {
      return getResponse(yield call(getPublicKey, payload));
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
