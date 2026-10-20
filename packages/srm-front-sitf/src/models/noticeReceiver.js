/**
 * noticeReceiver - 监控联系人 - model
 * @date: 2018-11-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchNoticeReceiver,
  saveNoticeReceiver,
  deleteNoticeReceiver,
  fetchMonitorSystemInfo,
} from '@/services/noticeReceiverService';

export default {
  namespace: 'noticeReceiver',
  state: {
    /**
     * 监控联系人数据
     */
    data: {
      list: [],
      pagination: {},
    },
    /**
     *
     */
    monitorSystemInfo: {},
  },
  effects: {
    *fetchMonitorSystemInfo({ payload }, { call, put }) {
      const response = yield call(fetchMonitorSystemInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            monitorSystemInfo: data,
          },
        });
      }
    },
    /**
     * 查询监控联系人
     */
    *fetchNoticeReceiver({ payload }, { call, put }) {
      const response = yield call(fetchNoticeReceiver, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 保存监控联系人
     */
    *saveNoticeReceiver({ payload }, { call }) {
      const response = yield call(saveNoticeReceiver, payload);
      return getResponse(response);
    },
    /**
     * 删除监控联系人
     */
    *deleteNoticeReceiver({ payload }, { call }) {
      const response = yield call(deleteNoticeReceiver, payload);
      return getResponse(response);
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
