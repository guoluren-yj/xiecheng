/**
 * ecAddressManage - 电商平台地址管理 - medal
 * @date: 2018-1-24
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcAddressManage,
  fetchEcAddressManageDetail,
  updateEcAddress,
  exportAddress,
  ecReginAssociation,
} from '@/services/ecAddressManageService';
import { queryIdpValue } from 'services/api';

export default {
  namespace: 'ecAddressManage',
  state: {
    list: {},
    pagination: {},
    queryCode: [],
  },
  effects: {
    // 获取值级
    *batchIdpValue(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SCEC.REGION_ASSOCIATION_STATE');
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            queryCode: list,
          },
        });
      }
    },

    // 地区定义列表
    *fetchEcAddressManage({ payload }, { call, put }) {
      const response = yield call(fetchEcAddressManage, payload);
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

    // 电商平台与京东地址关联
    *ecReginAssociation({ payload }, { call }) {
      const reponse = yield call(ecReginAssociation, payload);
      return getResponse(reponse);
    },

    // 地区定义明细
    *fetchEcAddressManageDetail({ payload }, { call, put }) {
      const response = yield call(fetchEcAddressManageDetail, payload);
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

    /**
     * 修改地区定义
     */
    *updateEcAddress({ payload }, { call }) {
      const response = yield call(updateEcAddress, payload);
      return getResponse(response);
    },

    /**
     * 从电商地址表中导入平台地址表
     */
    *exportAddress({ payload }, { call }) {
      const response = yield call(exportAddress, payload);
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
