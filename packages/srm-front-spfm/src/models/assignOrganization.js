/**
 * assignOrganization 分配采购组织
 * @date: 2019-11-22
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import {
  fetchPurOrganization,
  deletePurOrganization,
  fetchPurOrganizationLov,
  addPurOrganization,
  setDefaultPurOrganization,
} from '@/services/assignOrganizationService';
import { getResponse, createPagination } from 'utils/utils';

export default {
  namespace: 'assignOrganization',

  state: {
    purOrganizationList: [], // 分配采购组织
    purOrgPagination: {}, // 分配采购组织分页
    purOrganizationLovList: [],
    purOrgLovPagination: {},
  },

  effects: {
    // 获取分配采购组织
    *fetchPurOrganization({ payload }, { call, put }) {
      const res = yield call(fetchPurOrganization, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            purOrganizationList: response.content,
            purOrgPagination: createPagination(response),
          },
        });
      }
    },
    // 分配采购组织删除
    *deletePurOrganization({ payload }, { call }) {
      const res = getResponse(yield call(deletePurOrganization, payload));
      return res;
    },
    // 采购组织lov查询
    *fetchPurOrganizationLov({ payload }, { call, put }) {
      const res = yield call(fetchPurOrganizationLov, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            purOrganizationLovList: response.content,
            purOrgLovPagination: createPagination(response),
          },
        });
      }
    },
    // 分配采购组织新增
    *addPurOrganization({ payload }, { call }) {
      const res = getResponse(yield call(addPurOrganization, payload));
      return res;
    },
    // 设置默认的采购组织
    *setDefaultPurOrganization({ payload }, { call }) {
      const res = getResponse(yield call(setDefaultPurOrganization, payload));
      return res;
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
