/**
 * Message API返回消息管理
 * @date: 2019-1-9
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  deleteMessage,
  batchDeleteMessage,
  resetMessage,
  copyMessage,
  fetchMessageList,
  createMessage,
  updateMessage,
  getMessageDetail,
} from '../services/messageService';

export default {
  namespace: 'message',
  state: {
    messageList: [], // 消息列表
    languageList: [], // 语言列表
    pagination: {}, // 分页对象
    messageDetail: {}, // 查询列表
    messageType: [], // 类别
    fieldType: [], // 消息类型
    issueLevelList: [], // 问题等级
    issueModuleList: [], // 问题模块
    issueRoleList: [], // 默认跟进角色
  },
  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      // const languageList = getResponse(yield call(queryUnifyIdpValue, 'HPFM.LANGUAGE'));

      const { languageList } = window.dvaApp._store.getState().global || {};
      const batchList = getResponse(
        yield call(queryMapIdpValue, {
          messageType: 'HPFM.MESSAGE_TYPE',
          fieldType: 'SYSTEM_ERROR_LIST',
          issueLevelList: 'SRM.HPFM_MESSAGE_ISSUE_LEVEL',
          issueModuleList: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
          issueRoleList: 'SRM.HPFM_MESSAGE_ISSUE_ROLE_FOLLOW',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          languageList: languageList || [],
          ...batchList,
        },
      });
      return languageList || [];
    },

    // 获取消息列表
    *fetchMessageList({ payload }, { call, put }) {
      const res = yield call(fetchMessageList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            messageList: list.content,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 查询消息列表
    *getMessageDetail({ payload }, { call, put }) {
      const res = yield call(getMessageDetail, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            messageDetail: list,
          },
        });
      }
      return list;
    },

    // 新增消息
    *createMessage({ payload }, { call }) {
      const res = yield call(createMessage, payload);
      return getResponse(res);
    },

    // 更新消息
    *updateMessage({ payload }, { call }) {
      const res = yield call(updateMessage, payload);
      return getResponse(res);
    },

    // 删除消息
    *deleteMessage({ payload }, { call }) {
      const res = yield call(deleteMessage, payload);
      return getResponse(res);
    },

    // 平台批量删除消息
    *batchDeleteMessage({ payload }, { call }) {
      const res = yield call(batchDeleteMessage, payload);
      return getResponse(res);
    },

    // 租户级重置消息
    *resetMessage({ payload }, { call }) {
      const res = yield call(resetMessage, payload);
      return getResponse(res);
    },

    // 租户级复制消息
    *copyMessage({ payload }, { call }) {
      const res = yield call(copyMessage, payload);
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
