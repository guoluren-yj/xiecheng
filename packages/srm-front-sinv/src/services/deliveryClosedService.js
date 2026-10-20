import { SRM_SPUC } from '_utils/config';
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 *
 *  查询送货单关闭列表的数据
 * @async
 * @function queryDeliveryClosedList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryClosedList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/close`, {
    method: 'GET',
    query,
  });
}
/**
 *  关闭送货单
 * @async
 * @function closeDeliveryOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function closeDeliveryOrder(params) {
  const { customizeUnitCode = '', data } = params;
  const { deliveryList, asnLineList, ...others } = data;
  const url = deliveryList
    ? `${SRM_SPUC}/v1/${organizationId}/asn-header/close-line?customizeUnitCode=${customizeUnitCode}&needUpdate=true`
    : `${SRM_SPUC}/v1/${organizationId}/asn-header/close?customizeUnitCode=${customizeUnitCode}&needUpdate=true`;
  return request(url, {
    method: 'POST',
    body: deliveryList ? asnLineList : [{ ...others, asnLineList }],
  });
}
/**
 *  关闭列表界面送货单
 * @async
 * @function closeDeliveryListOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function closeDeliveryListOrder(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/close`, {
    method: 'POST',
    body: params,
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
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/close/repo`, {
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
 * 送货单关闭操作记录列表
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
export async function queryDetailHeader(asnHeaderId, customizeUnitCode) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}`, {
    method: 'GET',
    query: { asnHeaderId, customizeUnitCode },
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
 * 查询配置
 */
export async function fetchBOM(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-item-boms`, {
    method: 'GET',
    query: params,
  });
}
