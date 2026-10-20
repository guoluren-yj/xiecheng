/**
 * goodsManage - 商品维护查询 - medal
 * @date: 2019-2-9
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import uuid from 'uuid/v4';
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGoodsList,
  batchPutAway,
  batchUnShelve,
  fetchCurrentCompanyValue,
  fetchHistoryRecord,
} from '@/services/goodsManageService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'smallGoodsManage',
  state: {
    mappingStatus: [], // 映射状态值集
    groupNotList: [], // 集团级未上架列表
    groupNotPage: {}, // 集团级未上架列表分页
    groupDidList: [], // 集团级已上架列表
    groupDidPage: {}, // 集团级已上架列表分页
    companyNotList: [], // 公司级未上架列表
    companyNotPage: {}, // 公司级未上架列表分页
    companyDidList: [], // 公司级未上架列表
    companyDidPage: {}, // 公司级已上架列表分页
    ladderPriceList: [], // 阶梯价格列表
    historyList: [], // 操作记录列表
    historyPage: {}, // 操作记录列表分页
  },
  effects: {
    // 获取协议来源、映射状态值集
    *batchCode(_, { call, put }) {
      const mappingStatus = getResponse(yield call(queryIdpValue, 'SMAL.MAPPING_STATUS'));
      if (mappingStatus) {
        yield put({
          type: 'updateState',
          payload: {
            mappingStatus,
          },
        });
      }
      return mappingStatus;
    },

    // 获取当前公司值集
    *fetchCurrentCompanyValue({ payload }, { call }) {
      return getResponse(yield call(fetchCurrentCompanyValue, payload));
    },
    // 商品已上架列表查询
    *fetchDidList({ payload }, { call, put }) {
      const { isGroup = false } = payload;
      const response = getResponse(yield call(fetchGoodsList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            [isGroup ? 'groupDidList' : 'companyDidList']: response.content.map(item => ({
              ...item,
              _status: 'update',
              uuid: uuid(),
            })),
            [isGroup ? 'groupDidPage' : 'companyDidPage']: createPagination(response),
          },
        });
      }
      return response;
    },
    // 商品未上架列表查询
    *fetchNotList({ payload }, { call, put }) {
      const { isGroup = false } = payload;
      const response = getResponse(yield call(fetchGoodsList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            [isGroup ? 'groupNotList' : 'companyNotList']: response.content.map(item => ({
              ...item,
              _status: 'update',
              uuid: uuid(),
            })),
            [isGroup ? 'groupNotPage' : 'companyNotPage']: createPagination(response),
          },
        });
      }
      return response;
    },

    // 商品批量上架
    *batchPutAway({ payload }, { call }) {
      const response = yield call(batchPutAway, payload);
      return getResponse(response);
    },

    // 商品批量下架
    *batchUnShelve({ payload }, { call }) {
      const response = yield call(batchUnShelve, payload);
      return getResponse(response);
    },
    // 获取历史记录
    *fetchHistoryRecord({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchHistoryRecord, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            historyList: response.content,
            historyPage: createPagination(response),
          },
        });
      }
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
