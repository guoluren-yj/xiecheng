/**
 * applicationConfigure - 应用配置 - model
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryApplication,
  queryIdpValue,
  saveApplication,
} from '@/services/applicationConfigureService';

export default {
  namespace: 'applicationConfigure',
  state: {
    /**
     * 应用配置数据
     */
    data: {
      list: [],
      pagination: {},
    },
    /**
     * 应用类型值集块码
     */
    code: {
      ApplicationType: [],
    },
  },
  effects: {
    /**
     * 查询应用配置数据
     */
    *fetchApplication({ payload }, { call, put }) {
      const response = yield call(queryApplication, payload);
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
    /**
     * 查询应用类型
     */
    *fetchApplicationType({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              ApplicationType: data,
            },
          },
        });
      }
    },
    /**
     * 保存应用配置数据
     */
    *saveApplicationConfigure({ payload }, { call }) {
      const response = yield call(saveApplication, payload);
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
