import { createPagination, getResponse } from 'utils/utils';
import { fetchData, deleteData } from '@/services/followUpProduceService.js';

export default {
  namespace: 'followUpProduce',
  state: {
    followUpProduceList: [], // 数据列表
    followUpProducePagination: {}, // 分页信息
    create8DFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    audit8DFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    audit8DPubFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    rectificationFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    initiated8DFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    feedback8DFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
    },
    received8DFollowUp: {
      followUpProduceList: [], // 数据列表
      followUpProducePagination: {}, // 分页信息
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
                followUpProduceList: dataSource,
                followUpProducePagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              followUpProduceList: dataSource,
              followUpProducePagination: createPagination(result),
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
