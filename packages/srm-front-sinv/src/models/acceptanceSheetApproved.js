/**
 * acceptanceSheetApproved - 验收单审批
 * @date: 2019-11-22
 * @author:LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchApproveList,
  fetchApproveHeader,
  fetchApproveDetailList,
  approveAcceptance,
  rejectAcceptance,
} from '@/services/acceptanceSheetService.js';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'acceptanceSheetApproved',

  state: {
    approveList: [], // 验收单审批列表数据源
    approveListPagination: {}, // 验收单审批列表分页
    approveDetailList: [], // 验收单审批详情行列表
    approveDetailListPagination: {}, // // 验收单审批详情行分页
    approveHeader: {}, // 验收单审批详情查询头详情
    code: {}, // 值集
  },

  effects: {
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    /**
     * 验收单审批入口页面查询
     * @param {?object} payload - 查询字段对象
     */
    *fetchApproveList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchApproveList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            approveList: res.content || [],
            approveListPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    /**
     * 查询验收单审批详情界面头信息
     * @param {object} payload - 查询数据的 id 的数组
     */
    *fetchApproveHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchApproveHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            approveHeader: res,
          },
        });
      }
      return res;
    },
    /**
     * 查询验收单审批详情界面行信息
     * @param {object} payload - 查询数据的 id 的数组
     */
    *fetchApproveDetailList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchApproveDetailList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            approveDetailList: res.content || [],
            approveDetailListPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    /**
     * 审批验收单
     * @param {*} { call }
     * @returns
     */
    *approveAcceptance({ payload }, { call }) {
      const res = getResponse(yield call(approveAcceptance, payload));
      return res;
    },
    /**
     * 审批验收单
     * @param {*} { call }
     * @returns
     */
    *rejectAcceptance({ payload = {} }, { call }) {
      const res = getResponse(yield call(rejectAcceptance, payload));
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
