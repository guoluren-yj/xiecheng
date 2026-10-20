import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchData, deleteData } from '@/services/promiseMaintainProvideService';

export default {
  namespace: 'promiseMaintainProvide',
  state: {
    promiseMaintainProvideList: [], // 数据列表
    promiseMaintainProvidePagination: {}, // 分页信息
    enumMap: {},
    create8DProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    audit8DProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    audit8DPubProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    rectificationProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    initiated8DProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    feedback8DProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
    received8DProvide: {
      promiseMaintainProvideList: [], // 数据列表
      promiseMaintainProvidePagination: {}, // 分页信息
    },
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          inventoryDistributes: 'SQAM.PROBLEM_INVENTORY_DISTRIBUTION',
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
                promiseMaintainProvideList: dataSource,
                promiseMaintainProvidePagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              promiseMaintainProvideList: dataSource,
              promiseMaintainProvidePagination: createPagination(result),
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
