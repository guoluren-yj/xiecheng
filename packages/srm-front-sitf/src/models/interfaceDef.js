/**
 * interfaceDefinition - 接口定义 - model 平台级
 * @date: 2018-09-09
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchInterfaceDef,
  updateInterfaces,
  fetchKeywordConfig,
  optionsKeywordConfig,
  fetchReload,
} from '@/services/interfaceDefService';
import {
  queryInterFaceTable,
  updateInterFaceTable,
  deleteInterFaceTable,
} from '@/services/interfaceTableDefService';

export default {
  namespace: 'interfaceDef',
  state: {
    list: {},
    pagination: {},
    code: [],
    interfaceList: [],
    keyWordList: [],
    keyWordPagination: {},
  },
  effects: {
    // 值级查询
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const response = yield call(queryMapIdpValue, lovCodes);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            code: list,
          },
        });
      }
    },

    /**
     * 获取接口定义列表
     * @returns
     */
    *fetchInterfaceDef({ payload }, { call, put }) {
      const response = yield call(fetchInterfaceDef, payload);
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

    // 查询接口表接口定义列表
    *fetchInterFaceTable({ payload }, { call, put }) {
      const response = yield call(queryInterFaceTable, payload);

      const interfaceList = getResponse(response);
      if (interfaceList) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceList,
          },
        });
      }
    },

    /**
     * 更新接口定义
     * @returns
     */
    *updateInterfaces({ payload }, { call }) {
      const response = yield call(updateInterfaces, payload);
      return getResponse(response);
    },

    // 修改或新增接口结构定义
    *updateInterFaceTable({ payload }, { call }) {
      const response = yield call(updateInterFaceTable, payload);
      return getResponse(response);
    },

    // 删除接口结构定义
    *deleteInterFaceTable({ payload }, { call }) {
      const response = yield call(deleteInterFaceTable, payload);
      return getResponse(response);
    },

    // 接口定义-关键字配置查询【平台】
    *fetchKeywordConfig({ payload }, { call, put }) {
      const response = yield call(fetchKeywordConfig, payload);

      const result = getResponse(response);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            keyWordList: result.content,
            keyWordPagination: createPagination(result),
          },
        });
      }
    },
    // 接口定义-关键字配置保存【平台】
    *optionsKeywordConfig({ payload }, { call }) {
      const response = yield call(optionsKeywordConfig, payload);
      return getResponse(response);
    },

    // 接口定义-关键字配置删除【平台】
    *fetchReload({ payload }, { call }) {
      const response = yield call(fetchReload, payload);
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
