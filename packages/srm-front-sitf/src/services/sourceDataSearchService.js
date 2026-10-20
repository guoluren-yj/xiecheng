/**
 * sourceDataSearchService - 源数据查询 - service
 * @date: 2018-10-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const OrganizationId = getCurrentOrganizationId();

/**
 *查询批次列表数据
 *
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function queryBatchList(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/source-batch-info-imps`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询批次列表数据 租户级
 *
 * @export
 * @param {Object} params 查询条件
 * @returns
 */
export async function queryBatchListOrg(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/source-batch-info-imps`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询表格配置信息
 * @param {Object} params 查询条件
 */
export async function fetchConfig(params) {
  return request(`${SRM_INTERFACE}/v1/page-configs/seitfDetail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询表格配置信息 租户级
 * @param {Object} params 查询条件
 */
export async function fetchConfigOrg(params) {
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/page-configs/seitfDetail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询数据
 * @param {Object} params 查询条件
 */
export async function fetchData(params = {}) {
  const param = parseParameters(params.pageData);
  const requetUrl = params.url && params.url.replace(/\/\{organizationId}/g, '');
  return request(requetUrl, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询数据 租户级
 * @param {Object} params 查询条件
 */
export async function fetchDataOrg(params = {}) {
  const param = parseParameters(params.pageData);
  const requetUrl = params.url && params.url.replace(/\{organizationId}/g, OrganizationId);
  return request(requetUrl, {
    method: 'GET',
    query: param,
  });
}

/**
 * 源数据查询 - 立即执行
 * @param {Object} params 查询条件
 */
export async function fetchDirectlyConsume(param) {
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/queue-message/directly-consume`, {
    method: 'PUT',
    body: param,
  });
}
