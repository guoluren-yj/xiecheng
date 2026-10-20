/*
 * sendOrder - 我发出的订单
 * @date: 2018/10/13 11:43:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  getDetail,
  detailSave,
} from '@/services/demandForecastService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'demandForecastDetail',

  state: {
    annualForecast: {
      list: [],
      pagination: {},
    },
    monthlyForecast: {
      list: [],
      pagination: {},
    },
    projectForecast: {
      list: [],
      pagination: {},
    },
    weekForecast: {
      list: [],
      pagination: {},
    },
    enumMap: {},
    // invoiceLines: [], // 详情页-关联单据-网上发票
  },

  effects: {
    // 查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPRM.FORECAST_STATUS',
          flag: 'HPFM.FLAG',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // 查询列表
    *getDetail({ payload }, { call }) {
      const { flag, ...otherParams } = payload;
      const result = getResponse(yield call(getDetail, otherParams));
      return result.map(item => ({ ...item, _status: 'update' }));
    },
    // save
    *detailSave({ payload }, { call }) {
      const data = getResponse(yield call(detailSave, payload));
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
  },
};
