/**
 * model 索赔项目定义
 * @date: 2019-11-05
 * @author: wuting <ting.wu@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchClaimType,
  saveClaimType,
  deleteClaimType,
  fetchClaimItem,
  saveClaimItem,
  deleteClaimItem,
} from '@/services/claimTypeDefinitionService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'claimTypeDefinition',
  state: {
    enumMap: {}, // 值集
    dataSource: [], // 索赔项目定义列表
    pagination: {}, // 索赔项目定义分页信息
  },
  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          chargeCode: 'SSTA.CHARGE', // 索赔类型定义,匹配费用单项目直集
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    /**
     * 查询索赔单类型
     */
    *fetchClaimType({ payload }, { call, put }) {
      const res = yield call(fetchClaimType, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: data.map((item) => {
              return { _status: 'update', ...item };
            }),
          },
        });
      }
    },

    // 分配采购保存
    *saveClaimType({ payload }, { call }) {
      const res = yield call(saveClaimType, payload);
      return getResponse(res);
    },

    // 分配采购删除
    *deleteClaimType({ payload }, { call }) {
      const res = yield call(deleteClaimType, payload);
      return getResponse(res);
    },

    /**
     * 查询索赔单类型
     */
    *fetchClaimItem({ payload }, { call }) {
      const res = yield call(fetchClaimItem, payload);
      return getResponse(res);
    },

    // 分配采购保存
    *saveClaimItem({ payload }, { call }) {
      const res = yield call(saveClaimItem, payload);
      return getResponse(res);
    },

    // 分配采购删除
    *deleteClaimItem({ payload }, { call }) {
      const res = yield call(deleteClaimItem, payload);
      return getResponse(res);
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
