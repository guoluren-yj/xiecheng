/**
 * bidNotice - 中标／招标公告
 * @date: 2019-09-11
 * @version: 1.0.0
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';

import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryAcceptNotice,
  publishAcceptNotice,
  queryBidNotice,
  queryAttachment,
  fetchNoticeData,
  saveAcceptNotice,
} from '@/services/bidNoticeService';

export default {
  namespace: 'bidNotice',
  state: {
    code: {}, // 值集
    acceptNoticeObj: {}, // 中标公告详情
    noticeData: {}, // 中标公告
    bidNoticeObj: {}, // 招标公告
    fileList: [], // 附件
  },
  effects: {
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 中标公告查询
    *fetchNoticeData({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchNoticeData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            noticeData: result,
          },
        });
      }
      return result;
    },
    // 中标公告查询
    *queryAcceptNotice({ payload }, { call, put }) {
      const acceptNoticeObj = getResponse(yield call(queryAcceptNotice, payload));
      if (acceptNoticeObj) {
        yield put({
          type: 'updateState',
          payload: {
            acceptNoticeObj,
          },
        });
      }
    },

    // 中标公告保存
    *saveAcceptNotice({ payload }, { call }) {
      const result = getResponse(yield call(saveAcceptNotice, payload));
      return result;
    },

    // 中标公告发布
    *publishAcceptNotice({ payload }, { call }) {
      const result = getResponse(yield call(publishAcceptNotice, payload));
      return result;
    },

    // 招标公告查询
    *queryBidNotice({ payload }, { call, put }) {
      const bidNoticeObj = getResponse(yield call(queryBidNotice, payload));
      if (bidNoticeObj) {
        yield put({
          type: 'updateState',
          payload: {
            bidNoticeObj,
          },
        });
      }
      return bidNoticeObj;
    },

    // 附件查询
    *queryAttachment({ payload }, { call, put }) {
      const fileList = getResponse(yield call(queryAttachment, payload));
      if (fileList) {
        yield put({
          type: 'updateState',
          payload: {
            fileList,
          },
        });
      }
      return fileList;
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
