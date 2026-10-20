/*
 * operatingRecord - 调查表审批
 * @date: 2018/12/7
 * @author: DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { isEmpty, flattenDepth } from 'lodash';
import { fetchRecordList, fetchReviewList } from '@/services/investigationApprovalService';

/**
 * 调查表审批
 */
export default {
  namespace: 'operatingRecord',
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
