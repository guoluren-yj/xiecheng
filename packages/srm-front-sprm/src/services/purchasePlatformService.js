import request from 'utils/request';
import {
  getCurrentOrganizationId,
  //   parseParameters,
  //   filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPRM, SRM_ADAPTOR } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';

const organizationId = getCurrentOrganizationId();
// 保存复制的采购申请 ${SRM_SPRM}-15750
export async function confirmCopyLine(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/copy`, {
    method: 'POST',
    body,
  });
}

/**
 * 提交采购申请
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function submit(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/submit`, {
    method: 'POST',
    body,
  });
}

/**
 * 列表加急
 * @async
 * @function listUrgent
 * @param {[Number]} poHeaders - 要加急的头列表
 * @returns {object} fetch Promise
 */
export async function listUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 列表取消加急
 * @async
 * @function listCancelUrgent
 * @param {[Number]} poHeaders - 要取消加急的头列表
 * @returns {object} fetch Promise
 */
export async function listCancelUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prHeader/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发运行加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prLine/urgent`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发运单取消加急
 * @async
 * @function detailUrgent
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function detailCancelUrgent(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/prLine/cancel-urgent`, {
    method: 'POST',
    body: params,
  });
}

export async function underApprovalQuery() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-approving`, {
    method: 'GET',
  });
}

export async function beforeSubmitQuery() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-await-submit`, {
    method: 'GET',
  });
}

export async function approvedQuery() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-approved`, {
    method: 'GET',
  });
}

export async function wholeQuery() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench-all`, {
    method: 'GET',
  });
}

export async function byExcutionQuery(params) {
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/execution-status-tracking-tiled/page`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 查询公司信息,带出业务实体/采购组织
export async function fetchAutoGetCompany(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/purchase-company`, {
    method: 'GET',
    query: params,
  });
}

// 查询公司信息,带出业务实体/采购组织
export async function saveFirst(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/overall`, {
    method: 'POST',
    body,
  });
}

// 按行tab页面数据总量查询
export async function cancelLineQuery() {
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/lines/cancel`,
    {
      method: 'GET',
    }
  );
}

// 获取单据标签
export async function getDocTags({ query, body }) {
  return request(`${SRM_ADAPTOR}/v1/${organizationId}/auto-doc-label`, {
    method: 'POST',
    query,
    body,
  });
}

// 采购组织带出采购员
export async function fetchAutoGetPurchasing(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/agent`, {
    method: 'GET',
    query: params,
  });
}

// queryAction
// 查询操作记录
export async function queryAction(prHeaderId) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/actions/all`, {
    method: 'GET',
  });
}

// 查询审批记录
export async function queryApproveDate(prHeaderId) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-approval-history/record`, {
    method: 'GET',
    query: { prHeaderId },
  });
}
// fetchCounts

export async function fetchCounts(query) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/workbench/count`, {
    method: 'GET',
    query,
  });
}

/**
 * 撤销工作流审批
 */
export async function revokeWorkflow(params) {
  const { businessKey } = params;
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    {
      method: 'GET',
    }
  );
}
