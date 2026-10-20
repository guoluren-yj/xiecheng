/**
 * interfacePageConfig - 接口页面配置 - model
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryInterfacePageConfig,
  saveInterfacePageConfig,
  removeInterfacePageConfig,
} from '@/services/interfacePageConfigService';

export default {
  namespace: 'interfacePageConfig',
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
      const response = yield call(queryInterfacePageConfig, payload);
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
      const response = yield call(saveInterfacePageConfig, payload);
      return getResponse(response);
    },
    // 保存接口配置数据
    *remove({ payload }, { call }) {
      const response = yield call(removeInterfacePageConfig, payload);
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
