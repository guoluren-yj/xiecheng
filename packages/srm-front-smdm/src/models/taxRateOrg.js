/**
 * model - 租户税率定义
 * @date: 2018-8-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import {
  queryTax,
  updateTax,
  addTax,
  fetchFields,
  fetchTaxRateService,
  fetchTaxRateServiceSave,
  fetchQuoteDemisionMap,
  fetchQuoteDemision,
} from '@/services/taxRateOrgService';
import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'taxRateOrg',
  state: {
    data: {}, // 表格list
    pagination: {}, // 分页参数
    serviceContent: [],
    servicePagination: {},
    taxTypeList: [], // 税种值集
    taxFromList: [], // 税率形式
  },
  effects: {
    // 初始化值集
    *init(_, { call, put }) {
      const response = yield call(queryMapIdpValue, {
        taxTypeList: 'SMDM.TAX_TYPE',
        taxFromList: 'SMDM.TAX_FROM',
        taxRateTypeList: 'SMDM.TAX_RATE_TYPE',
      });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            taxTypeList: data.taxTypeList,
            taxFromList: data.taxFromList,
            taxRateTypeList: data.taxRateTypeList || [],
          },
        });
      }
    },
    // 查询租户级税率
    *fetchTaxRate({ payload }, { call, put }) {
      const response = yield call(queryTax, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data,
            pagination: createPagination(data),
          },
        });
      }
    },
    // 引用云级数据
    // *quoteTaxRate(_, { call }) {
    //   const response = yield call(quoteData, _);
    //   return getResponse(response);
    // },
    // 新建税率
    *addTaxRate({ payload }, { call }) {
      const response = yield call(addTax, payload);
      return getResponse(response);
    },
    // 修改税率
    *updateTaxRate({ payload }, { call }) {
      const response = yield call(updateTax, payload);
      return getResponse(response);
    },
    // 修改税率
    *fetchFields({ payload }, { call, put }) {
      const response = yield call(fetchFields, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            fields: data,
          },
        });
      }
    },
    // 查询租户级税率fuwu
    *fetchTaxRateService({ payload }, { call, put }) {
      const response = yield call(fetchTaxRateService, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            serviceContent: data.content || [],
            servicePagination: createPagination(data),
          },
        });
      }
    },
    *fetchTaxRateServiceSave({ payload }, { call }) {
      const response = yield call(fetchTaxRateServiceSave, payload);
      return getResponse(response);
    },
    *fetchQuoteDemision({ payload }, { call }) {
      const response = yield call(fetchQuoteDemision, payload);
      return getResponse(response);
    },
    *fetchQuoteDemisionMap({ payload }, { call }) {
      const response = yield call(fetchQuoteDemisionMap, payload);
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
