/*
 * flexModel - 弹性域模型model
 * @date: 2019/12/13
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

// import { isEmpty } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  queryDetail,
  // queryCode,
  create,
  update,
  deleteRows,
  queryFlexRuleDetails,
} from '../services/flexRuleService';

export default {
  namespace: 'flexRule',

  state: {
    code: {},
    paramsCache: {},
  },

  effects: {
    // 查询列表
    *queryList({ params }, { call }) {
      const response = getResponse(yield call(queryList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryDetail({ ruleId, params }, { call }) {
      const response = getResponse(yield call(queryDetail, ruleId, params));
      return response || {};
    },
    *create({ data }, { call }) {
      const response = yield call(create, data);
      return response;
    },
    *update({ data }, { call }) {
      const response = yield call(update, data);
      return response;
    },
    *deleteRows({ data }, { call }) {
      const response = yield call(deleteRows, data);
      return response;
    },
    *queryFlexRuleDetails({ params }, { call }) {
      const response = getResponse(yield call(queryFlexRuleDetails, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查询值集
    // *queryCode({ payload }, { put, call }) {
    //   const response = yield call(queryCode, payload);
    //   if (response && !response.failed) {
    //     yield put({
    //       type: 'setCodeReducer',
    //       payload: {
    //         [payload.lovCode]: response,
    //       },
    //     });
    //   }
    // },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
  },
};
