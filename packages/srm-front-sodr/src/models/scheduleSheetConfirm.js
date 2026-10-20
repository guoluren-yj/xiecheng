/*
 * planSheet - 计划单创建
 * @date: 2019/12/11 11:49:14
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryPlanReleaseList,
  surePlan,
  feedBackPlan,
  fetchSettings,
  fetchAsnNums,
  feedBackSurePlan,
} from '@/services/scheduleSheetService';
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

function replaceArr(arr = [], targetArr = []) {
  if (targetArr.length) {
    const result = arr.map((i) => {
      const cache = targetArr.find((j) => j.planId === i.planId);
      return cache ? { ...i, ...cache, serialNum: i.serialNum } : { ...i };
    });
    return result;
  }
  return arr;
}

export default {
  namespace: 'scheduleSheetConfirm',

  state: {
    enumMap: {}, // 值集
    planCycle: [], // 计划周期
    cacheSelected: [], // 缓存选中
    planCreateList: [], // 计划创建列表
    planCreateListPagination: {}, // 计划创建分页
    planUpdateList: [], // 计划维护列表
    planDataSource: [], // 变更数据源
    planUpdateListPagination: {}, // 计划维护分页
    planDetailHeader: {}, // 计划明细头
    planDetailList: [], // 计划明细行
    planDetailListPagination: {}, // 计划明细行分页
    asnNumsPagination: {}, // 关联送货单分页
    asnNumsDataSource: [], // 关联送货单列表
  },

  effects: {
    // 初始化值集查询
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          orderSource: 'SPRM.SRC_PLATFORM',
          planStatus: 'SSPL.PLAN_STATUS',
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
            planCycle: res.planCycle,
          },
        });
      }
    },
    // 查询配置中心
    *fetchSettings(params, { call }) {
      const result = getResponse(yield call(fetchSettings));
      return result;
    },
    // 查询计划单确认列表
    *queryPlanReleaseList({ payload }, { call, put }) {
      const { selectedUpdateRows, ...params } = payload;
      const result = getResponse(yield call(queryPlanReleaseList, params));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planUpdateList: replaceArr(dealDataState(result.content), selectedUpdateRows),
            planUpdateListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询计划单确认列表(count)
    *queryPlanReleaseListPage({ payload }, { call, put }) {
      const { selectedUpdateRows, ...params } = payload;
      const result = getResponse(
        yield call(queryPlanReleaseList, { ...params, onlyCountFlag: 'Y' })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            planUpdateListPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 确认计划单
    *surePlan({ payload }, { call }) {
      const res = yield call(surePlan, payload);
      return getResponse(res);
    },
    // 反馈计划单
    *feedBackPlan({ payload }, { call }) {
      const res = yield call(feedBackPlan, payload);
      return getResponse(res);
    },
    // 送货单列表
    *operationAsnNums({ payload }, { call, put }) {
      let result = yield call(fetchAsnNums, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            asnNumsDataSource: result.content,
            asnNumsPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 反馈/确认计划单
    *feedBackSurePlan({ payload }, { call }) {
      const res = yield call(feedBackSurePlan, payload);
      return getResponse(res);
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
