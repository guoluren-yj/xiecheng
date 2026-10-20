/**
 * interfacePageConfig - 接口页面配置 - model
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterfacePageConfigOrg,
  saveInterfacePageConfigOrg,
  removeInterfacePageConfigOrg,
  quoteSiteDataOrg,
} from '@/services/interfacePageConfigService';

export default {
  namespace: 'interfacePageConfigOrg',
  state: {
    // 接口页面配置数据
    data: {
      list: [],
      pagination: {},
    },
    // 接口表类型值集块码
    code: {
      InterfaceTableType: [],
    },
  },
  effects: {
    // 查询接口配置页面数据
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryInterfacePageConfigOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    // 保存接口配置数据
    *save({ payload }, { call }) {
      const response = yield call(saveInterfacePageConfigOrg, payload);
      return getResponse(response);
    },
    // 保存接口配置数据
    *remove({ payload }, { call }) {
      const response = yield call(removeInterfacePageConfigOrg, payload);
      return getResponse(response);
    },
    // 引用平台级数据
    *quoteSiteData({ payload }, { call }) {
      const response = yield call(quoteSiteDataOrg, payload);
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
