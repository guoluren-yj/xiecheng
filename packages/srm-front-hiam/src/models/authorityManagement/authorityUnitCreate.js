import { getResponse, createPagination } from 'utils/utils';
import {
  queryCreateUnit,
  queryData,
  saveData,
  deleteData,
  updateAuthorityCreateUnit,
  queryUnitModalData,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityUnitCreate',

  state: {
    head: {},
    list: [],
    pagination: {},
    unitDataSource: [],
    unitPagination: {},
  },
  effects: {
    *fetchHeader({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            header: data.userAuthority,
          },
        });
      }
    },
    *fetchAuthorityUnit({ payload }, { call, put }) {
      const response = yield call(queryCreateUnit, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryData',
          payload: data,
        });
      }
    },
    *addAuthorityUnit({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityUnit({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *updateAuthorityUnit({ payload }, { call, put }) {
      const response = yield call(updateAuthorityCreateUnit, payload);
      yield put({
        type: 'updateCheckList',
        payload: { initCheckList: payload.checkList || [], checkList: payload.checkList || [] },
      });
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryUnitModalData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            unitDataSource: data.content,
            unitPagination: createPagination(data),
          },
        });
      }
    },
    *fetchAuthorityUnitAndExpand({ payload }, { call, put }) {
      const { dataCode, dataName, unitCompanyId } = payload || {};
      const response = yield call(queryCreateUnit, payload);
      const data = getResponse(response);
      if (data) {
        const expandedRowKeys = data.originList && data.originList.map((list) => list.dataId);
        yield put({
          type: 'queryData',
          payload: { ...data, initFlag: dataCode || dataName || unitCompanyId ? 0 : 1 },
        });
        yield put({
          type: 'updateExpanded',
          payload: expandedRowKeys,
        });
      }
    },
  },
  reducers: {
    queryData(state, action) {
      return {
        ...state,
        initCheckList:
          action.payload.initFlag === 1
            ? action.payload.originList.filter((list) => list.checkedFlag === 1)
            : state.initCheckList,
        data: action.payload.treeList,
        checkList: action.payload.originList.filter((list) => list.checkedFlag === 1),
        originList: action.payload.originList,
      };
    },
    updateCheckList(state, action) {
      return {
        ...state,
        initCheckList: action.payload.initCheckList || state.initCheckList,
        checkList: action.payload.checkList,
      };
    },
    updateExpanded(state, action) {
      return {
        ...state,
        expandedRowKeys: action.payload,
      };
    },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
