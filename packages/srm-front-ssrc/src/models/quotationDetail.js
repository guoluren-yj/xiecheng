/**
 * models - 报价明细
 * @date: 2020-05-14
 * @version: 1.0.0
 * @author: cj <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */
import { isEmpty } from 'lodash';

import { getResponse, createPagination } from 'utils/utils';

import {
  fetchQuotationDetailHeader,
  fetchSodrQuotationDetail,
  fetchQuotationDetailTemplate,
  saveElementDetail,
  deleteElementDetail,
  deleteQuotationDetail,
  saveQuotationDetail,
  fetchTwoDetails,
} from '@/services/quotationDetailService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

function dealChildren(data) {
  // 处理树状table
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      if (item.childFlag) {
        return {
          ...item,
          children: dealDataState(item.children) || [],
        };
      } else {
        return item;
      }
    });
  }
  return config;
}

export default {
  namespace: 'quotationDetail',
  state: {
    code: {}, // 值集编码
    header: {}, // 报价明细头
    quotationDetail: [], // 报价明细行
    quotationDetailPagination: {}, // 报价明细行分页
    template: {}, // 模板
    templatePagination: {}, // 模板分页
  },
  effects: {
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 报价明细头
    *fetchQuotationDetailHeader({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailHeader, payload);
      result = getResponse(result);
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      if (!isEmpty(result) && result.supQuotationDetailPage) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetail: dealChildren(dealDataState(result.supQuotationDetailPage.content)),
            quotationDetailPagination: createPagination(result.supQuotationDetailPage),
          },
        });
      }
      return result;
    },
    // 报价明细头-供订单和物流使用
    *fetchSodrQuotationDetail({ payload }, { call, put }) {
      let result = yield call(fetchSodrQuotationDetail, payload);
      result = getResponse(result);
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      if (!isEmpty(result) && result.supQuotationDetailPage) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetail: dealChildren(dealDataState(result.supQuotationDetailPage.content)),
            quotationDetailPagination: createPagination(result.supQuotationDetailPage),
          },
        });
      }
      return result;
    },
    // 报价明细模板
    *fetchQuotationDetailTemplate({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchQuotationDetailTemplate, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            template: result.content,
            templatePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询-报价明细项二级
    *fetchTwoDetails({ payload }, { call, put }) {
      const { quotationDetail = [], ...otherPayload } = payload;
      const result = getResponse(yield call(fetchTwoDetails, otherPayload));
      let newQuotationDetail = quotationDetail;
      if (result) {
        if (!isEmpty(result)) {
          newQuotationDetail = quotationDetail.map((item) => {
            if (item.supQuotationDetailId === otherPayload.supQuotationDetailId) {
              return {
                ...item,
                children: dealDataState(result),
              };
            } else {
              return item;
            }
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            quotationDetail: newQuotationDetail,
          },
        });
      }
      return newQuotationDetail;
    },
    // 删除报价明细
    *deleteElementDetail({ payload }, { call }) {
      const result = getResponse(yield call(deleteElementDetail, payload));
      return result;
    },
    // 保存报价明细
    *saveElementDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveElementDetail, payload));
      return result;
    },
    // 删除报价明细
    *deleteQuotationDetail({ payload }, { call }) {
      const result = getResponse(yield call(deleteQuotationDetail, payload));
      return result;
    },
    // 保存报价明细
    *saveQuotationDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveQuotationDetail, payload));
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
