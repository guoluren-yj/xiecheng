/**
 * service - 供应商生命周期管理
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const prefix = `${SRM_SSLM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 根据参数获取供应商信息
 * @async
 * @function searchSupplier
 * @param {object} params - 请求参数
 * @param {!number} params.tenantId - 租户Id
 * @param {?string} params.supplierCompany - 供应商编码
 * @param {?string} params.companyId - 公司编码
 * @param {string } [params.dimensionCode =  ] - 管控维度
 * @param {!string} params.stageId - 生命周期阶段编码
 * @returns {object} fetch Promise
 */
export async function searchSupplier(params) {
  const { tenantId, stageId, ...others } = parseParameters(params);
  let query = { ...others, stageId };
  let requestURL = `${prefix}/${tenantId}/life-cycles/stage`; // 查询阶段
  if (params.stageId === 'ALL') {
    query = { ...others };
    requestURL = `${prefix}/${tenantId}/life-cycles/lane`; // 查询所有
  }
  return request(requestURL, {
    method: 'GET',
    query,
  });
}

export async function searchSupplierPost(params) {
  const { tenantId, stageId, customizeUnitCode, page, size, ...others } = parseParameters(params);
  let query = { ...others, stageId };
  let requestURL = `${prefix}/${tenantId}/life-cycles/stage`; // 查询阶段
  if (params.stageId === 'ALL') {
    query = { ...others };
    requestURL = `${prefix}/${tenantId}/life-cycles/lane`; // 查询所有
  }
  return request(requestURL, {
    method: 'POST',
    body: query,
    query: { page, size, customizeUnitCode },
  });
}

/**
 * 查询当前租户的管控维度
 * @param {Object} params
 */
export async function queryCurrentConfig(params) {
  return request(`${prefix}/${organizationId}/life-cycle-dim-configs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前租户下的子公司
 */
export async function querySubsidiary(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: params,
  });
}

// 校验是否通过第三方校验
export async function isValidation(params) {
  return request(`${prefix}/${organizationId}/life-cycles/check`, {
    method: 'GET',
    query: params,
  });
}
