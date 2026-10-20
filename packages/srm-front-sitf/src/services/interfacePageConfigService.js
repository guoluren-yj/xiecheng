/**
 * interfacePageConfigService - 接口页面配置 - service
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_INTERFACE, SRM_INTERFACE_CONFIG } from '_utils/config';

/**
 *接口页面配置查询
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryInterfacePageConfig(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE_CONFIG}/v1/page-configs`, {
    method: 'GET',
    query: param,
  });
}

/**
 *接口页面配置保存
 *
 * @export
 * @param {Object} params 接口相关配置数据
 * @returns
 */
export async function saveInterfacePageConfig(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/page-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 *接口页面配置删除
 *
 * @export
 * @param {Object} params 接口页面配置需删除数据
 * @returns
 */
export async function removeInterfacePageConfig(params) {
  return request(`${SRM_INTERFACE_CONFIG}/v1/page-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *接口页面配置查询 - 租户级
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryInterfacePageConfigOrg(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/page-configs`, {
    method: 'GET',
    query: param,
  });
}

/**
 *接口页面配置保存 - 租户级
 *
 * @export
 * @param {Object} params 接口相关配置数据
 * @returns
 */
export async function saveInterfacePageConfigOrg(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/page-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 *接口页面配置删除 - 租户级
 *
 * @export
 * @param {Object} params 接口页面配置需删除数据
 * @returns
 */
export async function removeInterfacePageConfigOrg(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/page-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *引用平台级数据 - 租户级
 *
 * @export
 * @param {Object} params 接口页面配置需删除数据
 * @returns
 */
export async function quoteSiteDataOrg(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_INTERFACE}/v1/${organizationId}/page-configs/quote`, {
    method: 'POST',
    body: params,
  });
}
