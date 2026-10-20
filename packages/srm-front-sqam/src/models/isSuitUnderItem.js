import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchData, deleteData } from '@/services/isSuitUnderItemService.js';

export default {
  namespace: 'isSuitUnderItem',
  state: {
    isSuitUnderItemList: [], // 数据列表
    isSuitUnderItemPagination: {}, // 分页信息
    enumMap: {},
    create8DSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    audit8DSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    audit8DPubSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    rectificationSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    initiated8DSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    feedback8DSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
    received8DSuit: {
      isSuitUnderItemList: [], // 数据列表
      isSuitUnderItemPagination: {}, // 分页信息
    },
  },
  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          otherItems: 'SQAM.OTHER_PROJECT',
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
                isSuitUnderItemList: dataSource,
                isSuitUnderItemPagination: createPagination(result),
              },
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              isSuitUnderItemList: dataSource,
              isSuitUnderItemPagination: createPagination(result),
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
