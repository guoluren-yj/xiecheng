/**
 * consumeRecord - 产品使用详情 - modal
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchConsumeRecord } from '@/services/consumeRecordService';

export default {
  namespace: 'consumeRecord',
  state: {
    /**
     * 产品使用详情数据
     */
    data: [],
    /**
     * 产品使用详情分页数据
     */
    pagination: {},
  },
  effects: {
    // 查询产品使用详情
    *fetchConsumeRecord({ payload }, { call, put }) {
      const response = yield call(fetchConsumeRecord, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: data.content,
            pagination: createPagination(data),
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
