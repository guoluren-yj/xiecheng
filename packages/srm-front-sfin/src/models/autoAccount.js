/**
 * model - 自动对账
 * @date: 2019-2-18
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  fetchNoAccount,
  fetchAlreadyAccount,
  fetchInvoiceDownloadList,
} from '@/services/autoAccountService';

export default {
  namespace: 'autoAccount',
  state: {
    code: {}, // 值集code 列表
    noAccountList: [], // 未对账列表
    noAccountpagination: {}, // 未对账分页
    alreadyAccountList: [], // 已对账列表
    alreadyAccountPagination: {}, // 已对账分页
    noAccountRowKeys: [], // 主键数组
    alreadyAccountRowKeys: [], // 主键数组
    invoiceDownloadPagination: {}, // 详情页面的发票下载分页
    invoiceDownloadList: [], // 详情页面的发票下载列表
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },

    // 查询未对账数据
    *fetchNoAccount({ payload }, { call, put, spawn }) {
      const response = yield call(fetchNoAccount, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            noAccountList: data.content.map((n) => ({ ...n, _status: 'update' })),
            noAccountpagination: createPagination(data),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchNoAccount,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { noAccountpagination: pagination },
            });
          },
        });
      }
    },

    // 查询已对账数据
    *fetchAlreadyAccount({ payload }, { call, put, spawn }) {
      const response = yield call(fetchAlreadyAccount, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            alreadyAccountList: data.content.map((n) => ({ ...n, _status: 'update' })),
            alreadyAccountPagination: createPagination(data),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchAlreadyAccount,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { alreadyAccountPagination: pagination },
            });
          },
        });
      }
    },

    // 发票下载
    *fetchInvoiceDownloadList({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceDownloadList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceDownloadList: data.ecEcinvoiceAclines,
            invoiceDownloadPagination: createPagination(data),
          },
        });
      }
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
