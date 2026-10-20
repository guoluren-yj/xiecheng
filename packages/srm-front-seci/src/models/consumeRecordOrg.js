/**
 * consumeRecordOrg - 消费明细 - modal
 * @date: 2018-12-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchConsumeRecordOrg } from '@/services/consumeRecordOrgService';

export default {
  namespace: 'consumeRecordOrg',
  state: {
    /**
     * 消费明细详情数据
     */
    data: [],
    /**
     * 消费明细详情分页数据
     */
    pagination: {},
  },
  effects: {
    // 查询消费明细详情
    *fetchConsumeRecordOrg({ payload }, { call, put }) {
      const response = yield call(fetchConsumeRecordOrg, payload);
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
