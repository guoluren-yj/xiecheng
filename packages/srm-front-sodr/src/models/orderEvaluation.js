/*
 * orderApproval - 订单审批
 * @date: 2018/10/13 11:49:14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { omit } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  passApprovalList,
  rejectApprovalList,
  queryDetailList,
  saveDetail,
  queryDetailHeader,
  queryPoItemBOM,
  newQueryPoItemBOM,
  getAttachmentuuid,
  fetchOperationRecordList,
  // fetchChangedHistoryList,
  saveAttachmentUUID,
  queryPartners,
  detailApprove,
  detailReject,
  fetchAsnLines,
  fetchAsnLinesNew,
  fetchRcvRecords,
  fetchBillLines,
  fetchOldBillLines,
  fetchInvoiceLines,
  fetchOldInvoiceLines,
  submitEvaluation,
  queryMessage,
  sendMessage,
  fetchAssociatedConfigFlag,
} from '@/services/orderEvaluationService'; // TODO 详情页的service调用是否正确
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'orderEvaluation',

  state: {
    evaluationList: [], // 列表数据
    listPagination: {},
    selectedListRowKeys: [], // 列表页选中的项主键
    enumMap: {}, // 值集
    detail: {},
    flag: [], // 是否标识
    detailOperationQuery: {}, // 详情头操作记录查询条件

    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表

    // asnLines: [], // 详情页-关联单据-送货单
    // rcvLines: [], // 详情页-关联单据-收货记录
    // billLines: [], // 详情页-关联单据-对账单
    // invoiceLines: [], // 详情页-关联单据-网上发票
  },

  effects: {
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evaluationList: result.content,
            listPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询列表(count)
    *queryListPage({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, { ...payload, onlyCountFlag: 'Y' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            listPagination: createPagination(result),
          },
        });
      }
    },
    // 初始化值集查询
    *fetchEnum(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          erpStatus: 'SODR.ERP_STATUS',
          orderSource: 'SPRM.SRC_PLATFORM',
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
    // 订单审批通过
    *passApprovalList({ payload }, { call }) {
      const { poDTOList } = payload;
      const result = getResponse(yield call(passApprovalList, poDTOList));
      return result;
    },
    // 订单审批通过
    *rejectApprovalList({ payload }, { call }) {
      const { poDTOList } = payload;
      const result = getResponse(yield call(rejectApprovalList, poDTOList));
      return result;
    },
    // 订单明细
    *queryDetailHeader({ payload }, { call }) {
      const { poHeaderId, ...params } = payload;
      const res = yield call(queryDetailHeader, poHeaderId, params);
      return getResponse(res);
    },
    *queryDetailList({ payload }, { call }) {
      const res = yield call(queryDetailList, payload);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },

    *saveDetail({ data }, { call }) {
      const res = yield call(saveDetail, data);
      return getResponse(res);
    },
    *queryPoItemBOM({ params }, { call }) {
      const res = yield call(queryPoItemBOM, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *newQueryPoItemBOM({ params }, { call }) {
      const res = yield call(newQueryPoItemBOM, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *removeFile({ payload }, { call }) {
      const response = yield call(removeFileOrg, payload);
      return getResponse(response);
    },
    *getAttachmentuuid({ payload }, { call }) {
      const res = yield call(getAttachmentuuid, payload);
      return getResponse(res);
    },
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
    },
    *queryMessage({ params }, { call }) {
      const res = yield call(queryMessage, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *sendMessage({ data }, { call }) {
      const res = getResponse(yield call(sendMessage, data));
      return res;
    },
    // 明细页-关联单据-送货单
    *fetchAsnLines({ poLineLocationId, deliveryStrategyId }, { call }) {
      const res = yield call(
        deliveryStrategyId ? fetchAsnLinesNew : fetchAsnLines,
        poLineLocationId
      );
      const response = getResponse(res);
      return {
        dataSource: (
          (deliveryStrategyId ? response?.asnDetailLineVOS?.content || [] : response) || []
        ).map((o) => ({ ...o, key: `${o.asnNum}-${o.asnLineId}` })),
      };
    },
    // 明细页-关联单据-收货记录
    *fetchRcvRecords({ poLineLocationId }, { call }) {
      const res = yield call(fetchRcvRecords, poLineLocationId);
      const response = getResponse(res);
      return {
        dataSource: response || [],
      };
    },
    // 明细页-关联单据-对账单
    *fetchBillLines({ payload }, { call }) {
      const res = yield call(fetchBillLines, payload);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
      };
    },
    // 明细页-关联单据-老对账单
    *fetchOldBillLines({ poLineLocationId }, { call }) {
      const res = yield call(fetchOldBillLines, poLineLocationId);
      const response = getResponse(res);
      return {
        dataSource: response || [],
      };
    },

    // 明细页-关联单据-网上发票
    *fetchInvoiceLines({ payload }, { call }) {
      const res = yield call(fetchInvoiceLines, payload);
      const response = getResponse(res);
      return {
        dataSource: response.content || [],
      };
    },
    // 明细页-关联单据-老网上发票
    *fetchOldInvoiceLines({ poLineLocationId }, { call }) {
      const res = yield call(fetchOldInvoiceLines, poLineLocationId);
      const response = getResponse(res);
      return {
        dataSource: response || [],
      };
    },

    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call, put }) {
      const { poHeaderId, ...otherParams } = payload;
      const result = getResponse(yield call(fetchOperationRecordList, poHeaderId, otherParams));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailOperationQuery: omit(payload, ['page']),
            operationRecordList: result.content,
            operationRecordPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // *fetchChangedHistoryList({ payload }, { call, put }) {
    //   const { page = 0, size = 10, poHeaderId } = payload;
    //   const result = getResponse(yield call(fetchChangedHistoryList, { poHeaderId, page, size }));
    //   if (result) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         changedHistoryList: result.content,
    //         changedHistoryPagination: createPagination(result),
    //       },
    //     });
    //   }
    // },
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
      return getResponse(res);
    },
    // 订单明细
    *queryPartners({ poHeaderId, params }, { call }) {
      const res = yield call(queryPartners, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    *detailApprove({ data }, { call }) {
      const response = yield call(detailApprove, data);
      return getResponse(response);
    },
    *detailReject({ data }, { call }) {
      const response = yield call(detailReject, data);
      return getResponse(response);
    },
    // 提交评价
    *submitEvaluation({ payload }, { call }) {
      const response = getResponse(yield call(submitEvaluation, payload));
      return response;
    },
    *fetchAssociatedConfigFlag({ payload }, { call }) {
      const result = getResponse(yield call(fetchAssociatedConfigFlag, payload));
      return result;
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
