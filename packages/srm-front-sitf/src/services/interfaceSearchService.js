/**
 * interfaceSearchService - 接口查询 - service
 * @date: 2018-9-18
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_INTERFACE } from '_utils/config';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { isUndefined } from 'lodash';

// 租户id
const OrganizationId = getCurrentOrganizationId();

/**
 * 查询单个独立值集值
 * @param {String} lovCode
 */
export async function queryIdpValue() {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode: 'SITF.DATA_EXECUTE_RESULT',
    },
  });
}

/**
 *查询接口表数据
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryInterfaceList(params) {
  const param = parseParameters(params);
  const { tenant } = param;
  if (!isUndefined(tenant)) {
    return request(`${SRM_INTERFACE}/v1/interfaces-site`, {
      method: 'GET',
      query: param,
    });
  }
}

/**
 *查询批次列表数据
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryBatchList(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/batch-info`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询接口表数据 - 租户级
 *
 * @export
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryInterfaceListOrg(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/interfaces`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询批次列表数据 - 租户级
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function queryBatchListOrg(params) {
  const param = parseParameters(params);
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/batch-info`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询批次列表数据 - 租户级
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function reRunBatchList(params) {
  return request(`${SRM_INTERFACE}/v1/rerun-batch?tenant=${params.tenant}`, {
    method: 'POST',
    body: params.selectedRows,
  });
}

/**
 *查询批次列表数据 - 租户级
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function reRunBatchListOrg(params) {
  return request(`${SRM_INTERFACE}/v1/${OrganizationId}/rerun-batch`, {
    method: 'POST',
    headers: {
      's-request-web': 'srm_web',
    },
    body: params.selectedRows,
  });
}
