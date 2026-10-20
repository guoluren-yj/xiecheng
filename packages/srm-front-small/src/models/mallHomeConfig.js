/* eslint-disable no-param-reassign */
/**
 * mallHomeConfig - model
 * @date: 2020-07-22
 * @author YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse } from 'utils/utils';
import {
  deleteImgUrl,
  fetchDetail,
  saveConfig,
  saveCustConfig,
  fetchIsOnlyInProduct,
  saveIsOnlyInProduct,
} from '@/services/mallHomeConfigService';

// const compare = property => (a, b) => {
//   const value1 = a[property];
//   const value2 = b[property];
//   return value1 - value2;
// };

export default {
  namespace: 'mallHomeConfig',
  state: {
    topicColor: 'A',
    logoUrl: '',
    pageTitle: '',
    iconUrl: '', // 浏览器图标
    bottomType: 0, // 底部栏类型 0纯文字，1文字加二维码
    bottomEnable: 0, // 底部栏启用 0否，1是
    catalogType: 0, // 目录栏类型 0纯文字，1文字icon
    personalTitle: '', // 个性化标题
    recordEnable: 0, // 档案信息是否启用
    recordInformation: '', // 档案信息
    pageIconUnitList: [],
    pageBottomList: [],
  },
  effects: {
    *deleteImgUrl({ payload }, { call }) {
      const response = yield call(deleteImgUrl, payload);
      const result = getResponse(response);
      return result;
    },
    *fetchIsOnlyInProduct({ payload }, { call }) {
      const response = yield call(fetchIsOnlyInProduct, payload);
      const result = getResponse(response);
      return result;
    },
    *saveIsOnlyInProduct({ payload }, { call }) {
      const response = yield call(saveIsOnlyInProduct, payload);
      const result = getResponse(response);
      return result;
    },
    *fetchDetail({ payload = {} }, { call, put }) {
      const response = yield call(fetchDetail, {
        ...payload,
        srmUrl:
          window.$$env.NODE_ENV === 'production'
            ? window.location.origin
            : 'https://dev.isrm.going-link.com',
        // srmUrl: 'https://dev.isrm.going-link.com',
        // srmUrl: 'https://luxshare-ict.test.isrm.going-link.com',
      });
      const result = getResponse(response);
      yield put({
        type: 'updateState',
        payload: result,
      });
      return result;
    },
    *save({ payload }, { call, put }) {
      const response = yield call(saveConfig, payload);
      const result = getResponse(response);
      yield put({
        type: 'updateState',
        payload: result,
      });
      return result;
    },
    *saveCust({ payload }, { call, put }) {
      const response = yield call(saveCustConfig, payload);
      const result = getResponse(response);
      yield put({
        type: 'updateState',
        payload: result,
      });
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
