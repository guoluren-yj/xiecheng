/**
 * ToleranceRule - 发票允差控制
 * @date: 2018-7-3
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchToleranceRule, saveToleranceRule } from '@/services/sodr/allowanceRuleService';

export default {
  namespace: 'toleranceRule',
  state: {
    toleranceRuleData: [], // 发票允差
  },
  effects: {
    // 查询初始数据
    *fetchToleranceRule({ payload }, { call, put }) {
      const response = yield call(fetchToleranceRule, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { toleranceRuleData: data },
        });
      }
    },

    // 新建或编辑数据
    *saveToleranceRule({ payload }, { call }) {
      const response = yield call(saveToleranceRule, payload);
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
