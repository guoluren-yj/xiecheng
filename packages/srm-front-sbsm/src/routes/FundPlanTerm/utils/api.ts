import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

interface FetchTermsHistoryParams {
  termNum: string;
  page?: number;
  size?: number;
};

/**
 * @description:查询付款条款历史版本
 * @param {FetchTermsHistoryParams} params
 * @returns {object} fetch Promise
 */
export async function fetchTermsHistory(query: FetchTermsHistoryParams) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/history/page`, {
    method: 'GET',
    query,
  });
}

/**
 * @description: 编辑资金计划
 * @param {string} termHeaderId 付款条款id
 * @return {object} fetch Promise
 */
export async function editPayFundPlan(record: any) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/term-upgrade`, {
    method: 'POST',
    body: record?.toData(),
  });
}


/**
 * @description: 禁用启用资金计划
 * @param {string} termHeaderId 付款条款id
 * @return {object} fetch Promise
 */
export async function enablePayFundPlan(body) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/enable`, {
    method: 'POST',
    body,
  });
}


/**
 * @description: 重新执行
 * @param {string} termHeaderId 付款条款id
 * @return {object} fetch Promise
 */
export async function resync(body) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/sync`, {
    method: 'POST',
    body,
  });
}

/**
 * @description: 撤回
 * @param {string} releaseBusinessKey 付款条款id
 * @return {object} fetch Promise
 */
export async function revoke(termHeaderId) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/fun-release-revoke`, {
    method: 'PUT',
    body: { termHeaderId },
  });
}


/**
 * @description: 取消发布
 * @param {string} termHeaderId 付款条款id
 * @return {object} fetch Promise
 */
export async function cancelPublish(termHeaderId) {
  const organizationId = getCurrentOrganizationId();
  return request(`/sbdm/v1/${organizationId}/term-headers/release/cancel?termHeaderId=${termHeaderId}`, {
    method: 'GET',
  });
}
