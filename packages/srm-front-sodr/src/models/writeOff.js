/**
 * model SRM冲销
 * @date: 2019-01-26
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  queryWriteOffList,
  queryTrxLineList,
  queryWriteOffListAdd,
  addTrx,
  validateWriteOff,
} from '@/services/writeOffService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'writeOff',
  state: {
    writeOffList: [], // 冲销数据列表
    writeOffListPagination: {}, // 冲销数据列表分页信息
    asnTypeCode: [], // 送货单类型
    flagCode: [],
    trxLineList: [], // 维护界面表数据
    trxLineListPagination: {}, // 维护界面表分页信息
    writeOffListAdd: [], // 新增冲销数据列表
    writeOffListAddPagination: {}, // 新增冲销数据列表分页信息
  },
  effects: {
    // SRM冲销入口列表
    *fetchWriteOffList({ payload }, { call, put }) {
      let result = yield call(queryWriteOffList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            writeOffList: result.content,
            writeOffListPagination: createPagination(result),
          },
        });
      }
    },
    // 维护界面-事务行列表
    *fetchTrxLineList({ payload }, { call, put }) {
      let result = yield call(queryTrxLineList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            trxLineList: result.content.map((item, index) => ({
              ...item,
              quantity: item.permitReverseQuantity,
              lineNum: result.number * result.size + index + 1, // 计算行号
              _status: 'update',
            })),
            trxLineListPagination: createPagination(result),
          },
        });
      }
    },
    // 新增事务行
    *fetchWriteOffListAdd({ payload }, { call, put }) {
      let result = yield call(queryWriteOffListAdd, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            writeOffListAdd: result.content.map((item) => ({ ...item, _status: 'update' })),
            writeOffListAddPagination: createPagination(result),
          },
        });
      }
    },
    // 新增事务冲销
    *addTrx({ payload }, { call }) {
      let result = yield call(addTrx, payload);
      result = getResponse(result);
      return result;
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          asnTypeCode: 'SINV.ASN_TYPE',
          flagCode: 'SINV.RECEIVE_ORDER_TYPE',
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: { ...result },
        });
      }
    },
    // 查询明细头
    // *queryDetailHeader({ asnHeaderId, params }, { call }) {
    //   // eslint-disable-next-line no-undef
    //   const response = yield call(queryDetailHeader, asnHeaderId, params);
    //   return getResponse(response);
    // },

    // 冲销预览校验
    *validateWriteOff({ payload }, { call }) {
      const response = getResponse(yield call(validateWriteOff, payload));
      return response;
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
