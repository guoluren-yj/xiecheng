/*
 * planSheet - 计划单创建
 * @date: 2019/12/11 11:49:14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryPlanCreateList,
  queryPlanUpdateList,
  queryPlanDetailHeader,
  queryPlanDetailLine,
  createPlan,
  savePlan,
  deletePlan,
  deleteDetailPlan,
  releasePlan,
  releaseDetailPlan,
  fetchOperation,
} from '@/services/planSheetService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'planSheet',

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
    radioTab: 'list',
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
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    // 查询计划周期独立值集
    *batchCode(params, { call, put }) {
      const res = getResponse(
        yield call(queryMapIdpValue, {
          planCycle: 'SSCH.PLAN_CYCLE',
        })
      );
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            planCycle: res.planCycle || [],
          },
        });
      }
    },

    // 查询计划创建列表
    *queryPlanCreateList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryPlanCreateList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planCreateList: dealDataState(result.content),
            planCreateListPagination: createPagination(result),
          },
        });
      }
    },

    // 查询计划维护列表
    *queryPlanUpdateList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryPlanUpdateList, payload));
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

    // 创建计划单
    *createPlan({ payload }, { call }) {
      const res = yield call(createPlan, payload);
      return getResponse(res);
    },

    // 修改/保存计划单
    *savePlan({ payload }, { call }) {
      const res = yield call(savePlan, payload);
      return getResponse(res);
    },

    // 发布计划单
    *releasePlan({ payload }, { call }) {
      const res = yield call(releasePlan, payload);
      return getResponse(res);
    },
    // 发布计划单
    *releaseDetailPlan({ payload }, { call }) {
      const res = yield call(releaseDetailPlan, payload);
      return getResponse(res);
    },
    // 删除详情计划单
    *deleteDetailPlan({ payload }, { call }) {
      const res = yield call(deleteDetailPlan, payload);
      return getResponse(res);
    },
    // 删除计划单
    *deletePlan({ payload }, { call }) {
      const res = yield call(deletePlan, payload);
      return getResponse(res);
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
