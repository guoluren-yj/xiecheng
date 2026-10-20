/**
 * sourceDataSearch - 源数据查询 - 租户级 - model
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  queryBatchListOrg,
  fetchConfigOrg,
  fetchDataOrg,
} from '@/services/sourceDataSearchService';

export default {
  namespace: 'sourceDataSearchOrg',
  state: {
    // 批次数据
    batchData: {
      list: [],
      pagination: {},
    },
    // 配置信息
    config: [],
    tabTitle: [],
  },
  effects: {
    /**
     * 查询批次列表信息
     */
    *queryBatchList({ payload }, { call, put }) {
      const response = yield call(queryBatchListOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            batchData: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 查询配置
     */
    *fetchConfig({ payload }, { call, put }) {
      const response = yield call(fetchConfigOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            config: data,
          },
        });
        const firstTableConfig = data[0];
        const res = yield call(fetchDataOrg, {
          pageData: { page: {}, ...payload },
          url: firstTableConfig.interfaceUrl,
        });
        const firstTableData = getResponse(res);
        if (firstTableData) {
          yield put({
            type: 'updateState',
            payload: {
              tabTitle: { [`${firstTableConfig.tableName}`]: firstTableData },
            },
          });
        }
      }
    },
    /**
     * 查询数据
     */
    *fetchData({ payload }, { call, put }) {
      const response = yield call(fetchDataOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateTabTitle',
          payload: {
            [`${payload.tableName}`]: data,
          },
        });
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
    updateTabTitle(state, { payload }) {
      return {
        ...state,
        tabTitle: {
          ...state.tabTitle,
          ...payload,
        },
      };
    },
  },
};
