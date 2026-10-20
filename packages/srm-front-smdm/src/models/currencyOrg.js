/**
 * CurrencyOrg - 租户币种定义
 * @date: 2018-7-3
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import {
  queryCurDefinition,
  updateCurrencyDef,
  quoteData,
  updateEnabledFlag,
} from '@/services/currencyOrgService';
import { getResponse, createPagination } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';

export default {
  namespace: 'currencyOrg',
  state: {
    data: {},
    pagination: {}, // 分页参数
    enabledList: [], // 是否启用列表
  },
  effects: {
    // 免税类型值级
    *init(_, { call, put }) {
      const data = getResponse(yield call(queryUnifyIdpValue, 'HPFM.ENABLED_FLAG'));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            enabledList: data,
          },
        });
      }
    },
    // 查询初始数据
    *fetchCurrencies({ payload }, { call, put }) {
      const response = yield call(queryCurDefinition, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { data, pagination: createPagination(data) },
        });
      }
    },
    // 引用云级数据
    *quoteCurrency({ payload }, { call }) {
      const response = yield call(quoteData, payload);
      return getResponse(response);
    },
    // 编辑数据
    *updateCurrency({ payload }, { call }) {
      const response = yield call(updateCurrencyDef, payload);
      return getResponse(response);
    },

    // 启用/禁用
    *updateEnabledFlag({ payload }, { call }) {
      const response = yield call(updateEnabledFlag, payload);
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
