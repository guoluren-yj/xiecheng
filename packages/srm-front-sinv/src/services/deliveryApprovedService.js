/*
 *
 * @date: 2018/11/13 16:55:45
 * @author: FQL <qilin.feng@hand-china.com>
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
 * @async
 * @function queryDeliveryApprovedList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryDeliveryApprovedList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/approve`, {
    method: 'GET',
    query,
  });
}
/**
 *  送货单审批通过
 * @async
 * @function approveDeliveryOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function approveDeliveryOrder(params) {
  const { customizeUnitCode = '', ...data } = params[0];
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/approve/pass?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: customizeUnitCode ? [data] : params,
    }
  );
}
/**
 *  送货单审批拒绝
 * @async
 * @function rejectDeliveryOrder
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function rejectDeliveryOrder(params) {
  const { customizeUnitCode = '', ...data } = params[0];
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/approve/reject?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: customizeUnitCode ? [data] : params,
    }
  );
}
/**
 * 送货单审批操作记录列表
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
