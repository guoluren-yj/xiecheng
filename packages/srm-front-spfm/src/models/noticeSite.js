/**
 * model 公告管理
 * @date: 2018-8-6
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';
import {
  fetchNotice,
  createNotice,
  updateNotice,
  deleteNotice,
  queryNotice,
  publicNotice,
  revokeNotice,
  noticeHistory,
  fetchNoticeTenant,
  fetchUdtTenant,
  addTenant,
  removeTenant,
  fetchUserList,
  fetchNoticeTimes,
  fetchNoticeCountDelete,
} from '@/services/noticeSiteService';

export default {
  namespace: 'noticeSite',

  state: {
    noticeList: [], // 公告列表数据
    pagination: {}, // 分页对象
    noticeDetail: {
      // 公告明细信息
      noticeContent: {
        noticeBody: '',
      },
    },
    noticeBodyWord: '',
    noticeReceiverType: [], // 公告接受者类型
    noticeCategory: [], // 公告类别
    noticeStatus: [], // 公告状态
    noticeHisotryList: [], // 操作历史列表
    noticeTenantList: [], // 接收邮件租户列表
    noticeTenantPagination: {}, // 接收邮件租户分页对象
    tenantList: [], // 未接收邮件租户列表
    tenantPagination: {}, // 未邮件租户分页对象
    userList: [], // 获取用户的列表
    userPagination: {}, // 用户的分页对象
  },

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const noticeCategory = getResponse(yield call(queryIdpValue, 'SPFM.PLATFORM_NOTICE_TYPE'));
      const noticeStatus = getResponse(
        yield call(queryIdpValue, 'SPFM.NOTICE.STATUS_PAGE_PLATFORM')
      );
      const langObject = getResponse(yield call(queryIdpValue, 'HPFM.LANGUAGE2'));
      yield put({
        type: 'updateState',
        payload: {
          noticeStatus,
          noticeCategory,
          langObject,
        },
      });
    },
    *fetchNotice({ payload }, { call, put }) {
      const res = yield call(fetchNotice, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 创建公告信息
    *createNotice({ payload }, { call }) {
      const res = yield call(createNotice, payload);
      return getResponse(res);
    },
    // 更新公告信息
    *updateNotice({ payload }, { call }) {
      const res = yield call(updateNotice, payload);
      return getResponse(res);
    },
    // 删除公告信息
    *deleteNotice({ payload }, { call }) {
      const res = yield call(deleteNotice, payload);
      return getResponse(res);
    },
    // 查询单条公告信息
    *queryNotice({ payload }, { call, put }) {
      const res = yield call(queryNotice, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeDetail: list,
            noticeBodyWord: list.noticeContent.noticeBody,
          },
        });
      }
      return list;
    },
    // 发布公告信息
    *publicNotice({ payload }, { call }) {
      const res = yield call(publicNotice, payload);
      return getResponse(res);
    },

    // 查看操作记录
    *NoticeHistory({ payload }, { call, put }) {
      const res = yield call(noticeHistory, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeHisotryList: list,
            // noticeHisotrypagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 撤销删除公告信息
    *revokeNotice({ payload }, { call }) {
      const res = yield call(revokeNotice, payload);
      return getResponse(res);
    },
    // 获取已维护的租户信息
    *fetchNoticeTenant({ payload }, { call, put }) {
      const res = yield call(fetchNoticeTenant, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeTenantList: list.content,
            noticeTenantPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 获取未维护租户
    *fetchUdtTenant({ payload }, { call, put }) {
      const res = yield call(fetchUdtTenant, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            tenantList: list.content,
            tenantPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 批量新建租户
    *addTenant({ payload }, { call }) {
      const res = yield call(addTenant, payload);
      return getResponse(res);
    },

    // 批量删除租户
    *removeTenant({ payload }, { call }) {
      const res = yield call(removeTenant, payload);
      return getResponse(res);
    },

    // 获取用户的列表
    *fetchUserList({ payload }, { call, put }) {
      const res = yield call(fetchUserList, payload);
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
    *fetchNoticeTimes({ payload }, { call }) {
      const res = yield call(fetchNoticeTimes, payload);
      return res;
    },
    *fetchNoticeCountDelete({ payload }, { call }) {
      const res = yield call(fetchNoticeCountDelete, payload);
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
