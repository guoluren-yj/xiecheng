/**
 * purchaseReception - 验收单
 * @date: 2019-11-22
 * @author:LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryList,
  queryDetail,
  queryDetailList,
  queryHeader,
  fetchOperationRecordList,
  resyncAcceptance,
} from '@/services/acceptanceSheetService.js';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'acceptanceSheetQuery',

  state: {
    dataSource: [], // 验收单查询列表数据源
    pagination: {}, // 验收单查询列表分页信息
    header: {}, // 验收单详情查询头详情
    detailHeaderDataSource: [], // 验收单详情查询行列表
    detailHeaderDataPagination: {}, // 验收单详情查询行分页
    code: {}, // 值集
  },

  effects: {
    /**
     * 查询列表的数据
     * @param {?object} payload - 查询字段对象
     */
    *fetchList({ payload = {} }, { call, put }) {
      const { page, ...param } = payload;
      const res = getResponse(yield call(queryList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content || [],
            pagination: createPagination(res),
            queryParams: param,
          },
        });
      }
    },
    /**
     * 查询列表明细的数据
     * @param {?object} payload - 查询字段对象
     */
    *fetchDetail({ payload = {} }, { call, put }) {
      const { page, ...param } = payload;
      const res = getResponse(yield call(queryDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            detailDataSource: res.content || [],
            detailPagination: createPagination(res),
            queryDetailParams: param,
          },
        });
      }
    },
    /**
     * 查询维护界面头信息
     * @param {object} payload - 查询数据的 id 的数组
     */
    *fetchHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(queryHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            header: res,
          },
        });
      }
      return res;
    },

    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },

    /**
     * 查询维护界面行信息
     * @param {object} payload - 查询数据的 id 的数组
     */
    *fetchDetailList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryDetailList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            detailHeaderDataSource: res.content || [],
            detailHeaderDataPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 获取操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },

    // 验收单重新同步
    *resyncAcceptance({ payload }, { call }) {
      const result = getResponse(yield call(resyncAcceptance, payload));
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
