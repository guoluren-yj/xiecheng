/*
 * confirmOrder - 订单确认
 * @date: 2018/10/13 11:49:14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { omit } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  searchUuid,
  fetchSettings,
  queryList,
  queryDetailList,
  queryDetailBasic,
  queryDetailOther,
  saveDetail,
  queryDetailHeader,
  queryPoItemBOM,
  newQueryPoItemBOM,
  getAttachmentuuid,
  fetchOperationRecordList,
  confirm,
  feedback,
  saveAttachmentUUID,
  confirmDetail,
  feedbackDetail,
  queryPartners,
  queryMessage,
  sendMessage,
  fetchAsnLines,
  fetchRcvRecords,
  fetchBillLines,
  fetchOldBillLines,
  fetchInvoiceLines,
  fetchOldInvoiceLines,
  print,
  fetchConfirmRuleSetting,
  fetchAssociatedConfigFlag,
  getFeedbackVerificationList,
  getFeedbackVerificationDetail,
} from '@/services/confirmOrderService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'confirmOrder',

  state: {
    orderList: [], // 调查表列表
    listPagination: {},
    selectedListRowKeys: [], // 列表页选中的项主键
    enumMap: {}, // 值集
    detail: {},
    flag: [], // 是否标识

    detailSearchList: [], // 按明细查询列表
    detailPagination: {},
    detailQuery: {}, // 按明细查询列表条件
    detailOperationQuery: {}, // 详情操作记录查询条件

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
    // 查询列表
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
    *init(params, { call, put }) {
      const enumMap =
        getResponse(
          yield call(queryMapIdpValue, {
            purchaseLineType: 'SODR.PO_LINE_TYPE',
            flag: 'HPFM.FLAG',
            orderSource: 'SPRM.SRC_PLATFORM',
            orderFields: 'SPUC.ORDER.DELIVERY.DATE',
            signStatus: 'SODR.PO_SIGN_STATUS',
            statusCodes: 'SODR.PO_STATUS',
          })
        ) || {};
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },

    // 查询列表页明细附件
    *searchUuid({ payload }, { call }) {
      const result = getResponse(yield call(searchUuid, payload));
      return result;
    },

    // 查询配置中心
    *fetchSettings(params, { call }) {
      const result = getResponse(yield call(fetchSettings));
      return result;
    },

    // 订单确认
    *sure({ payload }, { call }) {
      const { poHeaderList } = payload;
      const result = getResponse(yield call(confirm, poHeaderList));
      return result;
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
    *saveDetail({ params }, { call }) {
      const res = yield call(saveDetail, params);
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
    *newQueryPoItemBOM({ params }, { call }) {
      const res = yield call(newQueryPoItemBOM, params);
      const response = getResponse(res);
      return {
        dataSource: response || [],
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
    // 获取采购方附件
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
    *confirm({ data }, { call }) {
      const response = yield call(confirm, data);
      return getResponse(response);
    },
    *feedback({ data }, { call }) {
      const response = yield call(feedback, data);
      return getResponse(response);
    },
    // 明细页-关联单据-送货单
    *fetchAsnLines({ poLineLocationId }, { call }) {
      const res = yield call(fetchAsnLines, poLineLocationId);
      const response = getResponse(res);
      return {
        dataSource: (response || []).map((o) => ({ ...o, key: `${o.asnNum}-${o.asnLineId}` })),
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
    *confirmDetail({ payload }, { call }) {
      const response = yield call(confirmDetail, payload);
      return getResponse(response);
    },
    *feedbackDetail({ payload }, { call }) {
      const response = yield call(feedbackDetail, payload);
      return getResponse(response);
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
    *fetchConfirmRuleSetting(params, { call }) {
      const result = getResponse(yield call(fetchConfirmRuleSetting));
      return result;
    },
    *fetchAssociatedConfigFlag({ payload }, { call }) {
      const result = getResponse(yield call(fetchAssociatedConfigFlag, payload));
      return result;
    },
    // 列表页反馈/确认校验
    *getFeedbackVerificationList({ payload }, { call }) {
      const res = yield call(getFeedbackVerificationList, payload);
      return res;
    },
    // 详情页反馈/确认校验
    *getFeedbackVerificationDetail({ payload }, { call }) {
      const res = yield call(getFeedbackVerificationDetail, payload);
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
