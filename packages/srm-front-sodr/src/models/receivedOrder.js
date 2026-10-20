/*
 * receivedOrder - 我收到的订单
 * @date: 2018/10/13 11:49:14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { omit } from 'lodash';
import { createPagination, getResponse, filterNullValueObject } from 'utils/utils';
import {
  queryReceivedOrderList,
  queryReceivedDetailList,
  queryDetailBasic,
  queryDetailOther,
  // saveDetail,
  queryDetailHeader,
  queryDetailList,
  queryPoItemBOM,
  newQueryPoItemBOM,
  getAttachmentuuid,
  fetchOperationRecordList,
  // fetchChangedHistoryList,
  saveAttachmentUUID,
  queryPartners,
  queryMessage,
  sendMessage,
  fetchDeliveryLines,
  fetchAsnLines,
  fetchAsnLinesNew,
  fetchRcvRecords,
  fetchBillLines,
  fetchOldBillLines,
  fetchInvoiceLines,
  fetchOldInvoiceLines,
  print,
  printList,
  queryOrderEvaluation,
  fetchSettings,
  submitAfterConfirmr,
  fetchConfirmRuleSetting,
  printSelectedList,
  fetchAssociatedConfigFlag,
  confirmOrder,
} from '@/services/receivedOrderService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';
import uuid from 'uuid/v4';

export default {
  namespace: 'receivedOrder',

  state: {
    orderList: [], // 调查表列表
    listPagination: {},
    listQuery: {}, // 列表查询条件
    enumMap: {},
    detail: {},
    currentLi: null, // 缓存当前li的值
    treeFields: {}, // 缓存当前tree的值
    leftVisible: true,

    detailSearchList: [], // 按明细查询列表
    detailPagination: {},
    detailQuery: {}, // 按明细查询列表条件
    detailOperationQuery: {}, // 详情头操作记录查询条件
    // detailSelectedRowsList: [], // 勾选

    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表

    radioTab: 'list', // 列表页标签key
    radioTabInitFlag: false, // 标签首次初始化标识

    // asnLines: [], // 详情页-关联单据-送货单
    // rcvLines: [], // 详情页-关联单据-收货记录
    // billLines: [], // 详情页-关联单据-对账单
    // invoiceLines: [], // 详情页-关联单据-网上发票
  },

  effects: {
    // 查询列表
    *queryReceivedOrderList({ payload }, { call, put }) {
      const { page, ...listQuery } = payload;
      const result = getResponse(yield call(queryReceivedOrderList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery,
            // orderList: result.content,
            listPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 查询列表(count)
    *queryReceivedOrderListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(queryReceivedOrderList, { ...payload, onlyCountFlag: 'Y' })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            listPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 初始化值集查询
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
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || [],
        },
      });
    },

    *fetchDetailSearchList({ payload }, { call, put }) {
      const { page, ...detailQuery } = payload;
      const result = getResponse(yield call(queryReceivedDetailList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailQuery: filterNullValueObject(detailQuery),
            // detailSearchList: result.content,
            detailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchDetailSearchListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(queryReceivedDetailList, { ...payload, onlyCountFlag: 'Y' })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *queryDetailHeader({ poHeaderId, customizeUnitCode }, { call }) {
      const res = yield call(queryDetailHeader, poHeaderId, customizeUnitCode);
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
    // *saveDetail({ data }, { call }) {
    //   const res = yield call(saveDetail, data);
    //   return getResponse(res);
    // },
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
    // 明细页-关联单据-交货计划
    *fetchDeliveryLines({ poLineLocationId }, { call }) {
      const res = yield call(fetchDeliveryLines, poLineLocationId);
      const response = getResponse(res);
      return {
        dataSource: (response || []).map((o) => ({ ...o, dscKey: `${uuid()}-${o.planId}` })),
      };
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
    *fetchOldBillLines({ poLineLocationId, params }, { call }) {
      const res = yield call(fetchOldBillLines, poLineLocationId, params);
      const response = getResponse(res);
      return {
        dataSource: response?.content || [],
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

    /**
     * 保存与附件关联的附件uuid
     */
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
      return getResponse(res);
    },

    // 打印
    *printList({ poHeaderIdList }, { call }) {
      const res = getResponse(yield call(printList, poHeaderIdList));
      return res;
    },
    // 选择打印
    *printSelectedList({ poHeaderIdList }, { call }) {
      const res = getResponse(yield call(printSelectedList, poHeaderIdList));
      return res;
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
    *queryOrderEvaluation({ payload }, { call }) {
      const response = getResponse(yield call(queryOrderEvaluation, payload));
      return response;
    },
    *fetchSettings({ payload }, { call }) {
      const result = getResponse(yield call(fetchSettings, payload));
      return result;
    },
    *submitAfterConfirmr({ payload }, { call }) {
      const res = getResponse(yield call(submitAfterConfirmr, payload));
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
    *confirmOrder({ payload }, { call }) {
      const result = getResponse(yield call(confirmOrder, payload));
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
