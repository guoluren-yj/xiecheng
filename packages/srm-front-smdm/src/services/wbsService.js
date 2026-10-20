/**
 * service - wbs
 * @version: 0.0.1
 * @author: LC <chao.li03@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_MDM}/v1`;

const organizationId = getCurrentOrganizationId();

export async function searchHeader(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/wbs`, {
    method: 'GET',
    query: { ...param },
  });
}
export async function searchLine(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${param.tenantId}/period-sets/periods`, {
    method: 'GET',
    query: param,
  });
}

export async function savePeriodHeader(params) {
  return request(`${prefix}/${organizationId}/wbs/add`, {
    method: 'PUT',
    body: [...params.saveData],
  });
}

export async function updatePeriodHeader(params) {
  return request(`${prefix}/${organizationId}/wbs/update`, {
    method: 'POST',
    body: params.saveData,
  });
}

export async function searchPeriodRule(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/${params.periodSetId}/periods`, {
    method: 'GET',
  });
}

export async function searchRef(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/ref`, {
    method: 'POST',
  });
}

export async function savePeriod(params) {
  return request(`${prefix}/${params.tenantId}/period-sets/${params.periodSetId}/periods`, {
    method: 'POST',
    body: [...params.data],
  });
}

export async function detailWbs(params) {
  return request(`${prefix}/${params.tenantId}/wbs/${params.wbsId}`, {
    method: 'GET',
    query: params,
  });
}
