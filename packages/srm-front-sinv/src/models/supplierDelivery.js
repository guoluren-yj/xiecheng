/**
 * supplierDelivery - 供应商送货单
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  reImportERP,
  queryDeliveryList,
  queryDeliveryLines,
  queryDetailHeader,
  fetchOperationList,
  queryDetailLines,
  addLogistics,
  print,
  printList,
  fetchBOM,
  getHeaderAttachmentUuid,
  getLineAttachmentUuid,
  queryMessage,
  sendMessage,
  newPrintList,
  getLabelPermission,
} from '@/services/supplierDeliveryService';
import { save } from '@/services/purchaserDeliveryService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'supplierDelivery',
  state: {
    deliveryList: [], // 配送单列表
    listPagination: {}, // 配送单列表分页
    actionHistoryPagination: {}, // 详情页面的操作记录分页
    actionHistoryList: [], // 详情页面的操作记录列表
    selectedListRowKeys: [], // 列表页选中的项主键
    enumMap: {}, // 值集

    deliveryDetailList: [], // 行明细列表
    detailListPagination: {},
  },
  effects: {
    // 保存
    *save({ payload }, { call }) {
      const response = getResponse(yield call(save, payload));
      return response;
    },
    // 查询值集
    *fetchEnum(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          flag: 'HPFM.FLAG',
          type: 'SINV.ASN_TYPE',
          status: 'SINV.ASN_HEADERS_STATUS',
          importStatus: 'SINV.ASN.SUBMIT_TO_ERP_STATUS',
          receiveStatus: 'SINV.ASN.LNS_RECEIVE_STATUS',
          cancelStatus: 'SPUC.ASN_CANCEL_STATUS',
          printStatus: 'SPUC.ASN_PRINT_FLAG',
          phone: 'HPFM.IDD',
          logicStatus: 'SINV.ASN_LOGISTICS_STATUS',
          trxDataRangeList: 'SPUC.SINV_DATE_DEFAULT',
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
    // 查询列表
    *queryDeliveryList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDeliveryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            deliveryList: result.content,
            listPagination: createPagination(result),
          },
        });
      }
    },
    // 明细行查询
    *queryDeliveryDetailList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDeliveryLines, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            deliveryDetailList: result.content,
            detailListPagination: createPagination(result),
          },
        });
        return result;
      }
    },
    // 查询头明细
    *queryDetailHeader({ asnHeaderId, customizeUnitCode, userCampCode }, { call }) {
      const res = getResponse(
        yield call(queryDetailHeader, { asnHeaderId, customizeUnitCode, userCampCode })
      );
      return res;
    },
    // 查询行列表
    *queryDetailLines({ payload }, { call }) {
      const res = getResponse(yield call(queryDetailLines, payload));
      return res;
    },
    // 送货单重新导入ERP
    *reImportERP({ data }, { call }) {
      const res = yield call(reImportERP, [data]);
      return getResponse(res);
    },
    // 查询操作记录
    *fetchOperationList({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperationList, payload));
      return res;
    },
    // 物流补录
    *addLogistics({ payload, customizeUnitCode }, { call }) {
      const res = getResponse(yield call(addLogistics, payload, customizeUnitCode));
      return res;
    },
    // 获取采购方附件
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },

    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
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
    // 打印
    *printList({ asnHeaderIdList, activeKey }, { call }) {
      const res = getResponse(yield call(printList, asnHeaderIdList, activeKey));
      return res;
    },
    // 打印
    *newPrintList({ asnHeaderIdList }, { call }) {
      const res = getResponse(yield call(newPrintList, asnHeaderIdList));
      return res;
    },
    // 送货单打印
    *print({ payload }, { call }) {
      const res = getResponse(yield call(print, payload));
      return res;
    },

    // fetchBOM - 查询BOM数据
    *fetchBOM({ payload }, { call }) {
      const res = getResponse(yield call(fetchBOM, payload));
      return res;
    },
    // 查询留言板信息
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
    // 获取标签打印权限接口
    *getLabelPermission({ payload }, { call }) {
      const { data } = payload;
      const res = yield call(getLabelPermission, data);
      return getResponse(res);
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
