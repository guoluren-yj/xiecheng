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
  queryComOrPersonRuleService,
  fetchAllDeliveryAddress,
  fetchCompanyDetail,
  updateCompanyDetail,
} from '@/services/ecAddressService';

const addressType = { addressType: 'RECEIVER' };

export default {
  namespace: 'smallEcDeliveryAddress',
  state: {
    list: {},
    pagination: {},
    modalList: [],
    modalPagination: {},
    companyList: [],
    comPagination: {},
  },
  effects: {
    // 查询收货地址
    *fetchEcDeliveryAddress({ payload }, { call, put }) {
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

    // 新增收货地址
    *addEcDeliveryAddress({ payload }, { call }) {
      const response = yield call(addEcAddress, { ...addressType, ...payload });
      return getResponse(response);
    },

    // 编辑收货地址
    *updateEcDeliveryAddress({ payload }, { call }) {
      const response = yield call(updateEcAddress, { ...addressType, ...payload });
      return getResponse(response);
    },
    // 查询配置中心是否勾选默认个人地址
    *queryComOrPersonRuleService(_, { call }) {
      const response = yield call(queryComOrPersonRuleService);
      return getResponse(response);
    },
    // 查询公司下全部默认收货地址
    *fetchAllDeliveryAddress({ payload }, { call, put }) {
      const response = yield call(fetchAllDeliveryAddress, { ...addressType, ...payload });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            modalList: list.content,
            modalPagination: createPagination(list),
          },
        });
      }
    },
    // 查询默认收货地址配置
    *fetchCompanyDetail({ payload }, { call, put }) {
      const response = yield call(fetchCompanyDetail, { ...payload });
      const companyList = getResponse(response);
      if (companyList) {
        yield put({
          type: 'updateState',
          payload: {
            companyList: companyList.content,
            comPagination: createPagination(companyList),
          },
        });
      }
    },
    // 编辑默认收货地址配置
    *updateCompanyDetail({ payload }, { call }) {
      const response = yield call(updateCompanyDetail, { ...addressType, ...payload });
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
