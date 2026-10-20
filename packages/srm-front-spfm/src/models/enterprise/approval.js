import { createPagination, getResponse } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import uuidv4 from 'uuid/v4';
import { isEmpty } from 'lodash';
import {
  queryList,
  queryTenantList,
  queryDetail,
  approve,
  reject,
  queryRecord,
  queryTenantRecord,
  certificationBusiness,
  fetchSettings,
  queryCompanyInfo,
} from '@/services/approvalService';
import { queryMapIdpValue } from 'services/api';

const tableState = {
  dataSource: [],
  pagination: {
    // pageSize: 10,
    // total: 0,
    // current: 1,
  },
  selectedRows: [],
};

export default {
  namespace: 'certificationApproval',
  state: {
    list: {
      ...tableState,
    },
    detail: {},
    record: [],
    approvalMethod: [], // 审批方式
    source: {}, // form值集
  },
  effects: {
    // 统一获取值级的数据
    *batchCode({ payload }, { put, call }) {
      const { lovCodes } = payload;
      const source = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(source)) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            source,
          },
        });
      }
    },
    // 查询邀约状态值集
    *queryIdpValue(_, { call, put }) {
      const approvalMethodRes = yield call(queryIdpValue, 'HPFM.DOMESTIC_FOREIGN');
      const approvalMethod = getResponse(approvalMethodRes);
      yield put({
        type: 'updateStateReducer',
        payload: {
          approvalMethod,
        },
      });
    },
    *queryList({ payload }, { put, call }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        const { content = [] } = response || {};
        yield put({
          type: 'updateListReducer',
          payload: {
            dataSource: content,
            pagination: createPagination(response),
          },
        });
      }
    },
    *queryTenantList({ payload }, { put, call }) {
      const res = yield call(queryTenantList, payload);
      const response = getResponse(res);
      if (response) {
        const { content = [], needCountFlag } = response || {};
        yield put({
          type: 'updateListReducer',
          payload: {
            dataSource: content,
            pagination: createPagination(response),
          },
        });
        // 获取分页信息
        if(needCountFlag === "Y"){
          yield put({
            type: 'queryTenantListPageInfo',
            payload: {
              queryParam: {
                ...payload,
                onlyCountFlag: 'Y',
              },
              dataSource: content,
            },
          });
        }
      }
    },

    // 查询列表分页数据
    *queryTenantListPageInfo({ payload }, { put, call }) {
      const { queryParam = {}, dataSource = [] } = payload;
      const res = yield call(queryTenantList, {...queryParam});
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateListReducer',
          payload: {
            dataSource,
            pagination: createPagination(response),
          },
        });
      }
    },

    *queryDetail({ payload }, { put, call }) {
      const res = yield call(queryDetail, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            detail: response,
          },
        });
      }
    },
    *queryCompanyInfo({ payload }, { call }) {
      const res = yield call(queryCompanyInfo, payload);
      const response = getResponse(res);
      return response;
    },
    *reject({ payload }, { call }) {
      const response = yield call(reject, payload);
      return getResponse(response);
    },
    *approve({ payload }, { call }) {
      const response = yield call(approve, payload);
      return getResponse(response);
    },
    *approveBatch({ payload }, { call }) {
      const response = yield call(approve, payload);
      return getResponse(response);
    },
    *queryRecord({ payload }, { put, call }) {
      const res = yield call(queryRecord, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            record: response.map((n) => ({ ...n, key: uuidv4() })),
          },
        });
      }
    },
    *queryTenantRecord({ payload }, { put, call }) {
      const res = yield call(queryTenantRecord, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateStateReducer',
          payload: {
            record: response.map((n) => ({ ...n, key: uuidv4() })),
          },
        });
      }
    },

    // 三证验证
    *certificationBusiness({ payload }, { call }) {
      const res = yield call(certificationBusiness, payload);
      return getResponse(res);
    },
    // 查询征信配置
    *fetchSettings(_, { call }) {
      const res = getResponse(yield call(fetchSettings));
      return res;
    },
  },
  reducers: {
    updateStateReducer(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateListReducer(state, { payload }) {
      return {
        ...state,
        list: {
          ...state.list,
          ...payload,
        },
      };
    },
  },
};
