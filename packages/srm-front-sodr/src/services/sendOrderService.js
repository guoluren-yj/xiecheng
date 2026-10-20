/*
 * sendOrderService - 我发出的订单
 * @date: 2018/10/13 11:44:47
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { HZERO_FILE } from 'utils/config';
import { SRM_SPUC, SRM_PLATFORM, SRM_FINANCE, SRM_SLOD } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询我发出的订单列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function querySendOrderList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/purchaser`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/*
 * 增加弱校验
 * @async
 * @function addNewSubmitDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function addNewSubmitDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/save-warn`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 列表加急
 * @async
 * @function listUrgent
 * @param {[Number]} poHeaders - 要加急的头列表
 * @returns {object} fetch Promise
 */
export async function listUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/urgent`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 列表取消加急
 * @async
 * @function listCancelUrgent
 * @param {[Number]} poHeaders - 要取消加急的头列表
 * @returns {object} fetch Promise
 */
export async function listCancelUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 按订单发运行查询 - 采购方
 * @async
 * @function querySendDetailList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {!number} organizationId - 组织ID
 */
export async function querySendDetailList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/purchaser`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 采购订单头明细查询
 * @async
 * @function queryDetailHeader
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailHeader(poHeaderId, customizeUnitCode) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/detail`, {
    query: {
      camp: 1,
      customizeUnitCode,
    },
  });
}

/**
 * 订单行基本信息
 * @async
 * @function queryDetailBasic
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailBasic(poHeaderId, params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/basic`, {
    query: {
      camp: 1,
      ...params,
    },
  });
}

/**
 * 订单行其他信息
 * @async
 * @function queryDetailOther
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailOther(poHeaderId, params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/other`, {
    query: {
      camp: 1,
      ...params,
    },
  });
}

/**
 * 发运行加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发运单取消加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailCancelUrgent(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-location/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存订单
 * @async
 * @function saveDetail
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function saveDetail(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/purchase/save`, {
    method: 'PUT',
    body: params.data,
    query: {
      customizeUnitCode: params.customizeUnitCode,
    },
  });
}

export async function exportErp(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/exportErp`, {
    method: 'POST',
    body: data,
  });
}

export async function exportToErp(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/export-to-erp/approve/batch`, {
    method: 'POST',
    body: data,
  });
}

export async function exportToErpAgain(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/delivery-export-erp`, {
    method: 'POST',
    body: data,
  });
}

export async function exportToChangeErp(params) {
  const { poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-sync/change/${poHeaderId}`, {
    method: 'POST',
    responseType: 'text',
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function fetchActionHistoryList
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(poHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`, {
    method: 'GET',
    query,
  });
}

export async function fetchApproveRecordList(params) {
  // const { poHeaderId, ...query } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-records/list-history-approval`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取uuid
 * @async
 * @function getAttachmentuuid
 * @param {!number} organizationId - 组织ID
 * @returns {string} fetch Promise
 */
export async function getAttachmentuuid() {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/uuid`, {
    method: 'POST',
  });
}

/**
 * 查询相关的poItemBom
 * @async
 * @function queryPoItemBOM
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @param {String} params.poLineId - 采购订行ID
 * @param {String} params.poLineLocationId - 采购订行ID
 * @returns {object} fetch Promise
 */
export async function queryPoItemBOM(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    query,
  });
}

/**
 * 新Bom查询Api
 * @async
 * @function newQueryPoItemBOM
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @param {String} params.poLineId - 采购订行ID
 * @returns {object} fetch Promise
 */
export async function newQueryPoItemBOM(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms/query`, {
    query,
  });
}

