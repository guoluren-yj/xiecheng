/**
 * goodsMaintain - 商品维护查询 - medal
 * @date: 2019-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGoodsList,
  saveGoodsInfo,
  fetchCatalogue,
  fetchGoodsDetail,
  fetchGoodsSubmit,
  fetchGoodsScrapped,
  fetchGoodsCateLogs,
  updateCateLog,
  importSourcingList,
  fetchLadderPriceTable,
  saveLadderPrice,
  deleteLadderPriceLines,
  fetchComapnyCurrency,
  deleteAttribute,
} from '@/services/goodsMaitainService';
import { queryMapIdpValue, queryUUID } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'goodsMaintain',
  state: {
    list: {},
    pagination: {},
    code: {},
    catalogueList: [],
    catalogueSecondList: [],
    attachmentImageUUId: '', // 上传图片UUID
    attachmentUUId: '', // 上传附件UUID
    detail: {},
    cateLogsList: {},
    cateLogsPagination: {},
    sourcingList: {},
    sourcingPagination: {},
    productId: '',
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

    // 获得值级
    *fetchComapnyCurrency({ payload }, { call }) {
      const response = yield call(fetchComapnyCurrency, payload);
      const res = getResponse(response);
      return res;
    },

    // 获得商品维护列表
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

    // 查询平台目录名称
    *fetchCatalogue({ payload }, { call, put }) {
      const response = yield call(fetchCatalogue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            catalogueList: list,
          },
        });
      }
    },

    // 用于查询商品详情
    *fetchGoodsDetail({ payload }, { call, put }) {
      const response = yield call(fetchGoodsDetail, payload);
      const detail = getResponse(response);
      if (detail) {
        yield put({
          type: 'updateState',
          payload: {
            detail: {
              ...detail,
              attributeDetails:
                detail.attributeDetails &&
                detail.attributeDetails.map(i => ({
                  ...i,
                  _status: 'update',
                })),
            },
          },
        });
      }
    },

    // 用于查询二级、三级菜单
    *fetchSecondCatalogue({ payload }, { call, put }) {
      const response = yield call(fetchCatalogue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            catalogueSecondList: list,
          },
        });
      }
    },

    // 用于查询商品三级目录(用于主页目录修改)
    *fetchGoodsCateLogs({ payload }, { call, put }) {
      const response = yield call(fetchGoodsCateLogs, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            cateLogsList: list,
            cateLogsPagination: createPagination(list),
          },
        });
      }
    },

    // 保存商品信息
    *saveGoodsInfo({ payload }, { call }) {
      const response = yield call(saveGoodsInfo, payload);
      return getResponse(response);
    },

    // 获取上传图片的uuid
    *getAttachmentId({ payload }, { call, put }) {
      const response = yield call(queryUUID, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentImageUUId: list.content,
          },
        });
      }
    },

    // 获取上传附件的uuid
    *getAttachmentUUId({ payload }, { call, put }) {
      const response = yield call(queryUUID, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentUUId: list.content,
          },
        });
      }
    },

    // 商品提交
    *fetchGoodsSubmit({ payload }, { call }) {
      const response = yield call(fetchGoodsSubmit, payload);
      return getResponse(response);
    },

    // 商品作废
    *fetchGoodsScrapped({ payload }, { call }) {
      const response = yield call(fetchGoodsScrapped, payload);
      return getResponse(response);
    },

    // 修改目录化目录名称
    *updateCateLog({ payload }, { call }) {
      const response = yield call(updateCateLog, payload);
      return getResponse(response);
    },

    *importSourcingList({ payload }, { call }) {
      const response = yield call(importSourcingList, payload);
      return getResponse(response);
    },

    // 阶梯报价-批量删除
    *deleteLadderPriceLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderPriceLines, payload));
      return result;
    },

    // 保存阶梯报价行
    *saveLadderPrice({ payload }, { call }) {
      const result = getResponse(yield call(saveLadderPrice, payload));
      return result;
    },

    // 询价阶梯报价
    *fetchLadderPriceTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderPriceTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceData: dealDataState(result.content),
          },
        });
      }
    },

    // 删除规格参数
    *deleteAttribute({ payload }, { call }) {
      const result = getResponse(yield call(deleteAttribute, payload));
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
