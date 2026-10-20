/**
 * model 平台征信配置
 * @date: 2019-07-22
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import { isNumber, isNaN } from 'lodash';
import { getResponse } from 'utils/utils';
import { fetchSettings, saveSettings } from '@/services/creditConfigService';

export default {
  namespace: 'creditConfig',
  state: {
    settings: {}, // 平台征信配置项
  },
  effects: {
    // 查询配置
    *fetchSettings(_, { call, put }) {
      const result = getResponse(yield call(fetchSettings));
      if (result) {
        const settings = {};
        for (const key in result) {
          if (isNumber(+result[key]) && !isNaN(+result[key]) && result[key] !== null) {
            settings[key] = +result[key];
          } else if (result[key] === null) {
            settings[key] = undefined;
          } else {
            settings[key] = result[key];
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            settings,
          },
        });
      }

      return result;
    },

    // 保存配置
    *saveSettings({ payload }, { call }) {
      const res = getResponse(yield call(saveSettings, payload));
      return res;
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
