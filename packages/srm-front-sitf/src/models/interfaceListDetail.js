/**
 * interfaceListDetail - 接口查询 - 接口表 - model
 * @date: 2018-9-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  fetchConfig,
  fetchInterfaceData,
  queryIdpValue,
} from '@/services/interfaceListDetailService';

export default {
  namespace: 'interfaceListDetail',
  state: {
    // 配置数据
    configData: {},
    // 接口数据
    interfaecData: {},
    // 接口状态值集块码
    code: {
      SitfStatus: [],
    },
  },
  effects: {
    /**
     * 查询外部系统数据
     */
    *fetchSitfStatus({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              SitfStatus: data,
            },
          },
        });
      }
    },
    /**
     * 查询配置
     */
    *fetchConfig({ payload }, { call, put }) {
      const response = yield call(fetchConfig, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            configData: data,
          },
        });
        // if (payload.batchId) {
        if (payload) {
          const res = yield call(fetchInterfaceData, {
            url: data.interfaceUrl,
            data: { page: 0, size: 10, ...payload },
          });
          const resData = getResponse(res);
          if (resData) {
            yield put({
              type: 'updateState',
              payload: {
                interfaecData: resData,
              },
            });
          }
        }
      }
      return data;
    },
    /**
     * 查询数据
     */
    *fetchData({ payload }, { call, put }) {
      const response = yield call(fetchInterfaceData, { url: payload.interfaceUrl, ...payload });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            interfaecData: data,
          },
        });
      }
    },
    /**
     * 查询子表配置
     */
    *fetchChildList({ payload }, { call }) {
      const config = yield call(fetchConfig, payload);
      if (getResponse(config)) {
        const dataSource = yield call(fetchInterfaceData, {
          url: config.interfaceUrl,
          data: payload,
        });
        if (getResponse(dataSource)) {
          return {
            config: getResponse(config),
            dataSource: getResponse(dataSource),
          };
        } else {
          return '';
        }
      } else {
        return '';
      }
    },
    /**
     * 查询子表数据
     */
    *fetchChildData({ payload }, { call }) {
      const response = yield call(fetchInterfaceData, { url: payload.interfaceUrl, ...payload });
      if (getResponse(response)) {
        return {
          dataSource: getResponse(response),
        };
      }
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
