/*
 * invitationList - 邀约汇总
 * @date: 2018/10/13 08:59:23
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId, createPagination } from 'utils/utils';
import {
  fetchInviteList,
  rejectInviteList,
  approveInviteList,
  fetchRiskScan,
  riskEmbedPage,
  fetchApproveForm,
} from '@/services/invitationListService';
import { fetchSinglePrivacyPolicyText, fetchSelectPolicyText } from '@/services/disposeInviteService';
import { queryIdpValue, queryUnifyIdpValue } from 'hzero-front/lib/services/api';

const tenantId = getCurrentOrganizationId();
export default {
  namespace: 'invitationList',

  state: {
    emitList: [], // 发出的邀约列表
    receiveList: [], // 接收的邀约列表
    inviteType: [], // 邀请类型列表
    processStatus: [], // 邀约状态
    sendPagination: {},
    receivePagination: {},
    dataSourceMap: {},
    selectedRowKeys: [],
    privacyPolicyText: {},
    // riskScanList:[], // 查询风险扫描列表
    lifeCycleList: [],
  },

  effects: {
    // 查询生命周期阶段sql值集
    *queryLifeCycleStage(_, { put, call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE'));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            lifeCycleList: res,
          },
        });
      }
    },
    // 查询发出的列表
    *fetchInviteList({ payload }, { call, put }) {
      const { searchType, ...query } = payload;
      const result = getResponse(yield call(fetchInviteList, { ...query, searchType, tenantId }));
      if (result) {
        if (searchType === 'send') {
          yield put({
            type: 'updateState',
            payload: {
              emitList: result.content || [],
              sendPagination: createPagination(result),
            },
          });
        } else if (searchType === 'receive') {
          yield put({
            type: 'updateState',
            payload: {
              receiveList: result.content || [],
              receivePagination: createPagination(result),
            },
          });
        }
      }
    },

    // 批量拒绝
    *rejectInviteList({ payload }, { call }) {
      const data = yield call(rejectInviteList, payload);
      return getResponse(data);
    },

    // 批量审批同意
    *approveInviteList({ payload }, { call }) {
      const data = yield call(approveInviteList, payload);
      return getResponse(data);
    },

    /**
     * 初始化值集获取
     * @param {Object} params
     * @param {Function} { call, put }
     */
    *init(params, { call, put }) {
      const inviteType = getResponse(yield call(queryIdpValue, 'SPFM.PARTNER_INVITE_TYPE'));
      const processStatus = getResponse(yield call(queryIdpValue, 'SPFM.PARTNER_INVITE_STATUS'));
      const levelTypeYOrNStatus = getResponse(yield call(queryIdpValue, 'SPFM.GROUP_INVITE.FLAG'));
      const investigateYOrNStatus = getResponse(yield call(queryIdpValue, 'HPFM.FLAG'));
      yield put({
        type: 'updateState',
        payload: {
          inviteType: inviteType || [],
          processStatus: processStatus || [],
          levelTypeYOrNStatus: levelTypeYOrNStatus || [],
          investigateYOrNStatus: investigateYOrNStatus || [],
        },
      });
    },
    // 查询配置信息
    *fetchRiskScan(_, { call }) {
      const res = getResponse(yield call(fetchRiskScan));
      return res;
    },

    // 斯瑞德风险扫描内嵌页
    *riskEmbedPage({ payload }, { call }) {
      const response = yield call(riskEmbedPage, payload);
      return getResponse(response);
    },
    // 查询平台静态文本
    *fetchPlatformPolicyText({ payload }, { call }) {
      const res = yield call(fetchSinglePrivacyPolicyText, payload);
      return getResponse(res);
    },
    // 查询列表勾选的静态文本
    *fetchSelectPolicyText({ payload }, { call }) {
      const res = yield call(fetchSelectPolicyText, payload);
      return getResponse(res);
    },
    // 我收到的邀约-同意合作弹框表单数据源
    *fetchApproveForm({ payload }, { call }){
      const res = yield call(fetchApproveForm, payload);
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
