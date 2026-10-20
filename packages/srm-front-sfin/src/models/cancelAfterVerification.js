/**
 * 创建预付款申请
 * @date: 2020-03-09
 * @author zuoxiangyu <xiangyu.zuog@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse } from 'utils/utils';
import { queryHeaderList } from '@/services/cancelAfterVerificationServices';

export default {
  namespace: 'cancelAfterVerification',
  state: {
    listQuery: {},
  },
  effects: {
    *queryHeaderList({ payload }, { call }) {
      const res = getResponse(yield call(queryHeaderList, payload));
      return res;
    },
    // // 预付款申请明细页面-查询明细行
    // *fetchAdvanceLine({ payload }, { call }) {
    //   const InvoiceLine = getResponse(yield call(fetchAdvanceLine, payload));
    //   return InvoiceLine;
    // },
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
