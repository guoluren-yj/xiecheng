/**
 * batchStatistic - 接口批次统计 - 平台级 - model
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchBatchStatistic } from '@/services/batchStatisticService';

export default {
  namespace: 'batchStatistic',
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
      const response = yield call(fetchBatchStatistic, payload);
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
