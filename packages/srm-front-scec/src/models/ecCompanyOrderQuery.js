/**
 * ecCompanyOrderQuery -订单查询
 * @date: 2019-08-27
 * @author  <xia.li05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchCompanyBannerList } from '@/services/ecCompanyOrderQueryService';

export default {
  namespace: 'ecCompanyOrderQuery',
  state: {
    dataSource: [],
    pagination: {},
  },
  effects: {
    // 查询数据
    *findAllQuery(action, { put, call }) {
      const res = yield call(fetchCompanyBannerList, action.payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: result.content || [],
            pagination: createPagination(result),
          },
        });
      }
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
