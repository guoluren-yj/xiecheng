/**
 * index -创建预付款申请
 * @date: 2020-03-13
 * @author zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询列表数据
export async function listSettle(params) {
  const { type, ...query } = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/creation-list`, {
    method: 'GET',
    query,
  });
}

/**
 * 预付款申请列表-提交
 * @async
 * @function handleSubmitList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function handleSubmitList(data) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/advance/batch-submit`, {
    method: 'POST',
    body: data,
  });
}

// 预付款申请明细-查询明细头
export async function handleSearchHeader(params) {
  const { paymentHeaderId, ...query } = parseParameters(params);
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/query-header/${paymentHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}
// 预付款申请明细-查询明细行
export async function fetchInvoiceLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/${paymentHeaderId}/lines`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 预付款申请明细-保存
 * @async
 * @function saveList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function saveList(data) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/advance-save`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 预付款申请明细-提交
 * @async
 * @function handleSubmit
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function handleSubmit(data) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/advance/submit`, {
    method: 'POST',
    body: data,
  });
}

/**
 *
 *  预付款申请明细-删除-明细头
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteHeader(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *
 * 预付款申请明细- 新建列表数据
 * @export
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function fetchModalList(params) {
  const { paymentHeaderId, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines/${paymentHeaderId}/add-order`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 *
 * 预付款申请明细-删除行
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteList(params) {
  const { body } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-advance-lines`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/attachment-uuid`, {
    method: 'POST',
    query,
  });
}

/**
 * 查询操作记录
 * @param {Object} params - 请求参数
 */
export async function fetchOperationRecordList(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-actions/${paymentHeaderId}/page`, {
    method: 'GET',
    query,
  });
}

// 查询供应商lov
export async function fetchSupplierLov(params) {
  return request(`${SRM_FINANCE}/v1/${params.tenantId}/payment-headers/supplier-company`, {
    method: 'GET',
    query: params,
  });
}
