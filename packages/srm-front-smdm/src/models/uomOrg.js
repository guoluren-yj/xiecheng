/**
 * model 租户级单位定义
 * @date: 2018-7-9
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { search, save, fetchRefUom } from '@/services/uomOrgService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'uomOrg',
  state: {
    list: [],
    pagination: {},
  },
  effects: {
    *fetchUomData({ payload }, { call, put }) {
      const result = getResponse(yield call(search, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 引用云级数据
    *fetchRefUom({ payload }, { call }) {
      const result = yield call(fetchRefUom, payload);
      return getResponse(result);
    },
    // 新增计量单位
    *addUomData({ payload }, { call }) {
      const result = yield call(save, payload);
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
