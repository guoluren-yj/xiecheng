import { SRM_SPUC, SRM_PLATFORM } from '_utils/config';
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 *  查询送货单取消列表的数据
 * @async
 * @function queryDeliveryCancelledList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryCancelledList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/cancel`, {
    method: 'GET',
    query,
  });
}
/**
 *  取消送货单
 * @async
 * @function cancelDeliveryOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function cancelDeliveryOrder(params) {
  const { isLineCancel, cancelOrders } = params;
  const url = isLineCancel
    ? `${SRM_SPUC}/v1/${organizationId}/asn-header/cancel-line`
    : `${SRM_SPUC}/v1/${organizationId}/asn-header/cancel`;
  return request(url, {
    method: 'POST',
    body: cancelOrders,
  });
}
/**
 *  重新同步送货单
 * @async
 * @function resyncDeliveryOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function resyncDeliveryOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/cancel/repo`, {
    method: 'POST',
    body: params,
  });
}
// /**
//  *  导出送货单
//  * @async
//  * @function exportDeliveryOrder
//  * @param {Object} params - 查询参数
//  * @param {String} params.page - 页码
//  * @param {String} params.size - 页数
//  */
// export async function exportDeliveryOrder(params) {
//   return request(`${SRM_SPUC}/v1/${organizationId}/`, {
//     method: 'POST',
//     body: params,
//   });
// }
/**
 * 送货单取消操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.tenantId - 租户Id
 * @param {String} params.poHeaderId - 头Id
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(asnHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/action`, {
    method: 'GET',
    query,
  });
}
/**
 * 送货单审批详情头信息
 * @async
 * @function queryDetailHeader
 * @param {String} poHeaderId - 订单id
 * @returns {object} fetch Promise
 */
export async function queryDetailHeader(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}`, {
    method: 'GET',
    query: { ...params },
  });
}
/**
 * 送货单审批详情列表
 * @async
 * @function queryDetailList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.tenantId - 租户Id
 * @param {String} poHeaderId - 头Id
 * @returns {object} fetch Promise
 */
export async function queryDetailList(payload) {
  const { asnHeaderId, ...params } = payload;
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/page-lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询配置中心
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
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
