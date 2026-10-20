/**
 * model 投标查询
 * @date: 2019-5-18
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchOperation,
  queryExpertSubAccount,
  queryExpertLibrary,
  querySettingBatch,
} from '@/services/commonService';

export default {
  namespace: 'commonModel',
  state: {
    operationData: [], // 操作记录数据
    operationPagination: {}, // 操作记录分页
    bidHallProjectModalVisible: false, // 招标大厅寻源立项modal
    inquiryHallProjectModalVisible: false, // 寻源大厅寻源立项modal
    settings: {}, // 配置中心设置
  },
  effects: {
    *querySettingBatch({ payload }, { call, put, select }) {
      const Result = getResponse(yield call(querySettingBatch, payload));
      if (Result) {
        const prevSettings = yield select((state) => state.commonModel.settings) || {};
        yield put({
          type: 'updateState',
          payload: {
            settings: { ...prevSettings, ...Result },
          },
        });
      }
      return Result;
    },
    // 操作记录
    *operationRecord({ payload }, { call, put }) {
      let result = yield call(fetchOperation, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationData: result.content,
            operationPagination: createPagination(result),
          },
        });
      }
    },
    // 查询专家子账户列表_来源专家库, 通用接口
    *fetchQueryExpertLibrary({ payload }, { call }) {
      return getResponse(yield call(queryExpertLibrary, payload));
    },
    // 查询专家子账户列表_来源专家子账户, 通用接口
    *fetchQueryExpertSubAccount({ payload }, { call }) {
      return getResponse(yield call(queryExpertSubAccount, payload));
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
