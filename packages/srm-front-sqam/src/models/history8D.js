/**
 * 8D 历史
 * @date: 2018-12-17
 * @author: LZM <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { searchAllDetail } from '@/services/history8DService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'history8D',
  state: {
    basicHisInfo: {}, // 历史详情数据
    causeType: [], // 根本原因类型
    icaActions: [], // 措施内容
    zeroOneOption: [], // 是|否| 值集
  },
  effects: {
    // 历史详细信息
    *fetch8DHisBasicInfo({ payload }, { call, put }) {
      let result = yield call(searchAllDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            basicHisInfo: result,
          },
        });
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          causeType: 'SQAM.ROOT_CAUSE_TYPE',
          icaActions: 'SQAM.ICA_ACTION',
          zeroOneOption: 'HPFM.FLAG',
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
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
