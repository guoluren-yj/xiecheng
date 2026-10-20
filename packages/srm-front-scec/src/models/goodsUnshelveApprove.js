/**
 * GoodsManage -商品下架审批 model层
 * @date: 2019-12-9
 * @author zz <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchGoodsList, passApprove, refuseApprove } from '@/services/goodsUnshelveApproveService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'goodsUnshelveApprove',
  state: {
    list: {},
    pagination: {},
    sourceType: [],
  },
  effects: {
    // 获得值级
    *fetchBatchCodes({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        const { sourceType = [] } = list;
        yield put({
          type: 'updateState',
          payload: {
            sourceType,
          },
        });
      }
    },
    // 商品下架列表查询
    *fetchGoodsList({ payload }, { call, put }) {
      const response = yield call(fetchGoodsList, payload);
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
    // 商品审批批量通过
    *passApprove({ payload }, { call }) {
      const response = yield call(passApprove, payload);
      return getResponse(response);
    },
    // 商品审批批量拒绝
    *refuseApprove({ payload }, { call }) {
      const response = yield call(refuseApprove, payload);
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
