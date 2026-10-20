/**
 * index - 发票验真
 * @date: 2019-07-24
 * @author: zuoxaingyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  print,
  update,
  ocrCheck,
  ofdCheck,
  examine,
  verExamine,
  deleteList,
  // queryDetailList,
  queryVerfiedList,
  queryAwaitVerifyList,
  verCheckDetailQuery,
} from '@/services/invoiceVerificationService';

export default {
  namespace: 'invoiceVerification',
  state: {
    listQuery: {},
    enumMap: [], // 检验状态值集
    dataSource: [], // 待检验的数据
    verDataSource: [], // 已检验的数据
    pagination: {}, // 待检验的分页
    verifiedPagination: {}, // 已检验的分页
    lastActiveTabKey: 'list', // 默认tab页
    awaitVerifyCellChange: true, // 数据是否改变
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          cflag: 'SFIN.INVOICE_VALIDATE_STATUS',
          iflag: 'SFIN.TAX_INVOICE_STATUS',
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

    // 待检验页查询请求
    *queryAwaitVerifyList({ payload }, { call, put, spawn }) {
      const response = getResponse(
        yield call(queryAwaitVerifyList, { ...payload, asyncCountFlag: 'Y' })
      );
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: response,
          queryRequest: queryAwaitVerifyList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { pagination },
            });
          },
        });
      }
    },

    // 更新查验税务发票列表
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },

    // 删除页面已选列表
    *deleteList({ payload }, { call }) {
      const response = getResponse(yield call(deleteList, payload));
      return response;
    },

    // 已检验页查询请求
    *queryVerfiedList({ payload }, { call, put, spawn }) {
      const { ...otherParams } = payload;
      const response = getResponse(
        yield call(queryVerfiedList, { ...payload, asyncCountFlag: 'Y' })
      );
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            verDataSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            verifiedPagination: createPagination(response),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: response,
          queryRequest: queryVerfiedList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { verifiedPagination: pagination },
            });
          },
        });
      }
    },

    // -发票查验 -- 待查验
    *examine({ payload }, { call }) {
      const response = getResponse(yield call(examine, payload.examineList));
      return response;
    },

    // -发票查验 -- 已查验
    *verExamine({ payload }, { call }) {
      const response = getResponse(yield call(verExamine, payload.verExamineList));
      return response;
    },
    // -打印功能
    *print({ poHeaderId }, { call }) {
      const res = getResponse(yield call(print, poHeaderId));
      return res;
    },
    // 税务发票查验明细查询
    *verCheckDetailQuery({ payload }, { call }) {
      const response = getResponse(yield call(verCheckDetailQuery, payload));
      return response;
    },

    // OCR识别
    *ocrCheck({ payload }, { call }) {
      const response = getResponse(yield call(ocrCheck, payload));
      return response;
    },

    // OFD 解析
    *ofdCheck({ payload }, { call }) {
      const response = getResponse(yield call(ofdCheck, payload));
      return response;
    },
  },

  reducers: {
    // 更新页面状态
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
