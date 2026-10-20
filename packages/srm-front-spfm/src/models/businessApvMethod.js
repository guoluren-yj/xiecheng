/**
 * model 企业审批方式
 * @date: 2018-7-30
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { search, update } from '@/services/businessApvMethodService';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'businessApvMethod',
  state: {
    list: [],
    pagination: {},
    methodList: [], // 审批方式
  },
  effects: {
    // 获取业务审批列表
    *fetchBusinessData({ payload }, { call, put }) {
      let result = yield call(search, payload);
      const methodList = yield call(queryIdpValue, 'SPFM.BUSINESS_APV_METHOD');
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
            methodList,
          },
        });
      }
    },
    *updateBusinessData({ payload }, { call }) {
      const { tenantId, data } = payload;
      const result = yield call(update, { tenantId, data });
      return getResponse(result);
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
