/**
 * mallDataMapping - 商城主数据映射
 * @date: 2020-5-19
 * @author hl <li.huang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { queryIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import {
  saveUnitMap,
  saveTaxRateMap,
  saveCurrencyMap,
  fetchUnitList,
  fetchTaxRateList,
  fetchCurrencyList,
} from '@/services/mallDataMappingService';

export default {
  namespace: 'mallDataMapping',
  state: {
    mapStatusList: [], // 映射状态值集
    unitMapList: [], // 单位映射列表
    unitMapPagination: {}, // 单位映射列表分页信息
    taxRateMapList: [], // 税率映射列表
    tabRateMapPagination: {}, // 税率映射列表分页信息
    currencyMapList: [], // 币种映射列表
    currencyMapPagination: {}, // 币种映射列表分页信息
  },

  effects: {
    // 查询映射状态值集
    *fetchMapStatusList(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SMAL.MAPPING_STATUS');
      const mapStatusList = getResponse(response);
      if (mapStatusList) {
        yield put({
          type: 'updateState',
          payload: {
            mapStatusList,
          },
        });
      }
    },
    // 查询单位映射
    *fetchUnitList({ payload = {} }, { call, put }) {
      const result = getResponse(yield call(fetchUnitList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            unitMapList: result.content.map(item => ({ ...item, _status: 'update' })),
            unitMapPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询税率映射
    *fetchTaxRateList({ payload = {} }, { call, put }) {
      const result = getResponse(yield call(fetchTaxRateList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            taxRateMapList: result.content.map(item => ({ ...item, _status: 'update' })),
            tabRateMapPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询币种映射
    *fetchCurrencyList({ payload = {} }, { call, put }) {
      const result = getResponse(yield call(fetchCurrencyList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currencyMapList: result.content.map(item => ({ ...item, _status: 'update' })),
            currencyMapPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存单位映射
    *saveUnitMap({ payload }, { call }) {
      return getResponse(yield call(saveUnitMap, payload));
    },
    // 保存税率映射
    *saveTaxRateMap({ payload }, { call }) {
      return getResponse(yield call(saveTaxRateMap, payload));
    },
    // 保存币种映射
    *saveCurrencyMap({ payload }, { call }) {
      return getResponse(yield call(saveCurrencyMap, payload));
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
