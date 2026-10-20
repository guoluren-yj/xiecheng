/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  onFetchList,
  newDetailList,
  removeInvoiceOrNot,
} from '@/services/optionToPayInvoiceServices';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'optionToPayInvoice',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
    enumMap: {},
  },
  effects: {
    // -查询列表
    *onFetchList({ payload }, { call, put }) {
      const response = getResponse(yield call(onFetchList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          sourceList: 'SFIN.INVOICE_HEADER_VALIDATE_STATUS',
          flagReverse: 'HPFM.FLAG',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },

    // 新建跳明细
    *newDetailList({ payload }, { call }) {
      const response = getResponse(yield call(newDetailList, payload));
      return response;
    },
    *removeInvoiceOrNot({ payload }, { call }) {
      const response = getResponse(yield call(removeInvoiceOrNot, payload));
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
