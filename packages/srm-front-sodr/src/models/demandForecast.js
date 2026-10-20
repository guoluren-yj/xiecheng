/*
 * sendOrder - 我发出的订单
 * @date: 2018/10/13 11:43:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';
import { createPagination, getResponse, addItemToPagination } from 'utils/utils';
import {
  fetchList,
  fetchSave,
  fetchOperationRecordList,
  batchRelease,
  batchDelete,
  batchClose,
  fetchCategory,
} from '@/services/demandForecastService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'demandForecast',

  state: {
    annualForecast: {
      list: [],
      pagination: {},
      queryProps: {},
    },
    monthlyForecast: {
      list: [],
      pagination: {},
      queryProps: {},
    },
    projectForecast: {
      list: [],
      pagination: {},
      queryProps: {},
    },
    weekForecast: {
      list: [],
      pagination: {},
      queryProps: {},
    },
    selectedKeys: {
      weekForecastSelectedRows: [],
      weekForecastSelectedRowKeys: [],
      projectForecastSelectedRows: [],
      projectForecastSelectedRowKeys: [],
      monthlyForecastSelectedRows: [],
      monthlyForecastSelectedRowKeys: [],
      annualForecastSelectedRows: [],
      annualForecastSelectedRowKeys: [],
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
    *fetchList({ payload }, { call, put }) {
      const { flag, ...otherParams } = payload;
      const result = getResponse(yield call(fetchList, otherParams));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            [flag]: {
              list: result.content.map((item) => ({ ...item, _status: 'update' })),
              pagination: createPagination(result),
              queryProps: otherParams,
            },
          },
        });
      }
      return result;
    },
    // save
    *fetchSave({ payload }, { call }) {
      const data = getResponse(yield call(fetchSave, payload));
      return data;
    },
    // batchRelease
    *batchRelease({ payload }, { call }) {
      const data = getResponse(yield call(batchRelease, payload));
      return data;
    },
    // batchDelete
    *batchDelete({ payload }, { call }) {
      const data = getResponse(yield call(batchDelete, payload));
      return data;
    },
    // batchClose
    *batchClose({ payload }, { call }) {
      const data = getResponse(yield call(batchClose, payload));
      return data;
    },
    // fetchOperationRecordList
    *fetchOperationRecordList({ payload }, { call }) {
      const data = getResponse(yield call(fetchOperationRecordList, payload));
      return data;
    },
    // 查询品类定义
    *fetchCategory({ payload }, { call }) {
      const res = getResponse(yield call(fetchCategory, payload));
      return res;
    },
  },
  reducers: {
    addRow(state, { payload }) {
      const { flag } = payload;
      let returnVal = null;
      if (flag === 'annualForecast') {
        const { annualForecast = {} } = state;
        const { list = [], pagination = {} } = annualForecast;
        returnVal = {
          ...state,
          annualForecast: {
            list: [{ _status: 'create', forecastId: uuid(), forecastType: 'YEAR' }, ...list],
            pagination: addItemToPagination(list.length, pagination),
          },
        };
      } else if (flag === 'monthlyForecast') {
        const { monthlyForecast = {} } = state;
        const { list = [], pagination = {} } = monthlyForecast;
        returnVal = {
          ...state,
          monthlyForecast: {
            list: [{ _status: 'create', forecastId: uuid(), forecastType: 'MONTH' }, ...list],
            pagination: addItemToPagination(list.length, pagination),
          },
        };
      } else if (flag === 'weekForecast') {
        const { weekForecast = {} } = state;
        const { list = [], pagination = {} } = weekForecast;
        returnVal = {
          ...state,
          weekForecast: {
            list: [{ _status: 'create', forecastId: uuid(), forecastType: 'WEEK' }, ...list],
            pagination: addItemToPagination(list.length, pagination),
          },
        };
      } else {
        const { projectForecast = {} } = state;
        const { list = [], pagination = {} } = projectForecast;
        returnVal = {
          ...state,
          projectForecast: {
            list: [{ _status: 'create', forecastId: uuid(), forecastType: 'PROJECT' }, ...list],
            pagination: addItemToPagination(list.length, pagination),
          },
        };
      }
      return returnVal;
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
