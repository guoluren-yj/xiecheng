/**
 * model 消息发送配置
 * @date: 2018-10-29
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { searchSendConfig, saveSendConfig } from '@/services/messageSendConfigService';

export default {
  namespace: 'messageSendConfig',
  state: {
    list: [], // 发送消息
    pagination: {}, // 分页参数
  },
  effects: {
    // 获取消息发送配置数据列表
    *fetchSendConfigData({ payload }, { call, put }) {
      const result = getResponse(yield call(searchSendConfig, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    *saveSendConfig({ payload }, { call }) {
      const result = yield call(saveSendConfig, payload);
      return getResponse(result);
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
