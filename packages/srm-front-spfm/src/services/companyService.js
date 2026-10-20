import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 查询公司信息
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function fetchCompany(params) {
  return request(`${SRM_PLATFORM}/v1/${params.tenantId}/companies`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchCompanyInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${params.tenantId}/companies/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 设置公司启用
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function enableCompany(params) {
  return request(`${HZERO_PLATFORM}/v1/${params.tenantId}/companies/enable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 设置公司缺省币种
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function saveCurrency(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/companies/currency`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 设置公司禁用
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 组织ID
 */
export async function disableCompany(params) {
  return request(`${HZERO_PLATFORM}/v1/${params.tenantId}/companies/disable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 平台级企业信息变更
 * @async
 * @param {Object} params - 查询参数
 */
export async function enterpriseChange(params) {
  return request(`${SRM_SSLM}/v1/${tenantId}/enterprise-change/single`, {
    method: 'POST',
    body: params,
  });
}

// 查询角色菜单权限
export async function queryMenuPermissions(params) {
  return request(`${SRM_SSLM}/v1/${tenantId}/common-data/menus/permissions`, {
    method: 'POST',
    body: params,
    query: params,
  });
}

// 建立合作伙伴
export async function buildPartner(params) {
  // 固定参数
  const regularParam = {
    tenantId: 0,
    category: 'GROUP_PARTNER_INVITE',
    eventCode: 'GROUP_PARTNER_INVITE',
    action: 'GROUP_PARTNER_INVITE',
  };
  return request(`${SRM_PLATFORM}/v1/${tenantId}/event-messages`, {
    method: 'PUT',
    body: {
      ...regularParam,
      ...params,
    },
  });
}

// 采购方是否展示供应商标签
export async function enterpriseTagsConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/companies/basic/zhima-label-display-flag`, {
    method: 'GET',
    query: params,
  });
}
