import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchData, deleteData } from '@/services/rootReasonAnalyzeService.js';

export default {
  namespace: 'rootReasonAnalyze',
  state: {
    rootReasonAnalyzeList: [], // 数据列表
    rootReasonAnalyzePagination: {}, // 分页信息
    enumMap: {},
    create8DReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    audit8DReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    audit8DPubReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    rectificationReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    initiated8DReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    feedback8DReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
    received8DReason: {
      rootReasonAnalyzeList: [], // 数据列表
      rootReasonAnalyzePagination: {}, // 分页信息
    },
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          reasonType: 'SQAM.ROOT_CAUSE_TYPE',
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
                rootReasonAnalyzeList: dataSource,
                rootReasonAnalyzePagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              rootReasonAnalyzeList: dataSource,
              rootReasonAnalyzePagination: createPagination(result),
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
