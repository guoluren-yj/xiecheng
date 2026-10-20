/*
 * planSheet - 计划单创建
 * @date: 2019/12/11 11:49:14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { fetchOperation } from '@/services/scheduleSheetCommonService';

export default {
  namespace: 'scheduleSheetCommon',
  state: {},
  effects: {
    // 操作记录
    *operationRecord({ payload }, { call }) {
      let result = yield call(fetchOperation, payload);
      result = getResponse(result);
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
