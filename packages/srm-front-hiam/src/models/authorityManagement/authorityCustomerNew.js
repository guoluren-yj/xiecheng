/**
 * authorityCustomer - 租户级权限维护tab页 - 客户 model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  saveData,
  deleteData,
  queryCompanyModalData,
  queryDataCustomer,
} from '../../services/authorityManagementService';

export default {
  namespace: 'authorityCustomerNew',

  state: {
    head: {},
    list: [],
    pagination: {},
    customerDataSource: [],
    customerPagination: {},
    new: {},
  },
  effects: {
    *fetchAuthorityCustomer({ payload }, { call, put }) {
      const response = yield call(queryDataCustomer, payload);
      const data = getResponse(response);
      if (data) {
        const { userAuthorityCustomerList = {}, userAuthority = {} } = data;
        const { content = [] } = userAuthorityCustomerList;
        yield put({
          type: 'updateState',
          payload: {
            head: userAuthority,
            list: content,
            pagination: createPagination(userAuthorityCustomerList),
          },
        });
      }
    },
    *addAuthorityCustomer({ payload }, { call }) {
      const response = yield call(saveData, payload);
      return getResponse(response);
    },
    *deleteAuthorityCustomer({ payload }, { call }) {
      const response = yield call(deleteData, payload);
      return getResponse(response);
    },
    *fetchModalData({ payload }, { call, put }) {
      const response = yield call(queryCompanyModalData, payload);
      const data = getResponse(response);
      if (data) {
        const { content = [] } = data;
        yield put({
          type: 'updateState',
          payload: {
            customerDataSource: content,
            customerPagination: createPagination(data),
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
