/**
 * ecDeliveryAddress -收货地址 model
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcAddress,
  addEcAddress,
  updateEcAddress,
  fetchEcCompanyId,
} from '@/services/ecAddressService';

const addressType = { addressType: 'RECEIVER', ownerType: 'COMPANY' };

export default {
  namespace: 'companyDeliveryAddress',
  state: {
    list: {},
    pagination: {},
    currentCompany: [],
  },
  effects: {
    // 查询收货地址
    *fetchCompanyDeliveryAddress({ payload }, { call, put }) {
      const response = yield call(fetchEcAddress, { ...addressType, ...payload });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    *fetchEcCompany(_, { call, put }) {
      const res = yield call(fetchEcCompanyId);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompany: result.content,
          },
        });
      }
      return result;
    },

    // 新增收货地址
    *addCompanyDeliveryAddress({ payload }, { call }) {
      const response = yield call(addEcAddress, { ...addressType, ...payload });
      return getResponse(response);
    },

    // 编辑收货地址
    *updateCompanyDeliveryAddress({ payload }, { call }) {
      const response = yield call(updateEcAddress, { ...addressType, ...payload });
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
