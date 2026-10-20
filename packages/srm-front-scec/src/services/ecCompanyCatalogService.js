/**
 * ecCompanyCatalogService - 租户目录 - service
 * @date: 2019-2-2
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 租户下公司数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCompanyId(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 平台目录数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCompanyCatalog(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/com-catalog`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 平台目录新增/修改
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function addOrUpdateEcCompanyCatalog(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/com-catalog`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用禁用平台目录
 * @export
 * @param {object} params 编辑更新参数
 * @returns
 */
export async function setPermissionSetEnable(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/com-catalog`, {
    method: 'PUT',
    body: params,
  });
}
