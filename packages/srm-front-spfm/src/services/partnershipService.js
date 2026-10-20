/**
 * partnershipService 集团企业查询
 * @date: 2018-8-7
 * @author: <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 查询合作关系列表
 * @param {Object} params - 查询参数
 */
export async function queryPartnership(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/partners`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询操作明细
 * @param {Object} params - 查询参数
 */
export async function queryActionDetail(params) {
  return request(`${SRM_PLATFORM}/v1/partners/invite/operations`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询集团列表
 * @param {Object} params --查询参数
 */
export async function queryGroupData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/groups`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 更改集团列表
 */
export async function updateGroupData(params) {
  const { groupId } = params;
  return request(`${SRM_PLATFORM}/v1/groups/${groupId}`, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 查询企业列表
 */
export async function queryCompanyData(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/companies/site`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 更改企业列表
 */
export async function updateCompanyData(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/companies/site/${companyId}`, {
    method: 'POST',
    query: params,
  });
}

// cancelEsign
export async function cancelEsign(params) {
  const { companyId } = params;
  return request(`${SRM_PLATFORM}/v1/groups/cancel-esign-account/${companyId}`, {
    method: 'POST',
  });
}

/**
 * 批量回收角色接口
 */
export async function recycleAdminRole(params) {
  return request(`${SRM_PLATFORM}/v1/partners/admin-role/recycle`, {
    method: 'POST',
    body: params,
  });
}
