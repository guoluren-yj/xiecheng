/*
 * invitationQuestionnaireOperation - 邀约调查表-操作记录
 * @date: 2021/11/12
 * @author: DTM <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, ZhenYun
 */

import { getResponse, createPagination } from 'utils/utils';
import { isEmpty, flattenDepth } from 'lodash';
import {
  fetchRecordList,
  fetchReviewList,
} from '@/services/invitationQuestionnaireOperationlService';

/**
 * 调查表审批
 */
export default {
  namespace: 'invitationQuestionnaireOperation',
  state: {
    recordList: {}, // 调查表审批列表
    recordPagination: {}, // 调查表分页
    reviewList: [], // 调查表工作流审批记录
  },

  effects: {
    // 查询调查表审批记录'
    *fetchRecordList({ payload }, { put, call }) {
      const res = yield call(fetchRecordList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            recordList: list,
            recordPagination: createPagination(list),
          },
        });
      }
    },
    // 查询调查表工作流审批记录
    *fetchReviewList({ payload }, { put, call }) {
      const response = getResponse(yield call(fetchReviewList, payload));
      const result = Object.values(response);

      let res = {};
      if (isEmpty(result[0])) {
        res = [];
      } else {
        res = flattenDepth(result[0].map((i) => i.historicTaskExtList));
      }

      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            reviewList: res,
          },
        });
      }
    },
    // 清空调查表审批记录和操作记录
    *clearRecordList(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          recordList: {}, // 调查表审批列表
          recordPagination: {}, // 调查表分页
          reviewList: [], // 调查表工作流审批记录
        },
      });
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
