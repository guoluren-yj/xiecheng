/**
 * goodsManage - 商品维护查询 - medal
 * @date: 2019-2-9
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGoodsList,
  fetchGoodsListHwfp,
  batchGoodsApproved,
  batchGoodsReject,
  fetchProductDetail,
  getEnclosureList,
  fetchLadderPriceTable,
} from '@/services/goodsApproveService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'goodsApprove',
  state: {
    list: {},
    pagination: {},
    detail: {},
    code: {},
    ladderPriceData: [],
  },
  effects: {
    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            code: list,
          },
        });
      }
    },

    // 商品审批列表
    *fetchGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchGoodsList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 工作流的商品审批列表
    *fetchGoodsListHwfp({ payload }, { call, put }) {
      const response = yield call(fetchGoodsListHwfp, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 商品详情
    *fetchGoodsDetail({ payload }, { call, put }) {
      const response = yield call(fetchProductDetail, payload);
      const detail = getResponse(response);
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            detail,
          },
        });
      }
      return detail;
    },

    // 商品审批批量通过
    *batchGoodsApproved({ payload }, { call }) {
      const response = yield call(batchGoodsApproved, payload);
      return getResponse(response);
    },

    // 商品审批批量拒绝
    *batchGoodsReject({ payload }, { call }) {
      const response = yield call(batchGoodsReject, payload);
      return getResponse(response);
    },

    // 询价阶梯报价
    *fetchLadderPriceTable({ payload }, { call, put }) {
      const result = yield call(fetchLadderPriceTable, payload);
      const res = getResponse(result);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceData: res.content,
          },
        });
      }
    },
    // 获取附件列表，判断是有附件
    *getEnclosureList({ payload }, { call }) {
      return getResponse(yield call(getEnclosureList, payload));
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
