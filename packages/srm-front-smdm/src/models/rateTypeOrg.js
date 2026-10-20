/**
 * rateTypeOrg.js - 租户级汇率类型 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryRateTypeTenant,
  updateRateTypeTenant,
  pullPlatformRateType,
} from '@/services/rateTypeOrgService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'rateTypeOrg',

  state: {
    list: {}, // 汇率类型列表
    detail: {}, // 汇率类型引用明细
    rateMethodList: [], // 汇率类型方式
    tenantRateTypeList: {}, // 租户汇率类型定义列表
    pagination: {}, // 分页参数对象
    enabledList: [], // 是否启用列表
  },

  effects: {
    // 查询汇率类型方式
    *init(_, { call, put }) {
      const enabledList = getResponse(yield call(queryIdpValue, 'HPFM.ENABLED_FLAG'));
      const res = yield call(queryIdpValue, 'SMDM.EXCHANGE_RATE_METHOD');
      const rateMethodList = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { rateMethodList, enabledList },
      });
    },

    // 查询租户汇率类型信息
    *queryRateTypeTenant({ payload }, { call, put }) {
      const res = yield call(queryRateTypeTenant, payload);
      const tenantRateTypeList = getResponse(res);
      const pagination = createPagination(tenantRateTypeList);
      yield put({
        type: 'updateState',
        payload: {
          pagination,
          tenantRateTypeList,
        },
      });
      return tenantRateTypeList;
    },

    // 租户引用云级汇率类型
    *pullPlatformRateType({ payload }, { call }) {
      const res = yield call(pullPlatformRateType, payload);
      return getResponse(res);
    },

    // 更新租户级汇率类型
    *updateRateTypeTenant({ payload }, { call }) {
      const res = yield call(updateRateTypeTenant, payload);
      return getResponse(res);
    },
  },

  reducers: {
    // 批量条件查询值集头
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
