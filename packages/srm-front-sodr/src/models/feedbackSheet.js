/**
 * feedbackSheet - 反馈单
 * @date: 2021-03-15
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchFeedbackLine } from '@/services/feedbackSheetService';

export default {
  namespace: 'feedbackSheet',
  state: {
    onLoadList: [], // 加载数据中的父行
  },
  effects: {
    // 查询反馈单行
    *fetchFeedbackLine({ payload }, { call, put }) {
      yield put({
        type: 'updateOnloadList',
        payload: { feedbackId: payload.feedbackId, type: 'load' },
      });
      const response = yield call(fetchFeedbackLine, payload);
      const data = getResponse(response);
      yield put({
        type: 'updateOnloadList',
        payload: { feedbackId: payload.feedbackId, type: 'unload' },
      });
      return data;
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateOnloadList(state, { payload }) {
      const { type, feedbackId } = payload;
      switch (type) {
        case 'load':
          return {
            ...state,
            onLoadList: [...state.onLoadList, feedbackId],
          };
        case 'unload':
          return {
            ...state,
            onLoadList: state.onLoadList.filter((i) => i !== feedbackId),
          };
        default:
          return state;
      }
    },
  },
};
