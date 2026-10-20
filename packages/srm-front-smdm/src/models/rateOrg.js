/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2023-06-02 16:38:09
 * @LastEditors: yanglin
 * @LastEditTime: 2023-09-21 16:10:48
 */
/**
 * model 汇率定义
 * @date: 2018-7-2
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { fetchRateTenantData, createRateTenant, updateRateTenant } from '@/services/rateOrgService';
import { queryIdpValue } from 'services/api';

export const service = {
  async init() {
    return queryIdpValue('SMDM.EXCHANGE_RATE_METHOD');
  },
};

export default {
  namespace: 'rateOrg',

  state: {
    modalVisible: false,
    rateMethodList: [],
    rateList: [],
    pagination: {}, // 分页对象
    enabledList: [], // 是否启用列表
  },

  effects: {
    // 获取初始化数据
    *init({ payload }, { call, put }) {
      const data = getResponse(yield call(queryIdpValue, 'HPFM.ENABLED_FLAG'));
      const res = yield call(service.init, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            enabledList: data,
            rateMethodList: list,
          },
        });
      }
    },
    // 获取汇率定义信息
    *fetchRateData({ payload }, { call, put }) {
      const res = yield call(fetchRateTenantData, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            rateList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 新建汇率定义
    *createRate({ payload }, { call }) {
      const res = yield call(createRateTenant, payload);
      return getResponse(res);
    },
    // 更新汇率定义
    *updateRate({ payload }, { call }) {
      const res = yield call(updateRateTenant, payload);
      return getResponse(res);
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
