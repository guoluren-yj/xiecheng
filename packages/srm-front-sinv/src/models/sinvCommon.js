/*
 * sinvCommon - 公用model
 * @date: 2019-08-20 19:02
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchOperationRecordList,
  fetchLogistics,
  handleRefreshLogistics,
  fetchLeadTypeList,
  againLeadTypeList,
} from '@/services/sinvCommonService';

export default {
  namespace: 'sinvCommon',

  state: {},
  effects: {
    // 获取操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const { asnHeaderId, ...otherParams } = payload;
      const result = getResponse(yield call(fetchOperationRecordList, asnHeaderId, otherParams));
      return result;
    },
    // 查询物流详情
    *fetchLogistics({ payload }, { call }) {
      const result = getResponse(yield call(fetchLogistics, payload));
      return result;
    },
    // 刷新物流
    *handleRefreshLogistics({ payload }, { call }) {
      const result = yield call(handleRefreshLogistics, payload);
      return result;
    },

    // 导入类型查询
    *fetchLeadTypeList({ payload }, { call }) {
      const { asnLineId, ...otherParams } = payload;
      const result = getResponse(yield call(fetchLeadTypeList, asnLineId, otherParams));
      return result;
    },

    // 导入类型重新同步
    *againLeadTypeList({ payload }, { call }) {
      const result = getResponse(yield call(againLeadTypeList, payload));
      return result;
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
