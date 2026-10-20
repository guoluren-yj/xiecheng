/*
 * deliveryDateReview - 交期审核
 * @date: 2018/10/13 11:43:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { omit } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  agree,
  reject,
  queryDetail,
  queryDetailList,
  queryDetailBasic,
  queryDetailOther,
  saveDetail,
  queryDetailHeader,
  queryPoItemBOM,
  getAttachmentuuid,
  fetchOperationRecordList,
  fetchApproveRecordList,
  saveAttachmentUUID,
  queryPartners,
  queryMessage,
  sendMessage,
  fetchAsnLines,
  fetchAsnLinesNew,
  fetchRcvRecords,
  fetchBillLines,
  fetchOldBillLines,
  fetchInvoiceLines,
  fetchOldInvoiceLines,
  print,
  lineReject,
  lineAgree,
  queryCollByLine,
  fetchAssociatedConfigFlag,
} from '@/services/deliveryDateReviewService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'deliveryDateReview',

  state: {
    orderList: [], // 调查表列表
    listPagination: {},
    detailPagination: {},
    selectedListRowKeys: [], // 列表页选中的项主键
    enumMap: {}, // 值集
    detail: {},

    detailSearchList: [], // 按明细查询列表
    detailSearchPagination: {},
    detailSearchQuery: {}, // 按明细查询列表条件
    detailSelectedRowsList: [], // 加急勾选
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
            orderList: result.content,
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
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          purchaseLineType: 'SODR.PO_LINE_TYPE',
          erpStatus: 'SODR.ERP_STATUS',
          flag: 'HPFM.FLAG',
          orderSource: 'SPRM.SRC_PLATFORM',
          signStatus: 'SODR.PO_SIGN_STATUS',
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
    // 订单同意
    *agree({ payload }, { call }) {
      const res = yield call(agree, payload);
      return getResponse(res);
    },
    // 订单同意
    *reject({ payload }, { call }) {
      const res = yield call(reject, payload);
      return getResponse(res);
    },
    // 订单反馈审核明细列表查询
    *queryDetail({ payload }, { call, put }) {
      const result = yield call(queryDetail, payload);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: result.content.map((i) => ({ ...i, _status: 'update' })),
            detailPagination: createPagination(result),
          },
        });
      }
      return getResponse(result);
    },
    // 订单反馈审核明细列表查询(count)
    *queryDetailPage({ payload }, { call, put }) {
      const result = yield call(queryDetail, { ...payload, onlyCountFlag: 'Y' });
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailPagination: createPagination(result),
          },
        });
      }
    },
    *queryDetailHeader({ payload }, { call }) {
      const { poHeaderId, ...params } = payload;
      const res = yield call(queryDetailHeader, poHeaderId, params);
      return getResponse(res);
    },
    *queryDetailList({ payload }, { call }) {
      const { poHeaderId, ...params } = payload;
      const res = yield call(queryDetailList, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    *queryDetailBasic({ poHeaderId, params }, { call }) {
      const res = yield call(queryDetailBasic, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    *queryDetailOther({ poHeaderId, params }, { call }) {
      const res = yield call(queryDetailOther, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
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
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = yield call(removeFileOrg, payload);
      return getResponse(response);
    },
    // 获取附件uuid
    *getAttachmentuuid({ payload }, { call }) {
      const res = yield call(getAttachmentuuid, payload);
      return getResponse(res);
    },
    // 获取附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = yield call(queryFileListOrg, payload);
      return getResponse(res);
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
    *fetchApproveRecordList({ payload }, { call }) {
      const res = getResponse(yield call(fetchApproveRecordList, payload));
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
          (deliveryStrategyId ? response.asnDetailLineVOS.content : response) || []
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
        dataSource: response.content || [],
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
    // 保存与附件关联的附件uuid
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
      return getResponse(res);
    },
    *queryPartners({ poHeaderId, params }, { call }) {
      const res = yield call(queryPartners, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    *queryMessage({ params }, { call }) {
      const res = yield call(queryMessage, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content,
        pagination: createPagination(response || {}),
      };
    },
    *sendMessage({ data }, { call }) {
      const res = yield call(sendMessage, data);
      return getResponse(res);
    },
    *print({ poHeaderId }, { call }) {
      const res = getResponse(yield call(print, poHeaderId));
      return res;
    },
    *lineReject({ payload }, { call }) {
      const res = yield call(lineReject, payload);
      return getResponse(res);
    },
    *lineAgree({ payload }, { call }) {
      const res = yield call(lineAgree, payload);
      return getResponse(res);
    },
    *queryCollByLine({ payload }, { call }) {
      return getResponse(yield call(queryCollByLine, payload));
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
