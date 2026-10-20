/*
 *
 * @date: 2018/11/13 17:47:27
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryDeliveryReviewList,
  fetchOperationRecordList,
  approveDeliveryOrder,
  rejectDeliveryOrder,
  queryDetailHeader,
  queryDetailList,
  getLineAttachmentUuid,
  getHeaderAttachmentUuid,
  fetchBOM,
} from '@/services/deliveryReviewService';
import { queryFileListOrg, removeFileOrg, queryMapIdpValue } from 'services/api';

export default {
  namespace: 'deliveryReview',

  state: {
    enumMap: {}, // 值集
    orderList: [], // 列表
    listPagination: {},
    listQuery: {}, // 列表查询条件
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    selectedListRowKeys: [], // 列表页选中的项主键
    detailListDataSource: [], // 详情页列表数据
    detailListPagination: [], // 详情页分页信息
  },
  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SINV.ASN_HEADERS_STATUS',
          cancelStatus: 'SPUC.ASN_CANCEL_STATUS',
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
    // 查询送货单审批列表
    *queryDeliveryReviewList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDeliveryReviewList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            orderList: result.content,
            listPagination: createPagination(result),
          },
        });
      }
    },
    // 送货单审批通过
    *approveDeliveryOrder({ payload }, { call }) {
      const result = getResponse(yield call(approveDeliveryOrder, payload));
      return result;
    },
    // 送货单审批拒绝
    *rejectDeliveryOrder({ payload }, { call }) {
      const result = getResponse(yield call(rejectDeliveryOrder, payload));
      return result;
    },
    // 查询送货单审批详情头信息
    *queryDetailHeader({ asnHeaderId, customizeUnitCode }, { call }) {
      const result = getResponse(yield call(queryDetailHeader, asnHeaderId, customizeUnitCode));
      return result;
    },
    // 查询送货单审批详情列表信息
    *queryDetailList({ payload }, { call }) {
      const result = getResponse(yield call(queryDetailList, payload));
      return result;
    },
    // 获取操作记录
    *fetchOperationRecordList({ payload }, { call, put }) {
      const { asnHeaderId, ...otherParams } = payload;
      const result = getResponse(yield call(fetchOperationRecordList, asnHeaderId, otherParams));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: result.content,
            operationRecordPagination: createPagination(result),
          },
        });
      }
    },
    // 获取明细头附件uuid
    *getHeaderAttachmentUuid({ data }, { call }) {
      const res = yield call(getHeaderAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },

    // 获取附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
    },

    // fetchBOM - 查询BOM数据
    *fetchBOM({ payload }, { call }) {
      const res = getResponse(yield call(fetchBOM, payload));
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
