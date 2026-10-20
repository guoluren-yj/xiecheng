/**
 * index.js - 印章管理
 * @date: 2019-08-7
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  queryModalList,
  update,
  deletes,
  fetchAuthentication,
  queryAuthorizeDetail,
  queryAuthorizeList,
  saveAuthSign,
  deleteAuthSign,
  autoSignature,
  daleteSeal,
  generateSeal,
  synchronize,
  queryHistoryVersion,
  fetchLeftSealList,
  fetchRightSealList,
  fddAuthorize,
  fddCancelAuthorize,
} from '@/services/sealMangeSdatService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'sealMangeSdat',
  state: {
    enumMap: {}, // 列表CA状态值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
    // modalDataSource: [],
    // modalPagination: {},
  },
  effects: {
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: (response.content || []).map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
    },

    // -查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'SPFM.CA_STATUS',
          kind: 'HPFM.FLAG',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },

    // 查询模态框
    *queryModalList({ payload }, { call }) {
      const response = getResponse(yield call(queryModalList, payload));
      return response;
    },

    // 查询授权的子账户权限
    *queryAuthorizeList({ payload }, { call }) {
      const response = getResponse(yield call(queryAuthorizeList, payload));
      return response;
    },

    // 保存更新模态框
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },

    // 法大大同步印章的图片
    *autoSignature({ payload }, { call }) {
      const response = getResponse(yield call(autoSignature, payload));
      return response;
    },
    // 法大大删除印章的图片
    *daleteSeal({ payload }, { call }) {
      const response = getResponse(yield call(daleteSeal, payload.headerData));
      return response;
    },
    // -删除模态框
    *deletes({ payload }, { call }) {
      const response = getResponse(yield call(deletes, payload));
      return response;
    },

    // 查询认证类型
    *fetchauthentication({ payload }, { call }) {
      const response = getResponse(yield call(fetchAuthentication, payload));
      return response;
    },

    // 查询认证明细信息
    *queryAuthorizeDetail({ payload }, { call }) {
      const response = getResponse(yield call(queryAuthorizeDetail, payload));
      return response;
    },

    // 保存子账户印章授权
    *saveAuthSign({ payload }, { call }) {
      const response = getResponse(yield call(saveAuthSign, payload));
      return response;
    },

    // 删除
    *deleteLine({ payload }, { call }) {
      const response = getResponse(yield call(deleteAuthSign, payload));
      return response;
    },
    // 生成印章
    *generateSeal({ payload }, { call }) {
      const response = getResponse(yield call(generateSeal, payload));
      return response;
    },
    // 同步到系统
    *synchronize({ payload }, { call }) {
      const response = getResponse(yield call(synchronize, payload));
      return response;
    },
    // 查询印章历史版本
    *queryHistoryVersion({ payload }, { call }) {
      const response = getResponse(yield call(queryHistoryVersion, payload));
      return response;
    },
    // 查询可授权印章列表(左)
    *fetchLeftSealList({ payload }, { call }) {
      const res = getResponse(yield call(fetchLeftSealList, payload));
      return res;
    },
    // 查询已授权印章列表(右)
    *fetchRightSealList({ payload }, { call }) {
      const res = getResponse(yield call(fetchRightSealList, payload));
      return res;
    },
    // 授权印章-添加
    *fddAuthorize({ payload }, { call }) {
      const res = getResponse(yield call(fddAuthorize, payload));
      return res;
    },
    // 授权印章-删除
    *fddCancelAuthorize({ payload }, { call }) {
      const res = getResponse(yield call(fddCancelAuthorize, payload));
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
