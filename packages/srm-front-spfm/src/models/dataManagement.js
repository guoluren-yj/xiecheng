/**
 * dataManagementService.js - 资料管理
 * @date: 2019-4-3
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  fetchList,
  fetchOperationRecordList,
  saveList,
  updateOperator,
  queryAssign,
  getGroup,
  fetchViewList,
} from '@/services/dataManagementService';
import { queryMapIdpValue } from 'services/api';
import { removeFile } from 'hzero-front/lib/services/api';

export default {
  namespace: 'dataManagement',
  state: {
    list: [], // 数据列表
    pagination: {},
    viewList: [], // 只读数据列表
    viewPagination: {},
  },
  effects: {
    // 查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          targetEnum: 'SPFM.PORTAL.ATTACHMENT_TARGET',
          status: 'SPFM.PORTAL.ATTACHMENT_STATUS',
          categoryStatus: 'SPFM.PORTAL.ATTACHMENT_CATEGORY',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // list
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    // list
    *fetchViewList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchViewList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            viewList: result.content,
            viewPagination: createPagination(result),
          },
        });
      }
    },

    // list
    *getGroup({ payload }, { call }) {
      const groupMsg = getResponse(yield call(getGroup, payload));
      return getResponse(groupMsg);
    },
    // list
    *saveList({ payload }, { call }) {
      const result = yield call(saveList, payload);
      return getResponse(result);
    },
    // list
    *updateOperator({ payload }, { call }) {
      const result = yield call(updateOperator, payload);
      return getResponse(result);
    },

    // fetchOperationRecordList
    *fetchOperationRecordList({ payload }, { call }) {
      const result = yield call(fetchOperationRecordList, payload);
      return getResponse(result);
    },

    // fetchOperationRecordList
    *removeFile({ payload }, { call }) {
      const result = yield call(removeFile, payload);
      return getResponse(result);
    },
    *queryAssign({ payload }, { call }) {
      const result = yield call(queryAssign, payload);
      return getResponse(result);
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
