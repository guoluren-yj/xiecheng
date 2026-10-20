/**
 * supplierDeliveryService - 供应商送货单
 * @date: 2018-12-07
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *  查询供应商送货单列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/for-supplier`, {
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
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/lines/for-supplier`, {
    method: 'GET',
    query: parseParameters(params),
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
 * 查询送货单详情
 * @export
 * @param {Number} params
 */
export async function queryDetailHeader({ asnHeaderId, customizeUnitCode, userCampCode }) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode, userCampCode },
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
 * 查询审批记录
 * @export
 * @param {Number} params
 */
export async function fetchApproveRecord(params) {
  const { asnHeaderId } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/list-history-approval?asnHeaderId=${asnHeaderId}`,
    {
      method: 'GET',
    }
  );
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
 * 打印
 * @async
 * @param {!number} asnHeaderIdList - 订单发运行id
 * @function printList
 */
export async function printList(asnHeaderIdList) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/batch/print`, {
    method: 'POST',
    responseType: 'blob',
    body: asnHeaderIdList,
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

/**
 * 送货单打印
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

/**
 * 留言板列表
 * @async
 * @function queryMessage
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.asnHeaderId - 采购订单头ID
 * @returns {object} fetch Promise
 */
export async function queryMessage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-messages`, {
    query,
  });
}

export async function getSupplierMessage(params) {
  const query = filterNullValueObject(params);
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

// 获取标签权限
export async function getLabelPermission(data) {
  return request(`/iam/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: data,
  });
}
