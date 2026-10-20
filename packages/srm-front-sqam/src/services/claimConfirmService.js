/**
 * 索赔单确认
 * @date: 2019-11-4
 * @version: 0.0.1
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 查询索赔单确认列表数据
 * @async
 * @function ConfirmFetchDataList
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function ConfirmFetchDataList(params) {
  const param = parseParameters(params);
  const { customizeUnitCode, ...otherParams } = param;
  return request(
    `${prefix}/${param.tenantId}/claim-form/confirm/page?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'GET',
      query: otherParams,
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
  return request(`${prefix}/${organizationId}/claim-form/supplier/attachment/add`, {
    method: 'POST',
    query,
  });
}

/**
 * 查询索赔单确认详情头数据
 * @async
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function ConfirmFetchDetailDataHead(params) {
  const { formHeaderId, tenantId } = params;
  return request(`${prefix}/${tenantId}/claim-form/confirm/detail/${formHeaderId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询索赔单确认详情列表数据
 * @async
 * @param {object} params - 查询条件
 * @param {?string} params.xxxx - xxxxxx
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function ConfirmFetchDetailDataList(params) {
  const param = parseParameters(params);
  const { formHeaderId, tenantId } = param;
  return request(`${prefix}/${tenantId}/claim-form-lines/confirm/detail/${formHeaderId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 确认索赔
 * @async
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */

export async function AgreeClaim(params) {
  const { tenantId, body, customizeUnitCode } = params;
  return request(
    `${prefix}/${tenantId}/claim-form/confirm/confirm?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}
/**
 * 保存
 * @async
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function SaveClaim(params) {
  const { tenantId, body, customizeUnitCode } = params;
  return request(
    `${prefix}/${tenantId}/claim-form/confirm/update?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'PUT',
      body,
    }
  );
}

/**
 * 申诉功能
 * @async
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */

export async function InitiateClaimStatement(params) {
  const { tenantId, body, customizeUnitCode } = params;
  return request(
    `${prefix}/${tenantId}/claim-form/confirm/appeal?customizeUnitCode=${customizeUnitCode}`,
    {
      method: 'POST',
      body,
    }
  );
}
