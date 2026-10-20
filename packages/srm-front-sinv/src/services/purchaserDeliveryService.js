/*
 * purchaserDeliverySearchService - 采购方送货单
 * @date: 2018/11/15 15:58:38
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *
 *  查询送货单审批列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/for-purchase`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询送货单明细行
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryLines(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/lines/for-purchase`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 保存
 * @async
 * @function add
 * @param {object} data - 头数据
 * @returns {object} fetch Promise
 */
export async function save(params) {
  const { customizeUnitCode = '', data = {} } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/purchase/save`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: data,
  });
}
/**
 * 查询操作记录
 * @export
 * @param {Number} params
 */
export async function fetchOperationList(params) {
  const { asnHeaderId, ...other } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/action`, {
    method: 'GET',
    query: parseParameters(other),
  });
}
/**
 * 查询送货单详情
 * @export
 * @param {Number} asnHeaderId
 */
export async function queryDetailHeader({ asnHeaderId, customizeUnitCode, userCampCode }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, userCampCode },
  });
}
/**
 * 查询送货单详情行
 * @export
 * @param {Number} params
 */
export async function queryDetailLines(params) {
  const { asnHeaderId, ...other } = params;
  const query = parseParameters(other);
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/page-lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 送货单重新导入ERP
 * @export
 * @param {Object} asnHeaderList
 */
export async function reImportERP(asnHeaderList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/reimport-erp`, {
    method: 'POST',
    body: asnHeaderList,
  });
}
/**
 * 打印
 * @async
 * @param {!number} poHeaderId - 订单发运行id
 * @function print
 */
export async function print(payload) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${payload.asnHeaderId}/query-print`, {
    method: 'GET',
    responseType: 'blob',
    query: { ...payload },
  });
}

/**
 * 送货单头附件ID刷新
 * @async
 * @function getHeaderAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getHeaderAttachmentUuid(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/attachment-uuid`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 送货单行附件ID刷新
 * @async
 * @function getLineAttachmentUuid
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function getLineAttachmentUuid(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/lines/attachment-uuid`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 查询配置
 */
export async function fetchBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    method: 'GET',
    query: params,
  });
}

/* 查询导入
 * @export
 * @param {Number} params
 */
export async function fetchExectList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-inter-record`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 同步modal导入
 * @export
 * @param {Number} params
 */
export async function async(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-inter-record`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 留言板列表
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
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-messages`, {
    query,
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
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-messages`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 物流补录
 * @export
 * @param {Number} params
 */
export async function addLogistics(params, customizeUnitCode) {
  const { asnHeaderId } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/logistics`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: params,
  });
}

/**
 * 新打印
 * @async
 * @param {!number} asnHeaderIdList - 订单发运行id
 * @function newPrintList
 */
export async function newPrintList(asnHeaderIdList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/batch-print-new`, {
    method: 'POST',
    responseType: 'blob',
    body: asnHeaderIdList,
  });
}
