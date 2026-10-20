/**
 * tenderPlanService - 招标计划 - service
 * @date: 2019-4-16
 * @author: YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_IAM, HZERO_HWFP } from 'utils/config';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getCurrentOrganizationId();

/**
 * 招标计划列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchTenderPlansList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan-line`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 招标维护列表查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function queryPlanUpdate(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 招标维护明细查询
 * @export
 * @param {object} params 查询参数
 * @returns
 */
export async function fetchPlanUpdate(params) {
  const { bidPlanId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan/${bidPlanId}`, {
    method: 'GET',
    query: otherParams,
  });
}

// 招标维护明细行
export async function fetchPlanUpdateLine(params) {
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan-line/query-by-bidPlanId`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 保存 - 招标信息维护
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function savePlanUpdate(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 提交 - 招标信息维护
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function submitPlanUpdate(params) {
  const { customizeUnitCode, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan/submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: otherParams,
  });
}

/**
 * 删除 - 招标信息维护表格行
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deletePlanUpdate(params) {
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan-line/remove/${params.bidPlanLineId}`, {
    method: 'POST',
  });
}

/**
 * 撤销取消 - 招标信息维护表格行
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function revokeCancelPlanUpdate(params) {
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan-line/revokeCancel/${params.bidPlanLineId}`, {
    method: 'POST',
  });
}
/**
 * 取消 - 招标信息维护表格行
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function cancelPlanUpdate(params) {
  return request(`${SRM_SSRC}/v1/${tenantId}/bid-plan-line/cancel/${params.bidPlanLineId}`, {
    method: 'POST',
  });
}

/**
 * 查询项目维护信息
 * @param {Object} params - 请求参数
 */
export async function fetchProjectInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/project`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询项目维护信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function fetchProjectInfoDetail(params) {
  const { projectId, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/project/${projectId}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 查询项目维护信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function fetchProjectLineInfo(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/project-attribute-lns`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询项目维护信息 - 明细
 * @param {Object} params - 请求参数
 */
export async function deleteLine(params) {
  const { projectAttributeLns, projectId } = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/project-attribute-lns`, {
    method: 'DELETE',
    body: projectAttributeLns,
    query: { projectId },
  });
}

/**
 * 保存项目维护信息
 * @param {Object} params - 请求参数
 */
export async function saveProjectInfoDetail(params) {
  const { data, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/project`, {
    method: 'POST',
    query: others,
    body: data,
  });
}

/**
 * 提交项目维护信息
 * @param {Object} params - 请求参数
 */
export async function submitProjectInfoDetail(params) {
  const { data, ...others } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/project/release`, {
    method: 'POST',
    query: others,
    body: data,
  });
}

/**
 * 删除项目信息
 * @param {Object} params - 请求参数
 */
export async function deleteProjectInfoDetail(params) {
  const { projectId } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/project/${projectId}`, {
    method: 'DELETE',
  });
}

/**
 * selectSupplierLov - 供应商选择lov
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchPurAgentLovData(params) {
  const param = parseParameters(params);
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/users/paging`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询项目历史记录
 * @param {Object} params - 请求参数
 */
export async function fetchHistory(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/project-info-actions`, {
    method: 'GET',
    query,
  });
}

/**
 * 行支持批量删除
 * @param {Object} params - 请求参数
 */
export async function batchDeletePlan(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/bid-plan-line/batch-delete`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 工作流流程撤销
 * @param {object} params - 接口传参
 */
export async function revokeWorkFlowByKey(params) {
  const { businessKey } = params;
  let realRes;
  const res = await request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    { responseType: 'text' }
  );
  try {
    realRes = JSON.parse(res || '');
  } catch (error) {
    realRes = res;
  }
  return realRes;
}
