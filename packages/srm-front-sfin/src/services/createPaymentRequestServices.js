/**
 * index -创建一般付款申请
 * @date: 2019-12-11
 * @author zuoxaingyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询列表数据
export async function searchList(params) {
  const { type, ...query } = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/creation-list`, {
    method: 'GET',
    query,
  });
}

// 查询明细头数据
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

// 查询发票行信息
export async function fetchInvoiceLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line/${paymentHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 *
 * 查询发票行 - 新建列表数据
 * @export
 * @param {Number} params.organizationId 租户Id
 * @returns
 */
export async function fetchModalList(params) {
  const { paymentHeaderId, ...other } = params;
  const interfaceName = `${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line-new/${paymentHeaderId}`;
  const param = filterNullValueObject(parseParameters(other));
  return request(interfaceName, {
    method: 'GET',
    query: param,
  });
}

/**
 * 明细保存
 * @async
 * @function saveList
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function saveList(data) {
  const { customizeUnitCode } = data;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 * 提交保存
 * @async
 * @function handleSubmit
 * @param {!number} organizationId - 组织ID
 * @param {object} data - 数据
 * @returns {object} fetch Promise
 */
export async function handleSubmit(data) {
  const { customizeUnitCode } = data;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-headers/submit?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 *
 * 删除发票行
 * @export
 * @param {String} params
 * @returns
 */
export async function deleteList(params) {
  const { body } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-lines/delete-line`, {
    method: 'POST',
    body,
  });
}

/**
 *
 * 删除明细头数据
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

// 查询关联行信息
export async function fetchLine(params) {
  const { paymentHeaderId, ...query } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/payment-lines/query-line-invoice/${paymentHeaderId}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 提交
export async function submit(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/payment-headers/batch-submit`, {
    method: 'POST',
    body,
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

// 查询预付款核销明细
export async function queryCancelDetail(params) {
  const { paymentLineId, ...query } = parseParameters(params);
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/cancel-verifications/${paymentLineId}/list-page`,
    {
      query,
    }
  );
}

// 查询选择核销行 Modal 数据
export async function fetchCancelModalList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/cancel-verifications/add`, {
    query,
  });
}

// 核销
export async function cancelVerification(params) {
  const { paymentLineId, body } = params;
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/cancel-verifications/${paymentLineId}/cancel-verification`,
    {
      method: 'POST',
      body,
    }
  );
}

// 删除核销行
export async function deleteLines(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/cancel-verifications`, {
    method: 'DELETE',
    body,
  });
}
