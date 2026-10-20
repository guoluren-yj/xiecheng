/**
 * purchaseReception - 事务接收
 * @date: 2019-1-28
 * @author:lixiaolong <xioalong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  queryList,
  queryDetailList,
  saveReception,
  searchAddList,
  queryLovDate,
  receivingVerification,
} from '@/services/purchaseReceptionService.js';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'purchaseReception',

  state: {
    deliveryType: [], // 送货单类型值集
    flagCode: [],
    dataSource: [], // 列表数据源
    pagination: {}, // 列表分页信息
    modalDataSource: [], // 新增弹框列表数据源
    modalPagination: [], // 新增弹框列表分页信息
  },

  effects: {
    /**
     * 入口页面查询和查询送货单类型值集
     * @param {?object} payload - 查询字段对象
     */
    *fetchList({ payload = {} }, { call, put }) {
      const code = getResponse(yield call(queryList, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: code.content || [],
            pagination: createPagination(code),
          },
        });
      }
    },
    *fetchValue(_, { call, put }) {
      const deliveryType = getResponse(yield call(queryIdpValue, 'SINV.ASN_TYPE'));
      const flagCode = getResponse(yield call(queryIdpValue, 'SINV.RECEIVE_ORDER_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          deliveryType,
          flagCode,
        },
      });
    },
    /**
     * 查询维护界面信息
     * @param {object} payload - 查询数据的 id 的数组
     */
    *fetchDetailList({ payload = {} }, { call }) {
      const res = getResponse(yield call(queryDetailList, payload));
      return res;
    },
    /**
     * 接收过账
     * @param {object} payload - 要接收过账的数据
     * @param {*} { call }
     * @returns
     */
    *saveReception({ payload = {} }, { call }) {
      const res = getResponse(yield call(saveReception, payload));
      return res;
    },
    /**
     * 新增弹窗的查询请求
     * @param {object} payload - 查询字段对象
     * @param {*} { call, put }
     */
    *fetchSearchList({ payload = {} }, { call, put }) {
      const code = getResponse(yield call(searchAddList, payload));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: {
            modalDataSource: code.content,
            modalPagination: createPagination(code),
          },
        });
      }
    },
    *queryLov({ payload = {} }, { call }) {
      const res = getResponse(yield call(queryLovDate, payload));
      return res;
    },
    *receivingVerification({ payload }, { call }) {
      const res = getResponse(yield call(receivingVerification, payload));
      return res;
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
