/**
 * interfaceListDetail - 接口查询 - 接口表 - service
 * @date: 2018-9-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_INTERFACE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const OrganizationId = getCurrentOrganizationId();

/**
 * 查询单个独立值集值
 * @param {String} params
 */
export async function queryIdpValue() {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode: 'SITF.STATUS',
    },
  });
}

/**
 *查询配置
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchConfig(params) {
  return request(`${SRM_INTERFACE}/v1/page-configs/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询配置 租户级
 * @param {Object} params 查询参数
 */
export async function fetchConfigOrg(params) {
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/page-configs/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询数据
 * @param {Object} params 查询参数
 */
export async function fetchInterfaceData(params) {
  const param = parseParameters(params.data);
  const requetUrl = params.url && params.url.replace(/\/\{organizationId}/g, '');
  return request(requetUrl, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询数据 租户级
 * @param {Object} params 查询参数
 */
export async function fetchInterfaceDataOrg(params) {
  const param = parseParameters(params.data);
  const requetUrl = params.url && params.url.replace(/\{organizationId}/g, OrganizationId);
  return request(requetUrl, {
    method: 'GET',
    query: param,
  });
}
