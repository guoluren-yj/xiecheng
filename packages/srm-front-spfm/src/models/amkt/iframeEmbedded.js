/**
 * iframeEmbedded - 内嵌页面
 * @date: 2019-08-09
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchUrl } from '@/services/amkt/iframeEmbeddedService';

export default {
  namespace: 'iframeEmbedded',
  state: {
    clientData: '',
  },
  effects: {
    *fetchUrl({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchUrl, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            clientData: response,
          },
        });
      }
      return response;
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
