/**
 * assignOrganizationService - 分配采购组织service
 * @date: 2019-11-22
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询分配采购组织
 */
export async function fetchPurOrganization(params = {}) {
  const { ouId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ope-pur-organizations/${ouId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除分配采购组织
 */
export async function deletePurOrganization(params = {}) {
  const { ouId, purchaseOrganizationList } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ope-pur-organizations/${ouId}`, {
    method: 'DELETE',
    body: purchaseOrganizationList,
  });
}

/**
 * 采购组织多选lov查询
 */
export async function fetchPurOrganizationLov(params = {}) {
  const { ouId, ...other } = params;
  const param = parseParameters(other);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ope-pur-organizations/${ouId}/unchoosed`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 添加分配采购组织
 */
export async function addPurOrganization(params = {}) {
  const { ouId, purchaseOrganizationList } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ope-pur-organizations/${ouId}`, {
    method: 'POST',
    body: purchaseOrganizationList,
  });
}

/**
 * 设置默认的采购组织
 */
export async function setDefaultPurOrganization(params = {}) {
  const { ouId, purchaseOrganization } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/ope-pur-organizations/${ouId}/default`, {
    method: 'POST',
    body: purchaseOrganization,
  });
}
