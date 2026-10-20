/**
 * model 个性化单元
 * @date: 2019-12-12
 * @author: xiongjg
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';

import {
  queryUnitFilter,
  saveUnitFilter,
  copyUnitFilter,
  deleteUnitFilter,
  saveFilterField,
  removeFilterField,
} from '@/services/searchBarConfigService';

export default {
  namespace: 'searchBarConfig',
  state: {},
  effects: {
   // 查询单元下的筛选器列表
    *queryUnitFilter({ params }, { call }) {
      return getResponse(yield call(queryUnitFilter, params));
    },

    // 保存筛选器配置
    *saveUnitFilter({ params, mode, tplParams }, { call }) {
      return getResponse(yield call(saveUnitFilter, params, mode, tplParams));
    },

    // 复制筛选器配置
    *copyUnitFilter({ params }, { call }) {
      return getResponse(yield call(copyUnitFilter, params));
    },

    // 删除筛选器配置
    *deleteUnitFilter({ params }, { call }) {
      return getResponse(yield call(deleteUnitFilter, params));
    },

    // 保存筛选器字段配置
    *saveFilterField({ params, mode, tplParams }, { call }) {
      return getResponse(yield call(saveFilterField, params, mode, tplParams));
    },

    // 删除筛选器字段配置
    *removeFilterField({ params, mode, tplParams }, { call }) {
      return getResponse(yield call(removeFilterField, params, mode, tplParams));
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
