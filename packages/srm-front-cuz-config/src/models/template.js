/**
 * template - 模板model
 * @since 2019-1-28
 * @author wangjiacheng <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  query,
  update,
  create,
  queryOneHeader,
  removeHeader,
  queryCode,
  fetchColumnList,
  fetchColumnDetail,
  deleteColumn,
  createColumn,
  updateColumn,
  fetchAssignUser,
  addAssignUser,
  deleteAssignUser,
  fetchAssignRole,
  deleteAssignRole,
  addAssignRole,
  fetchAssignTenant,
  deleteAssignTenant,
  addAssignTenant,
} from '../services/templateService';

export default {
  namespace: 'template',
  state: {
    headerList: [],
    headerData: {},
    code: {}, // 值集集合
    templateTargetList: [], // sheet 列表数据
    templateTargetPagination: {}, // sheet 列表数据分页
    pagination: {}, // 列表分页
    templateColumnDetail: {}, // 模板详情
    templateColumnList: [], // 模板列数据
    columnPagination: {}, // 模板列分页对象
    assignUserList: [], // 分配用户数据
    assignUserPagination: {}, // 分配用户分页对象
    assignRoleList: [], // 分配角色数据
    assignRolePagination: {}, // 分配角色分页对象
    assignTenantList: [], // 分配租户数据
    assignTenantPagination: {}, // 分配租户分页对象
  },
  effects: {
    *init({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const res = getResponse(yield call(queryMapIdpValue, lovCodes));
      const { typeList, sheetList } = res;
      yield put({
        type: 'setCodeReducer',
        payload: {
          'HIMP.TEMPLATE.TEMPLATETYPE': typeList,
          'HIMP.IMPORT_SHEET': sheetList,
        },
      });
    },

    // 查询通用模板列表数据
    *query({ payload }, { call, put }) {
      const res = yield call(query, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            headerList: res.content,
            pagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询分配用户数据
    *fetchAssignUser({ payload }, { call, put }) {
      const res = yield call(fetchAssignUser, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            assignUserList: res.content,
            assignUserPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询分配角色数据
    *fetchAssignRole({ payload }, { call, put }) {
      const res = yield call(fetchAssignRole, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            assignRoleList: res.content,
            assignRolePagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 查询分配租户数据
    *fetchAssignTenant({ payload }, { call, put }) {
      const res = yield call(fetchAssignTenant, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            assignTenantList: res.content,
            assignTenantPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *queryOneHeader({ payload }, { call, put }) {
      const res = yield call(queryOneHeader, payload);
      if (getResponse(res)) {
        const { templateTargetList = [] } = res;
        yield put({
          type: 'updateState',
          payload: {
            headerData: res,
            templateTargetList,
            templateTargetPagination: createPagination(templateTargetList),
          },
        });
      }
      return res;
    },

    // 更新模板头数据
    *update({ payload }, { call, put }) {
      const res = yield call(update, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            headerData: res,
          },
        });
        return res;
      }
    },

    // 创建模板头数据
    *create({ payload }, { call, put }) {
      const res = yield call(create, payload);
      if (getResponse(res)) {
        yield put({
          type: 'updateState',
          payload: {
            headerData: res,
          },
        });
        return res;
      }
    },

    *fetchColumnList({ payload }, { call, put }) {
      const res = yield getResponse(call(fetchColumnList, parseParameters(payload)));
      if (res && res.content) {
        yield put({
          type: 'updateState',
          payload: {
            templateColumnList: res.content,
            columnPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    *fetchColumnDetail({ payload }, { call, put }) {
      const res = yield getResponse(call(fetchColumnDetail, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            templateColumnDetail: res,
          },
        });
      }
      return res;
    },

    // 新增数据
    *addAssignUser({ payload }, { call }) {
      const res = yield call(addAssignUser, payload);
      return res;
    },

    // 删除数据
    *deleteAssignUser({ payload }, { call }) {
      const res = yield call(deleteAssignUser, payload);
      return res;
    },

    // 新增数据
    *addAssignRole({ payload }, { call }) {
      const res = yield call(addAssignRole, payload);
      return res;
    },

    // 删除数据
    *deleteAssignRole({ payload }, { call }) {
      const res = yield call(deleteAssignRole, payload);
      return res;
    },

    // 新增数据
    *addAssignTenant({ payload }, { call }) {
      const res = yield call(addAssignTenant, payload);
      return res;
    },

    // 删除数据
    *deleteAssignTenant({ payload }, { call }) {
      const res = yield call(deleteAssignTenant, payload);
      return res;
    },

    // 创建模板列数据
    *createColumn({ payload }, { call }) {
      const res = yield call(createColumn, payload);
      return getResponse(res);
    },

    // 更新模板列数据
    *updateColumn({ payload }, { call }) {
      const res = yield call(updateColumn, payload);
      return getResponse(res);
    },

    // 删除模板列数据
    *deleteColumn({ payload }, { call }) {
      const res = yield call(deleteColumn, payload);
      return getResponse(res);
    },

    // 删除头数据
    *removeHeader({ payload }, { call }) {
      const res = yield call(removeHeader, payload);
      return getResponse(res);
    },

    // 查询值集
    *queryCode({ payload }, { put, call }) {
      const response = yield call(queryCode, payload);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [payload.lovCode]: response,
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
  },
};
