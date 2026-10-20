/**
 * dimConfig.js - 供应商生命周期管控维度配置 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryDimConfig,
  addDimConfig,
  updateDimConfig,
  queryDimConfigSups,
  updateDimConfigSups,
} from '@/services/dimConfigService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'dimConfig',

  state: {
    dimension: {}, // 管控维度
    dimensionType: [], // 供应商生命周期管控维度值集
    supsList: [], // 管控维度供应商列表
    pagination: {}, // 分页对象
    defaultDimensionList: [], // 管控维度默认值列表
    supplierAblilityList: [], // 供货能力清单管控维度
  },

  effects: {
    // 根据租户 ID 查询供应商生命周期管控维度配置
    *queryDimConfig(_, { call, put, all }) {
      const [dimensionRes, dimensionTypeList] = yield all([
        call(queryDimConfig),
        call(queryMapIdpValue, {
          dimensionType: 'SSLM.LIFE_CYCLE_DIMENSION',
          defaultDimensionList: 'SSLM.LIFE_CYCLE_DIMENSION.DEFAULT',
          supplierAblilityList: 'SSLM.CONSISTENT_WITH_THE_LIFE_CYCLE',
        }),
      ]);
      const dimension = getResponse(dimensionRes);
      const dimensionTypeRes = getResponse(dimensionTypeList);
      if (dimension && dimensionTypeRes) {
        const { dimensionType, defaultDimensionList, supplierAblilityList } =
          dimensionTypeList || {};
        yield put({
          type: 'updateState',
          payload: { dimension, dimensionType, defaultDimensionList, supplierAblilityList },
        });
      }
    },

    // 添加管控维度配置
    *addDimConfig({ payload }, { call }) {
      const res = yield call(addDimConfig, payload);
      return getResponse(res);
    },

    // 更新管控维度配置
    *updateDimConfig({ payload }, { call }) {
      const res = yield call(updateDimConfig, payload);
      return getResponse(res);
    },

    // 供应商生命周期维度管控供应商列表
    *queryDimConfigSups({ payload }, { call, put }) {
      const res = yield call(queryDimConfigSups, payload);
      const supsList = getResponse(res);
      const pagination = createPagination(supsList);

      if (supsList) {
        yield put({
          type: 'updateState',
          payload: {
            supsList: supsList.content,
            pagination,
          },
        });
      }
      return supsList;
    },

    // 修改供应商生命周期维度管控供应商
    *updateDimConfigSups({ payload }, { call }) {
      const res = yield call(updateDimConfigSups, payload);
      return getResponse(res);
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
