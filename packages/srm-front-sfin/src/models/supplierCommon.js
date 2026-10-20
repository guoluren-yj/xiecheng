/**
 * index.js - 供应商操作记录
 * @date: 2020-03-12
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchOperationRecordList,
  fetchSourceList,
  saveSource,
  deleteSource,
  queryList,
  fetchOrder,
  fetchContract,
} from '@/services/supplierCommonService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierCommon',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
    sourceDataSource: [], // 来源单据
    sourceDataPagation: {}, // 来源分页
    header: {},
    pcContractStatus: {},
  },

  effects: {
    // -查询值集
    *init(params, { call, put }) {
      const pcContractStatus = getResponse(
        yield call(queryMapIdpValue, {
          pcStatus: 'SPCM.CONTRACT.STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          pcContractStatus,
        },
      });
    },
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            header: response.content[0],
          },
        });
      }
    },
    // -操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = getResponse(yield call(fetchOperationRecordList, payload));
      return response;
    },
    // 来源单据分页
    *fetchSourceList({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchSourceList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            sourceDataSource: response.content,
            sourceDataPagation: createPagination(response),
          },
        });
      }
      return response;
    },
    // 保存
    *saveSource({ payload }, { call }) {
      const response = getResponse(yield call(saveSource, payload));
      return response;
    },
    // -删除
    *deleteSource({ payload }, { call }) {
      const response = getResponse(yield call(deleteSource, payload));
      return response;
    },
    // -扣款单可关联订单查询
    *fetchOrder({ payload }, { call }) {
      const response = getResponse(yield call(fetchOrder, payload));
      return response;
    },
    // -扣款单可关联协议查询
    *fetchContract({ payload }, { call }) {
      const response = getResponse(yield call(fetchContract, payload));
      return response;
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
