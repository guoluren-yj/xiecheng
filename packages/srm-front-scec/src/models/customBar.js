/**
 * customBar - 平台自定义栏管理 - service 平台级
 * @date: 2019年2月19日 17:20:11
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchCustomBarList,
  fetchCustomBar,
  updateCustomBar,
  shelfAction,
  fetchCustomBarHistory,
  fetchCustomBarAssignList,
  createOrUpdateCustomBarAssign,
  deleteCustomBarAssign,
  fetchCurrentCompanyValue,
} from '@/services/customBarService';

export default {
  namespace: 'customBar',
  state: {
    barType: '',
    assignDataChange: false,
    customBar: {},
    list: {},
    pagination: {},
    historyList: {},
    historyPagination: {},
    assignList: {},
    assignPagination: {},
    lov: {},
    currentCompanyList: [],
    sourceType: [],
  },
  effects: {
    // 初始化 值集 这类在页面生存周期不会变的变量
    *init(_, { call, put }) {
      const lovBatchRes = yield call(queryMapIdpValue, {
        level: 'HIAM.RESOURCE_LEVEL', // 层级
        customBarType: 'SCEC.CUSTOM_BAR_TYPE', // 自定义栏类型
        customBarStatus: 'SCEC.CUSTOM_BAR_STATUS', // 自定义栏状态
        sourceType: 'SCEC.PRODUCT_SOURCE_FROM',
      });
      const lovBatch = getResponse(lovBatchRes);
      if (lovBatch) {
        const levelMap = {};
        lovBatch.level.forEach(level => {
          levelMap[level.value] = level;
        });
        yield put({
          type: 'updateState',
          payload: {
            lov: {
              level: lovBatch.level,
              levelMap,
              customBarType: lovBatch.customBarType,
              customBarStatus: lovBatch.customBarStatus,
              sourceType: lovBatch.sourceType,
            },
          },
        });
      }
    },

    *fetchCustomBarList({ payload }, { call, put }) {
      const response = yield call(fetchCustomBarList, payload);
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

    *fetchCustomBar({ payload }, { call, put }) {
      const response = yield call(fetchCustomBar, payload);
      const customBar = getResponse(response);
      const { barType } = customBar;
      if (customBar) {
        yield put({
          type: 'updateState',
          payload: {
            customBar,
            barType,
          },
        });
      }
    },

    *fetchCustomBarAssignList({ payload }, { call, put }) {
      const response = yield call(fetchCustomBarAssignList, payload);
      const assignList = getResponse(response);
      if (assignList) {
        yield put({
          type: 'updateState',
          payload: {
            assignList: {
              ...assignList,
              content: assignList.content.map(i => ({
                ...i,
                _status: 'update',
              })),
            },
            assignPagination: createPagination(assignList),
          },
        });
      }
    },

    *updateCustomBar({ payload }, { call }) {
      const response = yield call(updateCustomBar, payload);
      return getResponse(response);
    },

    *shelfAction({ payload }, { call }) {
      const response = yield call(shelfAction, payload);
      return getResponse(response);
    },

    *createOrUpdateCustomBarAssign({ payload }, { call }) {
      const response = yield call(createOrUpdateCustomBarAssign, payload);
      return getResponse(response);
    },

    *fetchCustomBarHistory({ payload }, { call, put }) {
      const response = yield call(fetchCustomBarHistory, payload);
      const historyList = getResponse(response);
      if (historyList) {
        yield put({
          type: 'updateState',
          payload: {
            historyList,
            historyPagination: createPagination(historyList),
          },
        });
      }
    },

    *deleteCustomBarAssign({ payload }, { call }) {
      const response = yield call(deleteCustomBarAssign, payload);
      return getResponse(response);
    },

    // 获取当前公司值集
    *fetchCurrentCompanyValue({ payload }, { call, put }) {
      const res = yield call(fetchCurrentCompanyValue, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompanyList: result,
          },
        });
      }
      return result;
    },

    *fetchAllProduct({ payload }, { call, put }) {
      const res = yield call(fetchCurrentCompanyValue, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            allProductLov: result.productList,
          },
        });
      }
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
