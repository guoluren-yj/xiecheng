/*
 * @Descripttion:
 * @Date: 2021-05-28 17:59:20
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
/**
 * Company - 租户级权限维护tab页 - 采购品类 model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  changeAuthority,
  copyAuthority,
  queryUserInfo,
  queryUserDimension,
  queryRoleDimension,
} from '@/services/authorityManagementServiceNew';

export default {
  namespace: 'authorityManagement',

  state: {
    authorList: [],
    data: {
      list: [],
    },
  },
  effects: {
    *fetchUserInfo({ payload }, { call, put }) {
      const response = yield call(queryUserInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryUserInfo',
          payload: data,
        });
      }
    },
    *fetchUserDimension({ payload }, { call, put }) {
      const response = yield call(queryUserDimension, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { authorList: data },
        });
      }
      return data;
    },
    *fetchRoleDimension({ payload }, { call }) {
      const response = yield call(queryRoleDimension, payload);
      return getResponse(response);
    },
    *copyAuthority({ payload }, { call }) {
      const response = yield call(copyAuthority, payload);
      return getResponse(response);
    },
    *changeAuthority({ payload }, { call }) {
      const response = yield call(changeAuthority, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryUserInfo(state, action) {
      return {
        ...state,
        data: action.payload,
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