/**
 * 获取修改记录列表
 * @async
 * @function fetchChangedHistoryList
 * @param {!number} organizationId - 组织ID
 * @param {!number} poHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchChangedHistoryList(params) {
  const { page, size, poHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-records/${poHeaderId}/paging`, {
    method: 'GET',
    query: { page, size },
  });
}

/**
 * 获取操作记录列表
 * @async
 * @function saveAttachmentUUID
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/attachmentUUID`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 采购订单行明细查询
 * @async
 * @function queryDetailList
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryDetailList(poHeaderId, params) {
  const query = { ...filterNullValueObject(parseParameters(params)), camp: 1, sortType: 0 };
  return request(`${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`, {
    query,
  });
}

/**
 * 分页查询采购订单合作方
 * @async
 * @function queryDetailList
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryPartners(poHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/partners`, {
    query,
  });
}

/**
 * 采购订单留言板列表
 * @async
 * @function queryMessage
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.poHeaderId - 采购订单头ID
 * @returns {object} fetch Promise
 */
export async function queryMessage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    query,
  });
}

/**
 * 撤回留言
 * @async
 * @function saveAttachmentUUID
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function recallMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 创建留言
 * @async
 * @function saveAttachmentUUID
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function sendMessage(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-messages`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 采购订单详情页-关联单据-交货计划
 * @async
 * @function fetchDeliveryLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchDeliveryLines(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/plans/from-supplier/poLineLocationId`, {
    query: filterNullValueObject(params),
  });
}

/**
 * 采购订单详情页-关联单据-送货单
 * @async
 * @function fetchAsnLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchAsnLines(poLineLocationId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-lines/${poLineLocationId}/es-asn-lines`);
}

/**
 * 采购订单详情页-关联单据-送货单(新)
 * @async
 * @function fetchAsnLinesNew
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchAsnLinesNew(poLineLocationId) {
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/asn/link-line/po/${poLineLocationId}`);
}

/**
 * 采购订单详情页-关联单据-收货记录
 * @async
 * @function fetchRcvRecords
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchRcvRecords(poLineLocationId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-trx-line/po-rcv-records`, {
    method: 'POST',
    query: { poLineLocationId },
  });
}
/**
 * 采购订单详情页-关联单据-对账单
 * @async
 * @function fetchBillLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchBillLines(params) {
  return request(`/ssta/v1/${organizationId}/bill-lines/purchaser`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 采购订单详情页-关联单据-老对账单
 * @param {*} poLineLocationId
 */
export async function fetchOldBillLines(poLineLocationId, params) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/bill-lines/remote/po-line-location/detail/${poLineLocationId}`,
    {
      method: 'GET',
      query: filterNullValueObject(params),
    }
  );
}

/**
 * 采购订单详情页-关联单据-网上发票
 * @async
 * @function fetchInvoiceLines
 * @param {!number} poLineLocationId - 订单发运行id
 * @returns {object} fetch Promise
 */
export async function fetchInvoiceLines(params) {
  return request(`/ssta/v1/${organizationId}/settle-lines/purchaser`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}

/**
 * 采购订单详情页-关联单据-老网上发票
 * @param {*} poLineLocationId
 */
export async function fetchOldInvoiceLines(poLineLocationId) {
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/invoice-line/po-line-location/${poLineLocationId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function print(poHeaderId) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/print`, {
    method: 'GET',
    responseType: 'blob',
  });
}

/**
 * 打印
 * @async
 * @param {!number} poHeaderIdList - 订单发运行id
 * @function printList
 */
export async function printList(poHeaderIdList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch/print`, {
    method: 'POST',
    responseType: 'blob',
    body: poHeaderIdList,
  });
}

/**
 * 查询订单评价
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function queryOrderEvaluation(params) {
  const { poHeaderId, ...others } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-evaluations/${poHeaderId}/detail`, {
    query: parseParameters(others),
    method: 'GET',
  });
}
/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}

/**
 * 选择批量打印
 */
export async function printSelectedList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/batch/print`, {
    method: 'POST',
    body: params,
    responseType: 'blob',
  });
}

/**
 * 获取业务规则定义-【是否启用新结算平台】设置值
 */
export async function fetchAssociatedConfigFlag() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/enable/budget`, {
    method: 'GET',
  });
}
