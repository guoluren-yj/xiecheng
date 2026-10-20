/**
 * purchaseRequisitionInquiry - 需求查询
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { createPagination, getResponse, parseParameters, filterNullValueObject } from 'utils/utils';
import {
  evaluate,
  modalSave,
  reImportERP,
  queryDemandList,
  queryNotErpDetail,
  fetchOperationRecordList,
  fetchUpdateRecordList,
  queryOperationRecords,
  queryErpDetail,
  queryNotErpLines,
  queryErpLines,
  fetchDetailList,
  listUrgent,
  listCancelUrgent,
  detailUrgent,
  detailCancelUrgent,
  fetchPriceList,
  fetchLineHistory,
  queryExecutedBys,
  fetchWithdraw,
  print,
} from '@/services/purchaseRequisitionInquiryService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseRequisitionInquiry',
  state: {
    lastActiveTabKey: '',
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
    autoOrderStatus: [],
    closeStatus: [], // 关闭状态 值集
    executionStrategyList: [], // 执行策略
    cancelStatus: [], // 取消状态 值集
    flag: [], // 是否加急
    executeBillType: [], // 执行单据类型
    prStatus: [], // 状态
    queryParams: {}, // 日期数据
    detailQueryParams: {},
    detailList: [],
    erpEditStatusList: [],
    detailPagination: {},
    selectRow: [],
    detailFilterValues: {},
  },
  effects: {
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
    // 获取列表数据 - 整单
    *fetchList({ payload }, { call, put }) {
      let result = yield call(queryDemandList, { ...payload, asyncCountFlag: 'DEFAULT' });
      result = getResponse(result);
      if (!result) return;
      const { content, needCountFlag } = result;
      yield put({
        type: 'updateState',
        payload: {
          queryParams: filterNullValueObject(parseParameters(payload)),
          list: content || [],
          pagination: createPagination(result),
        },
      });
      yield put({
        type: 'fetchTotalCountAsync',
        options: {
          payload,
          needCountFlag,
          pageStateName: 'pagination',
          queryRequest: queryDemandList,
        },
      });
    },
    // 获取明细查询列表数据
    *fetchDetailList({ payload }, { call, put }) {
      let result = yield call(fetchDetailList, { ...payload, asyncCountFlag: 'DEFAULT' });
      result = getResponse(result);
      if (!result) return;
      const { content, needCountFlag } = result;
      yield put({
        type: 'updateState',
        payload: {
          detailQueryParams: filterNullValueObject(parseParameters(payload)),
          detailList: content || [],
          detailPagination: createPagination(result),
        },
      });
      yield put({
        type: 'fetchTotalCountAsync',
        options: {
          payload,
          needCountFlag,
          pageStateName: 'detailPagination',
          queryRequest: fetchDetailList,
        },
      });
    },
    // 需求明细(非erp)
    *fetchNotErpDetail({ payload }, { call, put }) {
      const { workflowFormCode, ...others } = payload || {};
      let result = yield call(queryNotErpDetail, others);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            notErpDetailSource: { ...result, workflowFormCode },
          },
        });
      }
      return result;
    },

    // 查询评价数据
    *evaluate({ payload }, { call }) {
      return getResponse(yield call(evaluate, payload));
    },

    // 提交评价数据
    *modalSave({ payload }, { call }) {
      const data = getResponse(yield call(modalSave, payload));
      return data;
    },

    // 非erp采购申请行信息
    *fetchNotErpLines({ payload }, { call, put }) {
      const { prSourcePlatformCode } = payload;
      let customizeUnitCode = '';
      switch (prSourcePlatformCode) {
        case 'E-COMMERCE':
          customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_ECOMMERCE';
          break;
        case 'SRM':
          customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.SRM_LINE';
          break;
        default:
          customizeUnitCode = 'SRPM.PURCHAE_REQUISITION_QUERY.DETAIL.LINE_CATALOGUE';
      }
      const result = getResponse(yield call(queryNotErpLines, { ...payload, customizeUnitCode }));
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
    *erpDetail({ payload }, { call, put }) {
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
      return result;
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
      return result;
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
          autoOrderStatus: 'SPRM.PR_APPROVE.CHANGE_ORDER_STATUS', // 自动创建PO状态
          closeStatus: 'SPRM.PR_CLOSE_STATUS', // 关闭状态
          cancelStatus: 'SPRM.PR_CANCEL_STATUS', // 取消状态
          prStatus: 'SPRM.PR_STATUS', // 状态
          abcTypeList: 'SMDM.ITEM_ABC',
          executionStrategyList: 'SPRM.EXECUTION_STRATEGY',
          flag: 'HPFM.FLAG',
          executeBillType: 'SPRM.PR_EXECUTION_BILL_TYPE',
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
    *fetchDLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          erpEditStatusList: 'SPUC.PR_ERP_STATUS',
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
    // 获取变更日志列表数据
    *fetchUpdateRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchUpdateRecordList, payload));
      return result;
    },
    // 采购申请同步到ERP
    *reImportERP({ data }, { call }) {
      const res = yield call(reImportERP, [data]);
      return getResponse(res);
    },
    // 整单加急
    *listUrgent({ payload }, { call }) {
      const data = getResponse(yield call(listUrgent, payload));
      return data;
    },
    // 取消加急
    *listCancelUrgent({ payload }, { call }) {
      const data = getResponse(yield call(listCancelUrgent, payload));
      return data;
    },
    // 明细界面加急
    *detailUrgent({ payload }, { call }) {
      const data = getResponse(yield call(detailUrgent, payload));
      return data;
    },

    // 明细界面取消加急
    *detailCancelUrgent({ payload }, { call }) {
      const data = getResponse(yield call(detailCancelUrgent, payload));
      return data;
    },

    *fetchLineHistory({ payload }, { call }) {
      const res = getResponse(yield call(fetchLineHistory, payload));
      return res;
    },

    // 比价单查询
    *fetchPriceList({ payload }, { call }) {
      const response = getResponse(yield call(fetchPriceList, payload));
      return response;
    },

    // 查询需求执行人LOV数据
    *queryExecutedBys({ payload }, { call }) {
      const result = getResponse(yield call(queryExecutedBys, payload));
      return result;
    },
    // 采购申请撤回
    *fetchWithdraw({ payload }, { call }) {
      const result = getResponse(yield call(fetchWithdraw, payload));
      return result;
    },
    // 打印
    *print({ payload }, { call }) {
      const response = getResponse(yield call(print, payload));
      return response;
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
