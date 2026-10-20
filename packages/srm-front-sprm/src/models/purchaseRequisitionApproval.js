/*
 * purchaseRequisitionApproval - 采购申请审批
 * @date: 2019-01-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  approval,
  reject,
  queryList,
  queryErpList,
  queryDetailList,
  fetchOperationRecordList,
  approvalApprovalList,
  rejectApprovalList,
  queryDetailHeader,
  fetchPriceList,
} from '@/services/purchaseRequisitionApprovalService';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';

export default {
  namespace: 'purchaseRequisitionApproval',
  state: {
    listPagination: {},
    approvalList: [], // 列表数据
    enumMap: {}, // 值集
    detail: {},
    flag: [],
    prSourcePlatformList: [], // 申请人列表
    approvalPendingStatusList: [],
    selectInfo: {}, // 勾选的行信息
    filterParams: {}, // 查询条件
  },

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const prSourcePlatformList = getResponse(yield call(queryUnifyIdpValue, 'SPRM.SRC_PLATFORM'));
      const approvalPendingStatusList = getResponse(
        yield call(queryUnifyIdpValue, 'SPRM.PR_APPROVAL_PENDING_STA')
      );
      yield put({
        type: 'updateState',
        payload: {
          prSourcePlatformList,
          approvalPendingStatusList,
        },
      });
    },
    *fetchTotalCountAsync({ options }, { call, put }) {
      const { payload, needCountFlag, pageStateName, queryRequest } = options || {};
      if (!payload || needCountFlag !== 'Y') return;
      const response = yield call(queryRequest, { ...payload, onlyCountFlag: 'Y' });
      const result = getResponse(response);
      if (!result) return;
      yield put({
        type: 'updateState',
        payload: {
          [pageStateName]: createPagination(result),
        },
      });
    },
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' }));
      if (result) {
        const { needCountFlag } = result;
        yield put({
          type: 'updateState',
          payload: {
            approvalList: result?.content || [],
            listPagination: createPagination(result),
            filterParams: payload,
            selectInfo: {},
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            queryRequest: queryList,
            pageStateName: 'listPagination',
          },
        });
      }
      return result;
    },

    // 初始化值集查询
    *fetchEnum(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          erpStatus: 'SODR.ERP_STATUS',
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

    // 采购申请erp审批通过
    *approval({ payload }, { call }) {
      const result = getResponse(yield call(approval, payload.prHeaderList));
      return result;
    },

    // 采购申请erp审批拒绝
    *reject({ payload }, { call }) {
      const result = getResponse(yield call(reject, payload));
      return result;
    },

    // 采购申请非erp审批通过
    *approvalApprovalList({ payload }, { call }) {
      const result = getResponse(yield call(approvalApprovalList, payload));
      return result;
    },

    // 采购申请非erp审批拒绝
    *rejectApprovalList({ payload }, { call }) {
      const result = getResponse(yield call(rejectApprovalList, payload));
      return result;
    },

    // 查询明细头
    *queryDetailHeader({ payload }, { call }) {
      const response = yield call(queryDetailHeader, payload);
      return getResponse(response);
    },

    // 查询明细行
    *queryDetailList({ payload }, { call }) {
      const res = yield call(queryDetailList, payload);
      return getResponse(res);
    },
    // 查询明细行
    *queryErpList({ payload }, { call }) {
      const res = yield call(queryErpList, payload);
      return getResponse(res);
    },

    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 比价单查询
    *fetchPriceList({ payload }, { call }) {
      const response = yield call(fetchPriceList, payload);
      return response;
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
