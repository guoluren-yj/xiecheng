/* eslint-disable no-param-reassign */
/**
 * model 我的参与流程
 * @date: 2018-8-14
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';

import { getResponse, createPagination } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import {
  fetchTaskList,
  searchDetail,
  fetchForecast,
  taskRecall,
  taskRevoke,
  taskRemind,
  beforeTaskRemind,
  fetchHistoryApproval,
  getForecastLists,
} from '../services/startByTaskService';
import { queryPreviousInfo } from '../services/taskService';

export default {
  namespace: 'startByTask',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    processStatus: [], // 流程状态

    detail: {}, // 明细
    forecast: [], // 流程图数据
    uselessParam: 'init', // 确保获取最新流程图的参数
    approvalActionTooltipMap: {}, // 操作按钮气泡提示
  },
  effects: {
    // 查询流程状态
    *queryProcessStatus(_, { call, put }) {
      const processStatus = getResponse(yield call(queryIdpValue, 'HWFP.PROCESS_APPROVE_STATUS'));
      yield put({
        type: 'updateState',
        payload: { processStatus },
      });
    },

    *fetchTaskList({ payload }, { call, put }) {
      let result = yield call(fetchTaskList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content || [],
            pagination: createPagination(result),
          },
        });
      }
      if (result.needCountFlag === 'Y') {
        const resForCount = yield call(fetchTaskList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(pageCount),
          },
        });
      }
      return result;
    },

    *fetchDetail({ payload }, { call, put }) {
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateDetailState',
          payload: {
            processInstanceId: payload.processInstanceId,
            detail: result,
            uselessParam: uuid(),
          },
        });
      }
      return result;
    },

    *fetchForecast({ payload }, { call, put }) {
      let result = yield call(fetchForecast, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateDetailState',
          payload: {
            processInstanceId: payload.processInstanceId,
            forecast: result,
          },
        });
      }
      return result;
    },

    // 撤回
    *taskRecall({ payload }, { call }) {
      const res = yield call(taskRecall, payload);
      return getResponse(res);
    },

    // 撤销
    *taskRevoke({ payload }, { call }) {
      const res = yield call(taskRevoke, payload);
      return getResponse(res);
    },

    // 催办前的校验
    *beforeTaskRemind({ payload }, { call }) {
      const res = yield call(beforeTaskRemind, payload);
      return res;
    },

    // 催办
    *taskRemind({ payload }, { call }) {
      const res = yield call(taskRemind, payload);
      return res;
    },

    // 查询审批历史记录
    *fetchHistoryApproval({ params }, { call }) {
      const res = yield call(fetchHistoryApproval, params);
      return getResponse(res);
    },

    // 获取预测审批记录数据
    *getForecastLists({ payload }, { call }) {
      const res = yield call(getForecastLists, payload);
      return getResponse(res);
    },
    *queryPreviousInfo({ payload }, { call, select, put }) {
      const res = yield call(queryPreviousInfo, payload);
      if (getResponse(res)) {
        const previousNodeMap = {};
        res.forEach((node) => {
          if (node.procInstId) {
            previousNodeMap[node.procInstId] = node;
          }
        });
        const list = yield select((state) => state.startByTask.list);
        const newList = (list || []).map((item) => {
          const processInstanceId = item.procInstId;
          if (processInstanceId && previousNodeMap[processInstanceId]) {
            const { previousNodeName, previousApprover, previousComment } = previousNodeMap[
              processInstanceId
            ];
            item.previousNodeName = previousNodeName;
            item.previousApprover = previousApprover;
            item.previousComment = previousComment;
          }
          return item;
        });
        yield put({
          type: 'updateState',
          payload: {
            list: newList,
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
    updateDetailState(state, { payload }) {
      const processInstanceId = payload.processInstanceId
        ? payload.processInstanceId
        : state.processInstanceId;
      const object = {
        [processInstanceId]: {
          detail: {},
          forecast: [],
          changeEmployee: [],
          uselessParam: payload.uselessParam || 'init',
          ...state[processInstanceId],
          ...payload,
        },
      };
      return {
        ...state,
        ...object,
        processInstanceId,
      };
    },
  },
};
