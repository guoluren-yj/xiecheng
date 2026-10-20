/*
 * planSheet - 我发出的计划单
 * @date: 2019/12/11 11:49:14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryPlanDetailHeader,
  queryPlanDetailLine,
  fetchOperation,
  queryMyPlanUpdateList,
} from '@/services/planSheetService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'myPlanSheet',

  state: {
    enumMap: {}, // 值集
    planCycle: [], // 计划周期
    planCreateList: [], // 计划创建列表
    planCreateListPagination: {}, // 计划创建分页
    planUpdateList: [], // 计划维护列表
    planDataSource: [], // 变更数据源
    planUpdateListPagination: {}, // 计划维护分页
    planDetailHeader: {}, // 计划明细头
    planDetailList: [], // 计划明细行
    planDetailListPagination: {}, // 计划明细行分页
  },

  effects: {
    // 初始化值集查询
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          orderSource: 'SPRM.SRC_PLATFORM',
          planStatus: 'SSCH.PLAN_STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || [],
        },
      });
    },

    // 查询计划周期独立值集
    *batchCode(params, { call, put }) {
      const res = getResponse(
        yield call(queryMapIdpValue, {
          planCycle: 'SSCH.PLAN_CYCLE',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          planCycle: res.planCycle || [],
        },
      });
    },
    // 我发出的计划单列表
    *queryMyPlanUpdateList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryMyPlanUpdateList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planUpdateList: result.content,
            planUpdateListPagination: createPagination(result),
          },
        });
      }
    },

    // 查询计划单明细头
    *queryPlanDetailHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(queryPlanDetailHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planDetailHeader: result,
          },
        });
      }
      return result;
    },

    // 查询计划单明细行
    *queryPlanDetailLine({ payload }, { call, put }) {
      const result = getResponse(yield call(queryPlanDetailLine, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planDetailList: dealDataState(result.content),
            planDetailListPagination: createPagination(result),
          },
        });
      }
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
