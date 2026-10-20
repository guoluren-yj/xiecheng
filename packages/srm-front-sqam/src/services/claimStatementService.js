/**
 * 索赔单申诉
 * @date: 2019-11-4
 * @version: 0.0.1
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getUserOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getUserOrganizationId();

/**
 * 查询索赔单申诉列表数据
 * @async
 * @function ConfirmFetchDataList
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function StatementFetchDataList(params) {
  const param = parseParameters(params);
  const { customizeUnitCode, ...otherParams } = param;
  return request(
    `${prefix}/${organizationId}/claim-form/appealed/page?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 查询索赔单申诉详情数据
 * @async
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function FetchDetailDataHead(params) {
  const { formHeaderId } = params;
  return request(`${prefix}/${organizationId}/claim-form/create/detail/${formHeaderId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询索赔单申诉详情列表数据
 * @async
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function FetchDetailDataList(params) {
  const param = parseParameters(params);
  const { formHeaderId, customizeUnitCode, ...newParams } = param;
  return request(
    `${prefix}/${organizationId}/claim-form-lines/detail/${formHeaderId}?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: {
        ...newParams,
        formHeaderId,
      },
    }
  );
}

/**
 * 索赔单-批量发布
 * @async
 * @function releaseClaimStatement
 * @param {object} params - 请求参数
 * @param {string} params.tenantId - 租户Id
 * @param {!Array<object>} params.data - 索赔单数组
 * @returns {object} fetch Promise
 */
export async function releaseClaimStatement(params) {
  const { data, tenantId } = params;
  return request(`${prefix}/${tenantId}/problem-headers/publish`, {
    method: 'PUT',
    body: data,
  });
}

// 维持原判
export async function MaintainOriginal(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/appealed/rebutted?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

// 确认改判
export async function ConfirmChange(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/appealed/commuted?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}
// 保存
export async function SaveClaimStatement(params) {
  const { customizeUnitCode, body } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/appeal/update?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

// 保存
export async function SaveClaim(params) {
  const { customizeUnitCode, body } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/save?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}

// 取消索赔
export async function CancelClaim(params) {
  const { body, customizeUnitCode } = params;
  return request(
    `${prefix}/${organizationId}/claim-form/appealed/cancel?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 绑定头附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindHeaderAttachmentUuid(query) {
  return request(`${prefix}/${organizationId}/claim-form/attachment/add`, {
    method: 'PUT',
    query,
  });
}

export async function deleteLines(params) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form-lines/delete-batch-commuted`, {
    method: 'DELETE',
    body: params,
  });
}

export async function submitValidate({ body, customizeUnitCode }) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/appealed-validate`, {
    method: 'PUT',
    body,
    query: { customizeUnitCode },
  });
}
