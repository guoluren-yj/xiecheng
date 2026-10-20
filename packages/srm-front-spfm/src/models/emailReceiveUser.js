/**
 * emailReceiveUser - 平台邮件接收用户定义 - model
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryNoticeUser,
  queryUdtUser,
  addNoticeUser,
  removeNoticeUser,
  updateNoticeUser,
} from '@/services/emailReceiveUserService';

export default {
  namespace: 'emailReceiveUser',

  state: {
    data: [], // 平台邮件接收用户定义列表定义
    pagination: {}, // 平台邮件接收用户定义分页对象
    userList: [], // 选择用户列表
    userPagination: {}, // 选择用户分页对象
  },

  effects: {
    // 获取接收邮件用户的列表
    *queryNoticeUser({ payload }, { put, call }) {
      const res = yield call(queryNoticeUser, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            data: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 获取选择用户列表
    *queryUdtUser({ payload }, { put, call }) {
      const res = yield call(queryUdtUser, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            userList: list.content,
            userPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    //  新增接收邮件用户
    *addNoticeUser({ payload }, { call }) {
      const res = yield call(addNoticeUser, payload);
      return getResponse(res);
    },

    //  新增接收邮件用户
    *removeNoticeUser({ payload }, { call }) {
      const res = yield call(removeNoticeUser, payload);
      return getResponse(res);
    },

    //  新增接收邮件用户
    *updateNoticeUser({ payload }, { call }) {
      const res = yield call(updateNoticeUser, payload);
      return getResponse(res);
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
