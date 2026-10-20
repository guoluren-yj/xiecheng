/**
 * supplierCreditInfo - 认证信息展示 - model
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryCreditInfo } from '@/services/creditInfoService';

export default {
  namespace: 'supplierCreditInfo',
  state: {
    informationData: {},
    changeRecordData: [],
    shareholderData: [],
    abnormalItemData: [],
  },
  effects: {
    /**
     * 查询产品定义数据
     */
    *fetchCreditInfo({ payload }, { call, put }) {
      const response = yield call(queryCreditInfo, payload);
      const res = getResponse(response);
      if (res) {
        const { data = {} } = res;
        const resData = data || {};
        yield put({
          type: 'updateState',
          payload: {
            informationData: resData,
            changeRecordData: resData.epChangeRecords || [],
            shareholderData: resData.epShareholders || [],
            abnormalItemData: resData.epAbnormalItems || [],
          },
        });
      }
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
