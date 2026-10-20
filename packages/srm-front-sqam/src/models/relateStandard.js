import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchData, deleteData } from '@/services/relateStandardService.js';

export default {
  namespace: 'relateStandard',
  state: {
    relateStandardList: [], // 数据列表
    relateStandardPagination: {}, // 分页信息
    enumMap: {},
    create8DStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    audit8DStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    audit8DPubStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    rectificationStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    initiated8DStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    feedback8DStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
    received8DStandard: {
      relateStandardList: [], // 数据列表
      relateStandardPagination: {}, // 分页信息
    },
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          standardItems: 'SQAM.PROBLEM_STANDARD_PROJECT',
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
                relateStandardList: dataSource,
                relateStandardPagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              relateStandardList: dataSource,
              relateStandardPagination: createPagination(result),
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
