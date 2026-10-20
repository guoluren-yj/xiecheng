/**
 * authorityInventory - 租户级权限维护tab页 - 库房 - model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryInventoryData,
  saveData,
  deleteData,
  queryInventoryModalData,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityInventory',

  state: {
    head: {}, // 头部数据
    list: [], // 请求查询到的数据
    pagination: {}, // 分页信息
    inventoryDataSource: [],
    inventoryPagination: {},
  },
  effects: {
    *fetchAuthorityInventory({ payload }, { call, put }) {
      const response = yield call(queryInventoryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            head: data.userAuthority,
            list: data.userAuthorityLineDtoList.content,
            pagination: createPagination(data.userAuthorityLineDtoList),
          },
        });
      }
    },
    *addAuthorityInventory({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityInventory({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryInventoryModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            inventoryDataSource: data.content,
            inventoryPagination: createPagination(data),
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
  },
};
