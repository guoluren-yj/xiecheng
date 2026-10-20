/*
 * 订单发布
 * @date: 2018/10/13 11:49:14
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { omit } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  saveAttachmentUUID,
  queryOrderSignList as queryOrderReleaseList,
  publish,
  getVerifyCode,
  queryDetailList,
  queryDetailHeader,
  queryPartners,
  detailPublish,
  queryPoItemBOM,
  newQueryPoItemBOM,
  fetchOperationRecordList,
  fetchAsnLines,
  fetchAsnLinesNew,
  fetchRcvRecords,
  fetchBillLines,
  querySealPictures,
  fetchOldBillLines,
  fetchInvoiceLines,
  fetchVerifyPhoneNum,
  fetchOldInvoiceLines,
  fetchAssociatedConfigFlag,
  confirmChapter,
  confirmMobileChapter,
} from '@/services/orderReleaseService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'orderSign',

  state: {
    orderList: [], // 订单发布列表
    listPagination: {},
    selectedListRowKeys: [], // 列表页选中的项主键
    erpStatus: [], // erp状态
    detail: {},
    flag: [], // 是否标识

    detailSearchList: [], // 按明细查询列表
    detailPagination: {},
    detailQuery: {}, // 按明细查询列表条件
    detailOperationQuery: {}, // 详情头操作记录查询条件

    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    enumMap: {}, // 值集
    // asnLines: [], // 详情页-关联单据-送货单
    // rcvLines: [], // 详情页-关联单据-收货记录
    // billLines: [], // 详情页-关联单据-对账单
    // invoiceLines: [], // 详情页-关联单据-网上发票
  },

  effects: {
    // 查询列表
    *queryOrderReleaseList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryOrderReleaseList, payload));
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
    *queryOrderReleaseListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(queryOrderReleaseList, { ...payload, onlyCountFlag: 'Y' })
      );
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
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          purchaseLineType: 'SODR.PO_LINE_TYPE',
          erpStatus: 'SODR.ERP_STATUS',
          orderSource: 'SPRM.SRC_PLATFORM',
          excessOrderType: 'SMDM.ALLOW_EXCESS_ORDER_TYPE',
          flag: 'HPFM.FLAG',
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
    *publish({ payload }, { call }) {
      const data = yield call(publish, payload);
      return getResponse(data);
    },
    // 订单明细
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
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 保存与附件关联的附件uuid
    *saveAttachmentUUID({ payload }, { call }) {
      const res = yield call(saveAttachmentUUID, payload);
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
    *queryPartners({ poHeaderId, params }, { call }) {
      const res = yield call(queryPartners, poHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *detailPublish({ data }, { call }) {
      const response = yield call(detailPublish, data);
      return getResponse(response);
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
    *fetchAssociatedConfigFlag({ payload }, { call }) {
      const result = getResponse(yield call(fetchAssociatedConfigFlag, payload));
      return result;
    },

    // -查询印章图片
    *fetchSealPictures({ payload }, { call }) {
      const response = getResponse(yield call(querySealPictures, payload));
      return response;
    },

    // 查询实名认证手机号
    *fetchVerifyPhoneNum({ payload }, { call }) {
      const response = getResponse(yield call(fetchVerifyPhoneNum, payload));
      return response;
    },

    // 获取手机验证码
    *getVerifyCode({ payload }, { call }) {
      const response = getResponse(yield call(getVerifyCode, payload));
      return response;
    },

    // 手机验证签章
    *confirmMobileChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmMobileChapter, payload));
      return response;
    },

    // 无手机验证签章
    *confirmChapter({ payload }, { call }) {
      const response = getResponse(yield call(confirmChapter, payload));
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
