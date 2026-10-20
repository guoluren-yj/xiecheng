/**
 * index.js - 供应商扣款录入
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  queryList,
  update,
  submit,
  deleteList,
  fetchOperationRecordList,
  bindLineAttachmentUuid,
  handleCancel,
} from '@/services/supplierChargeEntryServices';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierChargeEntry',
  state: {
    enumMap: {},
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put, spawn }) {
      const response = getResponse(
        yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: response,
          queryRequest: queryList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { pagination },
            });
          },
        });
      }
    },
    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          bank: 'SFIN.DEBIT_CREDIT_CODE',
          // link: 'SPRM.ACCOUNT_SUBJECT',
          type: 'SFIN.DEDUCTION_STATUS',
          flag: 'HPFM.FLAG',
          paymentMethod: 'SQAM.PAYMENT_TYPE',
          // tax: 'SPRM.TAX',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 保存数据
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },

    // -提交
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload.sfinList));
      return response;
    },
    // -提交
    *handleCancel({ payload }, { call }) {
      const response = getResponse(yield call(handleCancel, payload));
      return response;
    },

    // 删除页面已选列表
    *deleteList({ payload }, { call }) {
      const response = getResponse(yield call(deleteList, payload));
      return response;
    },

    // -操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = getResponse(yield call(fetchOperationRecordList, payload));
      return response;
    },

    // 绑定行附件id
    *bindLineAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindLineAttachmentUuid, payload));
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
