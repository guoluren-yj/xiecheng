import { getResponse, createPagination } from 'utils/utils';
import {
  deleteData,
  queryData,
  queryQualityLovModalData,
  saveData,
} from '@/services/authorityManagementServiceNew';

export default {
  namespace: 'authorityQualityRectification',

  state: {
    head: {}, // 头部数据
    list: [], // 请求查询到的数据
    pagination: {}, // 分页信息
    purReqTypeDataSource: [],
    purReqTypePagination: {},
  },

  effects: {
    *fetchAuthorityQuality({ payload }, { call, put }) {
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
    *addAuthorityQuality({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityQuality({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryQualityLovModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            purReqTypeDataSource: data.content?.map((item) => {
              return {
                ...item,
                dataId: item.lovValueId,
                dataName: item.meaning,
              };
            }),
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
