/**
 * model - 应付发票申请
 * @date: 2019-2-19
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  fetchCreate,
  fetchInvoiceHeaderPurchaser,
  fetchInvoiceLinePurchaser,
  createPayableInvoice,
  fetchMaintain,
  fetchOrdDetailHeader,
  fetchOrdDetaillLine,
  fetchInvoiceHeaderSupplier,
  fetchInvoiceLineSupplier,
  deletePayableInvoice,
  fetchInvoiceInformation,
  savePayableInvoice,
  submitPayableInvoice,
  validateInvoice,
  queryProvinceCity,
  queryNewMallCity,
} from '@/services/payableInvoiceService';
import {
  queryTaxInvoiceLine,
  saveTaxLine,
  deleteTaxInvoiceLine,
  queryInvoiceDetailLine,
} from '@/services/invoiceService';

export default {
  namespace: 'payableInvoice',
  state: {
    code: {}, // 值集code 列表
    applyQueryList: [], // 申请查询列表
    applyQueryPagination: {}, // 申请查询列表
    maintainQueryList: [], // 维护列表
    maintainQueryPagination: {}, // 维护分页
    purchaserHeaderInfo: {}, // 采购方订单头信息
    purchaserLineList: [], // 采购方明细列表
    purchaserLinePagination: {}, // 采购方明细分页
    supplierHeaderInfo: {}, // 供应商订单头信息
    supplierLineList: [], // 供应商明细列表
    supplierLinePagination: {}, // 供应商明细分页
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
    *fetchCreate({ payload }, { call, put, spawn }) {
      const response = yield call(fetchCreate, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (!data) return;
      const { content } = data;
      yield put({
        type: 'updateState',
        payload: {
          applyQueryList: content,
          applyQueryPagination: createPagination(data),
        },
      });
      yield spawn(fetchTotalCountGen, {
        payload,
        firstResult: data,
        queryRequest: fetchCreate,
        *setPagination(pagination) {
          yield put({
            type: 'updateState',
            payload: { applyQueryPagination: pagination },
          });
        },
      });
    },
    // 创建应付发票
    *createPayableInvoice({ payload }, { call }) {
      const response = yield call(createPayableInvoice, payload);
      return getResponse(response);
    },

    // 查询发票明细头 采购方
    *fetchInvoiceHeaderPurchaser({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceHeaderPurchaser, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateDetailState',
          payload: {
            purchaserHeaderInfo: data,
          },
        });
        return data;
      }
    },
    // 查询发票明细行 采购方
    *fetchInvoiceLinePurchaser({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceLinePurchaser, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateDetailState',
          payload: {
            purchaserLineList: data.content.map((n) => ({ ...n, _status: 'update' })),
            purchaserLinePagination: createPagination(data),
            invoiceHeaderId: payload.invoiceHeaderId,
          },
        });
      }
    },

    // 电商类型明细行
    *fetchInvoiceDetailLine({ payload }, { call, put }) {
      const response = yield call(queryInvoiceDetailLine, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateDetailState',
          payload: {
            purchaserLineList: data.content.map((n) => ({ ...n, _status: 'update' })),
            purchaserLinePagination: createPagination(data),
            invoiceHeaderId: payload.invoiceHeaderId,
          },
        });
      }
    },

    // 查询发票明细头 供应商
    *fetchInvoiceHeaderSupplier({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceHeaderSupplier, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateDetailState',
          payload: {
            supplierHeaderInfo: data,
          },
        });
      }
    },
    // 查询发票明细行 供应商
    *fetchInvoiceLineSupplier({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceLineSupplier, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateDetailState',
          payload: {
            supplierLineList: data.content.map((n) => ({ ...n, _status: 'update' })),
            supplierLinePagination: createPagination(data),
            invoiceHeaderId: payload.invoiceHeaderId,
          },
        });
      }
    },

    // 查询开票信息
    *fetchInvoiceInformation({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceInformation, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceInfo: data,
          },
        });
      }
    },

    // 查询发票维护
    *fetchMaintain({ payload }, { call, put, spawn }) {
      const response = yield call(fetchMaintain, { ...payload, asyncCountFlag: 'Y' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            maintainQueryList: data.content,
            maintainQueryPagination: createPagination(data),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchMaintain,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { maintainQueryPagination: pagination },
            });
          },
        });
      }
    },

    // 查询订单头信息 - 明细
    *fetchOrdDetailHeader({ payload }, { call, put }) {
      const response = yield call(fetchOrdDetailHeader, payload);
      const data = getResponse(response);
      if (data) {
        if (data[0]) {
          yield put({
            type: 'updateState',
            payload: { headerInfo: data[0] },
          });
        }
      }
    },

    // 查询订单行信息 - 明细
    *fetchOrdDetaillLine({ payload }, { call, put }) {
      const response = yield call(fetchOrdDetaillLine, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { dataSource: data, pagination: createPagination(data) },
        });
      }
    },

    // 查询省市地址
    *queryProvinceCity(_, { call, put }) {
      const countryRes = getResponse(
        yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      );
      if (countryRes) {
        const { countryId } = countryRes[0];
        const cityList = getResponse(yield call(queryProvinceCity, { countryId }));
        if (cityList) {
          yield put({
            type: 'updateState',
            payload: {
              cityList,
            },
          });
        }
      }
    },

    // 初始化查询地区第一级
    *queryDefaultCity(_, { call }) {
      const countryRes = getResponse(
        yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      );
      if (countryRes) {
        const { countryId } = countryRes[0];
        const cityResponse = getResponse(yield call(queryNewMallCity, { countryId, page: -1 }));
        if (!isEmpty(cityResponse.content)) {
          const newCityResponse = cityResponse.content.map((n) => {
            const m = {
              ...n,
            };
            m.isLeaf = false;
            return m;
          });
          return newCityResponse;
        }
        return [];
      }
    },

    // 查询城市列表
    *queryNewMallCity({ payload }, { call }) {
      const cityResponse = getResponse(yield call(queryNewMallCity, { ...payload }));
      if (!isEmpty(cityResponse.content)) {
        const newCityResponse = cityResponse.content.map((n) => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        return newCityResponse;
      }
      return [];
    },

    // 删除发票
    *deletePayableInvoice({ payload }, { call }) {
      const response = yield call(deletePayableInvoice, payload);
      return getResponse(response);
    },
    // 保存发票
    *savePayableInvoice({ payload }, { call }) {
      const response = yield call(savePayableInvoice, payload);
      return getResponse(response);
    },
    // 保存发票
    *submitPayableInvoice({ payload }, { call }) {
      const response = yield call(submitPayableInvoice, payload);
      return getResponse(response);
    },
    // 验证发票
    *validateInvoice({ payload }, { call }) {
      const response = yield call(validateInvoice, payload);
      return getResponse(response);
    },
    // 税务发票行列表查询
    *queryTaxInvoiceLine({ payload }, { call }) {
      return getResponse(yield call(queryTaxInvoiceLine, payload));
    },
    // 税务发票行列表保存
    *saveTaxLine({ payload }, { call }) {
      return getResponse(yield call(saveTaxLine, payload));
    },
    // 税务发票行列表删除
    *deleteTaxInvoiceLine({ payload }, { call }) {
      return getResponse(yield call(deleteTaxInvoiceLine, payload));
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateDetailState(state, { payload }) {
      const {
        purchaserHeaderInfo: { invoiceHeaderId: purchaserHeaderId } = {},
        supplierHeaderInfo: { invoiceHeaderId: supplierHeaderId } = {},
        invoiceHeaderId: headerId,
      } = payload;
      const invoiceHeaderId = purchaserHeaderId || supplierHeaderId || headerId;
      // 按不同的id存入对象
      let idMap = {};
      if (invoiceHeaderId) {
        idMap = {
          [invoiceHeaderId]: {
            purchaserHeaderInfo: {},
            purchaserLineList: [],
            purchaserLinePagination: {},
            supplierHeaderInfo: {},
            supplierLineList: [],
            supplierLinePagination: {},
            ...state[invoiceHeaderId],
            ...payload,
          },
        };
      }
      return {
        ...state,
        ...idMap,
      };
    },
  },
};
