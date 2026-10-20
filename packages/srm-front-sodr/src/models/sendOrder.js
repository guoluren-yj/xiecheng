/*
 * sendOrder - 我发出的订单
 * @date: 2018/10/13 11:43:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { omit } from 'lodash';
import {
  createPagination,
  getResponse,
  getCurrentOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
import {
  querySendOrderList,
  querySendDetailList,
  listUrgent,
  listCancelUrgent,
  queryDetailHeader,
  detailUrgent,
  detailCancelUrgent,
  queryDetailList,
  queryDetailBasic,
  queryDetailOther,
  saveDetail,
  exportToErp,
  exportToErpAgain,
  exportToChangeErp,
  fetchOperationRecordList,
  fetchApproveRecordList,
  getAttachmentuuid,
  queryPoItemBOM,
  newQueryPoItemBOM,
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
  printSelectedList,
  queryOrderEvaluation,
  fetchSettings,
  exportErp,
  fetchAssociatedConfigFlag,
  addNewSubmitDetail,
} from '@/services/sendOrderService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';
import uuid from 'uuid/v4';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'sendOrder',

  state: {
    orderList: [], // 调查表列表
    listPagination: {},
    detailPagination: {},
    enumMap: {}, // 值集
    detail: {},
    currentLi: undefined,
    treeFields: {},
    leftVisible: true, // 左边状态树显隐
    listQuery: {},
    detailQuery: {}, // 详情查询条件
    detailOperationQuery: {}, // 详情头操作记录查询条件

    detailSearchList: [], // 按明细查询列表
    detailSearchPagination: {},
    detailSearchQuery: {}, // 按明细查询列表条件

    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表

    changedHistoryPagination: {}, // 修改记录分页
    changedHistoryList: [], // 修改记录列表

    radioTab: 'list', // 列表页标签key
    radioTabInitFlag: false, // 标签首次初始化标识
    // asnLines: [], // 详情页-关联单据-送货单
    // rcvLines: [], // 详情页-关联单据-收货记录
    // billLines: [], // 详情页-关联单据-对账单
    // invoiceLines: [], // 详情页-关联单据-网上发票
  },

  effects: {
    // 查询列表
    *querySendOrderList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const { sort } = otherParams;
      const result = getResponse(yield call(querySendOrderList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: filterNullValueObject(otherParams),
            // listQuery: otherParams,
            // orderList: result.content,
            listPagination: createPagination(result),
            listSort: sort?.field === 'displayPoNum' ? sort : null,
          },
        });
      }
      return result;
    },
    // 查询列表(count)
    *querySendOrderListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(querySendOrderList, { ...payload, onlyCountFlag: 'Y' })
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
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          purchaseLineType: 'SODR.PO_LINE_TYPE',
          erpStatus: 'SODR.ERP_STATUS',
          flag: 'HPFM.FLAG',
          orderSource: 'SPRM.SRC_PLATFORM',
          docSource: 'SODR.DOC_SOURCE',
          signStatus: 'SODR.PO_SIGN_STATUS',
          tenantId,
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
    // 新增弱校验接口
    *addNewSubmitDetail({ payload }, { call }) {
      const res = getResponse(yield call(addNewSubmitDetail, payload));
      return res;
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

    // 获取明细界面列表数据
    *fetchDetailSearchList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const { sort } = otherParams;
      const result = getResponse(yield call(querySendDetailList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailQuery: filterNullValueObject(otherParams),
            // detailSearchList: result.content,
            detailPagination: createPagination(result),
            detailSort: sort?.field === 'displayPoNum' ? sort : null,
          },
        });
      }
      return result;
    },
    // 获取明细界面列表数据(count)
    *fetchDetailSearchListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(querySendDetailList, { ...payload, onlyCountFlag: 'Y' })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: { detailPagination: createPagination(result) },
        });
      }
      return result;
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
    *queryDetailHeader({ poHeaderId, customizeUnitCode }, { call }) {
      const res = getResponse(yield call(queryDetailHeader, poHeaderId, customizeUnitCode));
      return res;
    },
    *queryDetailList({ payload }, { call }) {
      const { poHeaderId, ...params } = payload;
      const res = yield call(queryDetailList, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryDetailBasic({ poHeaderId, params }, { call }) {
      const res = yield call(queryDetailBasic, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryDetailOther({ poHeaderId, params }, { call }) {
      const res = yield call(queryDetailOther, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *saveDetail({ payload }, { call }) {
      const res = getResponse(yield call(saveDetail, payload));
      return res;
    },
    *exportErp({ data }, { call }) {
      const res = getResponse(yield call(exportErp, data));
      return res;
    },
    *exportToErp({ data }, { call }) {
      const res = getResponse(yield call(exportToErp, data));
      return res;
    },
    *exportToErpAgain({ data }, { call }) {
      const res = getResponse(yield call(exportToErpAgain, data));
      return res;
    },
    *exportToChangeErp({ payload }, { call }) {
      const res = getResponse(yield call(exportToChangeErp, payload));
      return res;
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
    },
    // 获取附件uuid
    *getAttachmentuuid({ payload }, { call }) {
      const res = getResponse(yield call(getAttachmentuuid, payload));
      return res;
    },
    // 获取采购方附件
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
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
    // 明细页-关联单据-交货计划
    *fetchDeliveryLines({ payload }, { call }) {
      const res = yield call(fetchDeliveryLines, payload);
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
        dataSource: response.content || [],
      };
    },
    // 明细页-关联单据-老对账单
    *fetchOldBillLines({ poLineLocationId, params }, { call }) {
      const res = yield call(fetchOldBillLines, poLineLocationId, params);
      const response = getResponse(res);
      return {
        dataSource: response.content || [],
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
      const res = getResponse(yield call(saveAttachmentUUID, payload));
      return res;
    },
    *queryPartners({ poHeaderId, params }, { call }) {
      const res = yield call(queryPartners, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
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
    *print({ poHeaderId }, { call }) {
      const res = getResponse(yield call(print, poHeaderId));
      return res;
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
    *queryOrderEvaluation({ payload }, { call }) {
      const response = getResponse(yield call(queryOrderEvaluation, payload));
      return response;
    },
    *fetchSettings({ payload }, { call }) {
      const result = getResponse(yield call(fetchSettings, payload));
      return result;
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
