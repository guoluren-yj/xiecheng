/**
 * ecClientSite - 平台电商账号管理 - model
 * @date: 2019-3-06
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchECClientSite,
  fetchPaymentType,
  changePwd,
  saveECClientSite,
  editECClientSite,
  fetchInitDataStatus,
  initSyncData,
  singleInit,
  activateAccount,
} from '@/services/ecClientSiteService.js';

export default {
  namespace: 'smallEcClientSite',
  state: {
    data: [],
    paymentType: [],
  },
  effects: {
    *fetchECClientSite({ payload }, { put, call }) {
      const res = yield call(fetchECClientSite, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: data.content,
          },
        });
      }
    },
    *fetchPaymentType({ payload }, { put, call }) {
      const response = yield call(fetchPaymentType, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            paymentType: data,
          },
        });
      }
      return data;
    },
    *changePwd({ payload }, { call }) {
      const res = yield call(changePwd, payload);
      const data = getResponse(res);
      return data;
    },
    *saveECClientSite({ payload }, { call }) {
      const res = yield call(saveECClientSite, payload);
      const data = getResponse(res);
      return data;
    },
    *editECClientSite({ payload }, { call }) {
      const res = yield call(editECClientSite, payload);
      const data = getResponse(res);
      return data;
    },
    *fetchInitDataStatus({ payload }, { call }) {
      const res = yield call(fetchInitDataStatus, payload);
      const data = getResponse(res);
      return data;
    },
    *initSyncData({ payload }, { call }) {
      const res = yield call(initSyncData, payload);
      const data = getResponse(res);
      return data;
    },
    *singleInit({ payload }, { call }) {
      const res = yield call(singleInit, payload);
      const data = getResponse(res);
      return data;
    },
    *activateAccount({ payload }, { call }) {
      const res = yield call(activateAccount, payload);
      const data = getResponse(res);
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
