import { getResponse, createPagination } from 'utils/utils';
import {
  deleteData,
  queryData,
  queryPurReqTypeModalData,
  saveData,
} from '@/services/authorityManagementServiceNew';

export default {
  namespace: 'authorityPrType',

  state: {
    head: {}, // 头部数据
    list: [], // 请求查询到的数据
    pagination: {}, // 分页信息
    purReqTypeDataSource: [],
    purReqTypePagination: {},
  },

  effects: {
    *fetchAuthorityPrType({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            head: data.userAuthority,
            list: data.userAuthorityLineList.content,
            pagination: createPagination(data.userAuthorityLineList),
          },
        });
      }
    },
    *addAuthorityPrType({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityPrType({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryPurReqTypeModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            purReqTypeDataSource: data.content,
            purReqTypePagination: createPagination(data),
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
  },
};
