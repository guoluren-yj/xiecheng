/*
 * invitationList - 邀约汇总
 * @date: 2018/10/13 08:59:23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchNoticeSign,
  fetchDetail,
  batchSignFor,
  fetchOperationRecord,
  receivesAttachmentUuidSave,
} from '@/services/noticeSignService';

export default {
  namespace: 'noticeSign',

  state: {
    enumMap: [],
    dataSource: [], // 数据
    pagination: {},
    notificationId: '', // 追觅二开使用
  },

  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SNTM.NOTIFICATION_STATUS',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },

    *fetchNoticeSign({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchNoticeSign, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
      }
    },

    *fetchDetail({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchDetail, payload));

      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            notificationId: response.notificationId || '',
          },
        });
      }

      return response;
    },

    *batchSignFor({ payload }, { call }) {
      return getResponse(yield call(batchSignFor, payload));
    },

    *fetchOperationRecord({ payload }, { call }) {
      return getResponse(yield call(fetchOperationRecord, payload));
    },
    *receivesAttachmentUuidSave({ payload }, { call }) {
      return getResponse(yield call(receivesAttachmentUuidSave, payload));
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
