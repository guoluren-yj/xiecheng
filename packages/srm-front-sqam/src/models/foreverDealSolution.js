import { createPagination, getResponse } from 'utils/utils';
import { fetchData, deleteData } from '@/services/foreverDealSolutionService.js';

export default {
  namespace: 'foreverDealSolution',
  state: {
    foreverDealSolutionList: [], // 数据列表
    foreverDealSolutionPagination: {}, // 分页信息
    create8DSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    audit8DSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    audit8DPubSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    rectificationSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    initiated8DSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    feedback8DSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
    received8DSolution: {
      foreverDealSolutionList: [], // 数据列表
      foreverDealSolutionPagination: {}, // 分页信息
    },
  },
  effects: {
    *deleteData({ payload }, { call }) {
      const res = getResponse(yield call(deleteData, payload));
      return res;
    },

    *fetchData({ payload }, { call, put }) {
      const data = payload;
      const { stateKey } = data;
      delete data.stateKey;
      const result = getResponse(yield call(fetchData, data));
      if (result) {
        let dataSource = [];
        if (result.content.length > 0) {
          dataSource = result.content.map((item) => {
            return {
              ...item,
              _status: 'update',
            };
          });
        }
        if (stateKey) {
          yield put({
            type: 'updateState',
            payload: {
              [stateKey]: {
                foreverDealSolutionList: dataSource,
                foreverDealSolutionPagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              foreverDealSolutionList: dataSource,
              foreverDealSolutionPagination: createPagination(result),
            },
          });
        }
      }
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
