import { createPagination, getResponse } from 'utils/utils';
import {
  queryInventoryInquiryList,
  queryInventoryInquiryVendorList,
} from '@/services/inventoryInquiryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'inventoryInquiry',

  state: {
    inventoryInquiryData: [],
    inventoryInquiryPagination: {},
    inventoryInquiryVendorData: [],
    inventoryInquiryVendorPagination: {},
  },

  effects: {
    // 值集查询
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          specialInventory: 'SSKT.ITEM_SPECIAL_STOCK_TYPE', // 特殊库存
          supplierAddress: 'SSLM_SUPPLIER_SITE', // 供应商地址
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 查询采购方库存汇总
    *queryInventoryInquiryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryInventoryInquiryList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            inventoryInquiryData: content.map(n => {
              return {
                ...n,
                _status: 'update',
              };
            }),
            inventoryInquiryPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询供应商库存汇总
    *queryInventoryInquiryVendorList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryInventoryInquiryVendorList, payload));
      if (result) {
        const { content = [] } = result;
        yield put({
          type: 'updateState',
          payload: {
            inventoryInquiryVendorData: content.map(n => {
              return {
                ...n,
                _status: 'update',
              };
            }),
            inventoryInquiryVendorPagination: createPagination(result),
          },
        });
      }
      return result;
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
