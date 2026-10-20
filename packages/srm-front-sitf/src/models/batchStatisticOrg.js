/**
 * batchStatisticOrg - 接口批次统计 - 租户级 - model
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchBatchStatisticOrg } from '@/services/batchStatisticService';

export default {
  namespace: 'batchStatisticOrg',
  state: {
    /**
     * 接口查询的查询条件
     */
    queryData: {},
    /**
     * 应用配置数据
     */
    data: {
      list: [],
    },
  },
  effects: {
    *fetchBatchStatistic({ payload }, { call, put }) {
      const response = yield call(fetchBatchStatisticOrg, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
            },
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
