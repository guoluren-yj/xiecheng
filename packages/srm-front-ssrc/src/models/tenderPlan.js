/**
 * tenderPlan - 招标计划 - model
 * @date: 2019-4-16
 * @author YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchTenderPlansList,
  queryPlanUpdate,
  fetchPlanUpdate,
  savePlanUpdate,
  submitPlanUpdate,
  deletePlanUpdate,
  cancelPlanUpdate,
  fetchPlanUpdateLine,
  revokeCancelPlanUpdate,
  fetchProjectInfo,
  fetchProjectInfoDetail,
  fetchProjectLineInfo,
  saveProjectInfoDetail,
  submitProjectInfoDetail,
  deleteProjectInfoDetail,
  fetchPurAgentLovData,
  deleteLine,
} from '@/services/tenderPlanService';
import { queryIdpValue, queryMapIdpValue } from 'services/api'; // 查询单个值集

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
  namespace: 'tenderPlan',
  state: {
    planQueryList: [], // 招标计划查询列表
    planQueryPagination: {}, // 招标计划列表分页
    sourceTypeCode: [], // 寻源方式值集
    planUpdateList: [], // 招标维护列表信息
    planUpdatePagination: [], // 招标维护列表分页
    planUpdateHeader: {}, // 招标维护明细头信息
    planUpdateTable: [], // 招标维护明细列表信息
    purAgentList: {}, // 项目采购负责人列表
    purAgentPagination: {}, // 项目采购分页
    fundsSourceCodeList: [], // 资金来源值集
    projectInfoList: [], // 项目信息查询列表
    projectInfoPagination: {}, // 项目信息查询分页
    projectInfo: {},
    projectLineInfo: [], // 项目信息行列表
    projectLinePage: {}, // 项目信息行列表分页
    projectStatusList: [], // 查询状态字段值集
  },
  effects: {
    // 招标计划列表查询
    *fetchPlansQueryList({ payload }, { call, put }) {
      const response = yield call(fetchTenderPlansList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            planQueryList: list.content,
            planQueryPagination: createPagination(list),
          },
        });
      }
    },
    // 获得寻源值级
    *batchSourceCode({ payload }, { call, put }) {
      const response = yield call(queryIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            sourceTypeCode: list,
          },
        });
      }
    },
    *fetchTotalCountAsync({ options }, { call, put }) {
      const { payload, needCountFlag, pageStateName, queryRequest } = options || {};
      if (!payload || needCountFlag !== 'Y') return;
      const response = yield call(queryRequest, { ...payload, onlyCountFlag: 'Y' });
      const result = getResponse(response);
      if (!result) return;
      yield put({
        type: 'updateState',
        payload: {
          [pageStateName]: createPagination(result),
        },
      });
    },
    // 招标维护列表查询
    *queryPlanUpdate({ payload }, { call, put }) {
      const response = yield call(queryPlanUpdate, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        const { needCountFlag } = data;
        yield put({
          type: 'updateState',
          payload: {
            planUpdateList: data.content,
            planUpdatePagination: createPagination(data),
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            queryRequest: queryPlanUpdate,
            pageStateName: 'planUpdatePagination',
          },
        });
      }
    },
    // 招标维护明细查询
    *fetchPlanUpdate({ payload }, { call, put }) {
      const response = yield call(fetchPlanUpdate, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            planUpdateHeader: data,
          },
        });
      }
    },
    *fetchPlanUpdateLine({ payload }, { call, put }) {
      const response = yield call(fetchPlanUpdateLine, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            planUpdateTable: dealDataState(data),
          },
        });
      }
    },
    // 保存 - 招标维护
    *savePlanUpdate({ payload }, { call }) {
      const data = getResponse(yield call(savePlanUpdate, payload));
      return data;
    },
    // 提交 - 招标维护
    *submitPlanUpdate({ payload }, { call }) {
      const data = getResponse(yield call(submitPlanUpdate, payload));
      return data;
    },
    // 删除 - 招标维护表格行
    *deletePlanUpdate({ payload }, { call }) {
      const data = getResponse(yield call(deletePlanUpdate, payload));
      return data;
    },
    // 取消 - 招标维护表格行
    *revokeCancelPlanUpdate({ payload }, { call }) {
      const data = getResponse(yield call(revokeCancelPlanUpdate, payload));
      return data;
    },
    // 取消 - 招标维护表格行
    *cancelPlanUpdate({ payload }, { call }) {
      const data = getResponse(yield call(cancelPlanUpdate, payload));
      return data;
    },
    // 查询资金来源值集
    *queryValueCode(_, { call, put }) {
      const code = getResponse(yield call(queryIdpValue, 'SSRC.FUNDS_SOURCE'));
      if (code) {
        yield put({
          type: 'updateState',
          payload: {
            fundsSourceCodeList: code,
          },
        });
      }
    },
    *fetchPurAgentLovData({ payload }, { call, put }) {
      const list = yield call(fetchPurAgentLovData, payload);
      yield put({
        type: 'updateState',
        payload: {
          purAgentList: list,
          purAgentPagination: createPagination(list),
        },
      });
    },
    // 查询项目维护信息
    *fetchProjectInfo({ payload }, { call, put }) {
      const response = yield call(fetchProjectInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            projectInfoList: data.content,
            projectInfoPagination: createPagination(data),
          },
        });
      }
    },
    // 查询项目维护信息 - 明细
    *fetchProjectInfoDetail({ payload }, { call, put }) {
      const response = yield call(fetchProjectInfoDetail, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            projectInfo: data,
          },
        });
      }
    },
    // 查询项目维护信息 - 明细
    *fetchProjectLineInfo({ payload }, { call, put }) {
      const response = yield call(fetchProjectLineInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            projectLineInfo: dealDataState(data.content),
            projectLinePage: createPagination(data),
          },
        });
      }
    },
    // 保存项目信息
    *saveProjectInfoDetail({ payload }, { call }) {
      const response = yield call(saveProjectInfoDetail, payload);
      return getResponse(response);
    },
    // 提交项目信息
    *submitProjectInfoDetail({ payload }, { call }) {
      const response = yield call(submitProjectInfoDetail, payload);
      return getResponse(response);
    },
    // 删除项目信息
    *deleteProjectInfoDetail({ payload }, { call }) {
      const response = yield call(deleteProjectInfoDetail, payload);
      return getResponse(response);
    },
    // 删除项目信息-明细行
    *deleteLine({ payload }, { call }) {
      const response = yield call(deleteLine, payload);
      return getResponse(response);
    },
    // 查询多个值集
    *fetchSelectList(_, { call, put }) {
      const payload = getResponse(
        yield call(queryMapIdpValue, {
          projectStatusList: 'SSRC.PROJECT_STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload,
      });
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
