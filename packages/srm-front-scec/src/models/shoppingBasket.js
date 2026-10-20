/**
 * shoppingBasket - 购物篮管理 - model
 * @date: 2019年11月05日
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchBasketList,
  shelfAction,
  createBasket,
  fetchBasketBar,
  fetchProductList,
  deleteProduct,
  fetchHistory,
} from '@/services/shoppingBasketService';

export default {
  namespace: 'shoppingBasket',
  state: {
    currentCompany: [],
    shoppingBasketList: [],
    pagination: {},
    historyList: [],
    historyPagination: {},
    assignDataChange: false, // 表格数据是否发生改变
    shoppingBasket: {}, // 商品购物篮信息
    productList: {}, // 购物篮商品列表
    productPagination: {}, // 购物篮商品分页
    lov: {}, // 商品lov
  },
  effects: {
    *init(_, { call, put }) {
      const lovBatchRes = yield call(queryMapIdpValue, {
        level: 'HIAM.RESOURCE_LEVEL', // 层级
        sourceType: 'SCEC.PRODUCT_SOURCE_FROM',
      });
      const lovBatch = getResponse(lovBatchRes);
      if (lovBatch) {
        const levelMap = {};
        lovBatch.level.forEach(level => {
          levelMap[level.value] = level;
        });
        yield put({
          type: 'updateState',
          payload: {
            lov: {
              level: lovBatch.level,
              levelMap,
              sourceType: lovBatch.sourceType,
            },
          },
        });
      }
    },
    *fetchBasketList({ payload }, { call, put }) {
      const res = yield call(fetchBasketList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            shoppingBasketList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *shelfAction({ payload }, { call }) {
      const res = yield call(shelfAction, payload);
      return getResponse(res);
    },

    // 新建购物篮
    *createBasket({ payload }, { call }) {
      const response = yield call(createBasket, payload);
      return getResponse(response);
    },

    // 查询头信息
    *fetchBasketBar({ payload }, { call, put }) {
      const response = yield call(fetchBasketBar, payload);
      const shoppingBasket = getResponse(response).content[0];
      if (shoppingBasket) {
        yield put({
          type: 'updateState',
          payload: {
            shoppingBasket,
          },
        });
      }
    },

    // 查询列表信息
    *fetchProductList({ payload }, { call, put }) {
      const response = yield call(fetchProductList, payload);
      const productList = getResponse(response);
      if (productList) {
        yield put({
          type: 'updateState',
          payload: {
            productList: {
              ...productList,
              content: productList.content.map(i => ({
                ...i,
                _status: 'update',
              })),
            },
            productPagination: createPagination(productList),
          },
        });
      }
    },

    // 删除购物篮商品列表
    *deleteProduct({ payload }, { call }) {
      const response = yield call(deleteProduct, payload);
      return getResponse(response);
    },

    // 获取历史记录
    *fetchHistoryRecord({ payload }, { call, put }) {
      const res = yield call(fetchHistory, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: result.content,
            historyPagination: createPagination(result),
          },
        });
      }
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
