/**
 * ecCatalogService - 租户目录 - service
 * @date: 2019-2-2
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SCEC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId(); // 租户ID
/**
 * 平台目录数据查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchEcCatalog(params) {
  const param = parseParameters(params);
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogs`, {
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
export async function addOrUpdateEcCatalog(params) {
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogs`, {
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
  return request(`${SRM_SCEC}/v1/${organizationId}/catalogs`, {
    method: 'PUT',
    body: params,
  });
}
