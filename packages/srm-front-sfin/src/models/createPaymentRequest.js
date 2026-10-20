/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  submit,
  searchList,
  handleSubmit,
  deleteList,
  fetchModalList,
  handleSearchHeader,
  fetchInvoiceLine,
  saveList,
  fetchLine,
  deleteHeader,
  fetchOperationRecordList,
  bindHeaderAttachmentUuid,
  queryCancelDetail,
  fetchCancelModalList,
  cancelVerification,
  deleteLines,
} from '@/services/createPaymentRequestServices';
import { queryMapIdpValue } from 'services/api';
import { validateSubmit, hasValidateSubmit, batchValidateSubmit } from '@/services/paymentServices';

export default {
  namespace: 'createPaymentRequest',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
    enumMap: {},
    cancelData: {},
    cancelLinePage: {},
    cancelModalList: [],
    cancelModalPage: {},
  },
  effects: {
    // -查询列表
    *searchList({ payload }, { call, put, spawn }) {
      const response = getResponse(
        yield call(searchList, { ...payload, asyncCountFlag: 'DEFAULT' })
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
          queryRequest: searchList,
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
    *init(_, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          sourceList: 'SFIN.PAYMENT_STATUS',
          paymentSourceType: 'SFIN.PAYMENT_SOURCE_TYPE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },

    // -查询明细头
    *handleSearchHeader({ payload }, { call, put }) {
      const response = getResponse(yield call(handleSearchHeader, payload));
      yield put({
        type: 'updateState',
        payload: {
          headerInfo: response,
        },
      });
      return response;
    },

    // -查询明细行
    *fetchInvoiceLine({ payload }, { call }) {
      const InvoiceLine = getResponse(yield call(fetchInvoiceLine, payload));
      return InvoiceLine;
    },

    // 查询发票行列表信息 - 明细
    *fetchModalList({ payload }, { call }) {
      const response = yield call(fetchModalList, payload);
      const data = getResponse(response);
      return data;
    },

    // 保存明细
    *saveList({ payload }, { call }) {
      const res = yield call(saveList, payload);
      return getResponse(res);
    },
    // 查询关联单据信息 - 明细
    *fetchLine({ payload }, { call }) {
      const lineDataSource = getResponse(yield call(fetchLine, payload));
      return lineDataSource;
    },

    // 绑定附件
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },

    // 提交明细
    *handleSubmit({ payload }, { call }) {
      const res = yield call(handleSubmit, payload);
      return getResponse(res);
    },

    // 删除发票行数据
    *deleteList({ payload }, { call }) {
      const response = yield call(deleteList, payload);
      return getResponse(response);
    },

    // 删除数据-明细头
    *deleteHeader({ payload }, { call }) {
      const response = yield call(deleteHeader, payload);
      return getResponse(response);
    },

    // -提交采购协议
    *submit({ payload }, { call }) {
      const response = getResponse(yield call(submit, payload));
      return response;
    },

    // 操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = yield call(fetchOperationRecordList, payload);
      return getResponse(response);
    },

    // -查询预付款核销明细
    *queryCancelDetail({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCancelDetail, payload));
      if (res) {
        const { cancelVerificationVOListPage = {} } = res;
        yield put({
          type: 'updateState',
          payload: {
            cancelData: {
              ...res,
              cancelVerificationVOList: cancelVerificationVOListPage.content,
            },
            cancelLinePage: createPagination(cancelVerificationVOListPage),
          },
        });
      }
    },
    // 查询选择核销行数据
    *fetchCancelModalList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchCancelModalList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            cancelModalList: res.content,
            cancelModalPage: createPagination(res),
          },
        });
      }
    },

    // 核销
    *cancelVerification({ payload }, { call }) {
      const res = getResponse(yield call(cancelVerification, payload));
      return res;
    },

    // 删除核销行
    *deleteLines({ payload }, { call }) {
      const res = getResponse(yield call(deleteLines, payload));
      return res;
    },

    // 校验提交
    *validateSubmit({ payload }, { call }) {
      const response = yield call(validateSubmit, payload);
      return getResponse(response);
    },
    // 校验提交
    *hasValidateSubmit({ payload }, { call }) {
      const response = yield call(hasValidateSubmit, payload);
      return getResponse(response);
    },

    // 校验提交
    *batchValidateSubmit({ payload }, { call }) {
      const response = yield call(batchValidateSubmit, payload);
      return getResponse(response);
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
