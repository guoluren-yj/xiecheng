/**
 * ecClient - 电商账号管理 - model
 * @date: 2019-2-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  fetchECClient,
  activateAccount,
  saveECClient,
  editECClient,
  fetchDetailData,
  initSyncData,
  changePwd,
  fetchPaymentType,
  fetchInitDataStatus,
  singleInit,
  queryParIdpValue,
  fetchCommonData,
  saveModalData,
  deleteModalData,
} from '@/services/ecClientService.js';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'ecClient',
  state: {
    data: [],
    commonData: [],
    mapStatusList: [],
  },
  effects: {
    *fetchCommonData({ payload }, { call, put }) {
      const response = yield call(fetchCommonData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            commonData: dealDataState(data),
          },
        });
      }
    },
    *queryMapParentStatusList({ payload }, { call, put }) {
      const response = yield call(queryParIdpValue, payload);
      const parMapStatusList = getResponse(response);
      if (parMapStatusList) {
        yield put({
          type: 'updateState',
          payload: {
            mapStatusList: parMapStatusList,
          },
        });
      }
    },
    *saveModalData({ payload }, { call }) {
      const response = yield call(saveModalData, payload);
      const data = getResponse(response);
      return data;
    },
    *deleteModalData({ payload }, { call }) {
      const response = yield call(deleteModalData, payload);
      const data = getResponse(response);
      return data;
    },
    *fetchECClient({ payload }, { call, put }) {
      const response = yield call(fetchECClient, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data,
          },
        });
      }
    },
    *activateAccount({ payload }, { call }) {
      const response = yield call(activateAccount, payload);
      const data = getResponse(response);
      return data;
    },
    *saveECClient({ payload }, { call }) {
      const response = yield call(saveECClient, payload);
      const data = getResponse(response);
      return data;
    },
    *editECClient({ payload }, { call }) {
      const response = yield call(editECClient, payload);
      const data = getResponse(response);
      return data;
    },
    *fetchDetailData({ payload }, { call }) {
      const response = yield call(fetchDetailData, payload);
      const data = getResponse(response);
      return data;
    },
    *initSyncData({ payload }, { call }) {
      const response = yield call(initSyncData, payload);
      const data = getResponse(response);
      return data;
    },
    *changePwd({ payload }, { call }) {
      const response = yield call(changePwd, payload);
      const data = getResponse(response);
      return data;
    },
    *fetchPaymentType({ payload }, { call, put }) {
      const response = yield call(fetchPaymentType, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            paymentType: dealDataState(data),
          },
        });
      }
    },
    *fetchInitDataStatus({ payload }, { call }) {
      const response = yield call(fetchInitDataStatus, payload);
      const data = getResponse(response);
      return data;
    },
    *singleInit({ payload }, { call }) {
      const response = yield call(singleInit, payload);
      const data = getResponse(response);
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
