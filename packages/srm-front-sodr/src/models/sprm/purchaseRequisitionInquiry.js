/**
 * purchaseRequisitionInquiry - 需求查询
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, parseParameters } from 'utils/utils';
import {
  reImportERP,
  queryDemandList,
  queryNotErpDetail,
  fetchOperationRecordList,
  queryOperationRecords,
  queryErpDetail,
  queryNotErpLines,
  queryErpLines,
} from '@/services/sprm/purchaseRequisitionInquiryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseRequisitionInquiry',
  state: {
    list: [], // 列表数据
    pagination: {}, // 分页信息
    demandSource: [], // 需求来源
    notErpDetailSource: {}, // 需求明细(非erp)
    notErpLines: [], // 采购申请行信息(非erp)
    notErpLinesPage: {}, // 采购申请行分页信息(非erp)
    operatorRecords: [], // 操作记录
    operatorRecPagination: [], // 操作记录分页信息
    erpDetailSource: {}, // 需求明细(erp)
    erpLines: [], // 采购申请行信息(erp)
    erpLinesPage: {}, // 采购申请行分页信息(erp)
    problemSource: [], // 数据来源 值集
    closeStatus: [], // 关闭状态 值集
    cancelStatus: [], // 取消状态 值集
    prStatus: [], // 状态
    queryParams: {}, // 日期数据
  },
  effects: {
    // 获取列表数据
    *fetchList({ payload }, { call, put }) {
      let result = yield call(queryDemandList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            queryParams: parseParameters(payload),
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 需求明细(非erp)
    *fetchNotErpDetail({ payload }, { call, put }) {
      let result = yield call(queryNotErpDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            notErpDetailSource: result,
          },
        });
      }
    },
    // 非erp采购申请行信息
    *fetchNotErpLines({ payload }, { call, put }) {
      const result = getResponse(yield call(queryNotErpLines, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            notErpLines: result.content,
            notErpLinesPage: createPagination(result),
          },
        });
      }
    },
    // 需求明细(erp)
    *fetchErpDetail({ payload }, { call, put }) {
      let result = yield call(queryErpDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            erpDetailSource: result,
          },
        });
      }
    },
    // erp采购申请行信息
    *fetchErpLines({ payload }, { call, put }) {
      const result = getResponse(yield call(queryErpLines, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            erpLines: result.content,
            erpLinesPage: createPagination(result),
          },
        });
      }
    },
    // 获取操作记录
    *operationRecords({ payload }, { call, put }) {
      const result = yield call(queryOperationRecords, payload);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operatorRecords: result.content,
            operatorRecPagination: createPagination(result),
          },
        });
      }
    },
    // 获取Lov值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          problemSource: 'SPRM.SRC_PLATFORM', // 数据来源
          closeStatus: 'SPRM.PR_CLOSE_STATUS', // 关闭状态
          cancelStatus: 'SPRM.PR_CANCEL_STATUS', // 取消状态
          prStatus: 'SPRM.PR_STATUS', // 状态
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
      }
    },
    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 采购申请同步到ERP
    *reImportERP({ data }, { call }) {
      const res = yield call(reImportERP, [data]);
      return getResponse(res);
    },
  },

  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
