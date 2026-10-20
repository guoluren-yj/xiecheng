/**
 * ecAddressManage - 电商平台地址管理 - model
 * @date: 2019-11-19
 * @author tuo <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchCountryList,
  fetchAddressList,
  fetchParent,
  saveAddress,
  updateAddress,
  setPermissionSetEnable,
} from '@/services/ecAddressManageService';

export default {
  namespace: 'ecAddressManage',
  state: {
    addressPagination: {},
    addrLineChange: false, // 地址行改变
    addressList: [],
    allList: [],
  },
  effects: {
    // 国家查询
    *fetchCountryList(_, { call, put }) {
      const response = yield call(fetchCountryList);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            allList: list.content.map((n) => ({
              ...n,
              isLeaf: false,
              regionLevel: 0,
              regionCode: n.countryId,
              regionName: n.countryName,
              countryFlag: true,
            })),
          },
        });
      }
      return list;
    },
    // 地址树查询
    *fetchAllList({ payload }, { call, put }) {
      const response = yield call(fetchAddressList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            allList: list.content,
          },
        });
      }
      return list;
    },

    // 父级地址查询
    *fetchParent({ payload }, { call }) {
      const response = yield call(fetchParent, payload);
      const list = getResponse(response);
      return list;
    },

    // 地址列表查询
    *fetchAddressList({ payload }, { call, put }) {
      const response = yield call(fetchAddressList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            addressList: list.content,
            addressPagination: createPagination(list),
          },
        });
      }
    },

    // 保存
    *saveAddress({ payload }, { call }) {
      const response = yield call(saveAddress, payload);
      return getResponse(response);
    },

    // 修改
    *updateAddress({ payload }, { call }) {
      const response = yield call(updateAddress, payload);
      return getResponse(response);
    },

    // 启用/禁用
    *setPermissionSetEnable({ payload }, { call }) {
      const res = yield call(setPermissionSetEnable, payload);
      return getResponse(res);
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
