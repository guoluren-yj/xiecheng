/*
 * planSheetService - 排程计划单
 * @date: 2019/12/11 11:50:23
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_SPUC } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 查询计划单创建
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryPlanCreateList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/create-query`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询计划单维护
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryPlanUpdateList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/query`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 创建计划单
 * @async
 * @function createPlan
 * @returns {object} fetch Promise
 */
export async function createPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule`, {
    method: 'POST',
    body: { poLineLocationIds: data },
  });
}

/**
 * 修改/保存计划单
 * @async
 * @function createPlan
 * @returns {object} fetch Promise
 */
export async function savePlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule`, {
    method: 'PUT',
    body: data,
  });
}

/**
 *  批量发布计划单
 * @async
 * @function releasePlan
 * @returns {object} fetch Promise
 */
export async function releasePlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-release`, {
    method: 'POST',
    body: data,
  });
}

/**
 *  详情发布计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function releaseDetailPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/release`, {
    method: 'POST',
    body: data,
  });
}

/**
 *  详情删除计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function deleteDetailPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/delete-cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 *  批量删除废弃计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function deletePlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-delete`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 计划头信息
 * @async
 * @function queryPlanDetailHeader
 * @param {!number} organizationId - 组织ID
 * @param {object} poHeaderId - 头ID
 * @returns {object} fetch Promise
 */
export async function queryPlanDetailHeader(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/${params.planHeaderId}`, {
    method: 'GET',
  });
}

export async function queryPlanDetailLine(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule-line/${params.planHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 操作记录数据查询
 * @async
 * @function fetchItemLine
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchOperation(params) {
  console.log('params', params);
  const { planId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${SRM_SPUC}/v1/${organizationId}/plan-actions/${planId}`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 *  批量审批计划单
 * @async
 * @function releasePlan
 * @returns {object} fetch Promise
 */
export async function approvedPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-modify`, {
    method: 'PUT',
    body: data,
  });
}

/**
 *  详情审批计划单
 * @async
 * @function releasePlan
 * @returns {object} fetch Promise
 */
export async function approvedDetailPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-modify`, {
    method: 'POST',
    body: data,
  });
}

/**
 *  批量确认计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function surePlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-confirm`, {
    method: 'PUT',
    body: data,
  });
}

/**
 *  详情确认计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function sureDetailPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/confirm`, {
    method: 'POST',
    body: data,
  });
}

/**
 *  反馈计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function feedBackPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/feedback`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 查询计划单确认列表
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryPlanReleaseList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/release-query`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询计划单审批
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryPlanApprovedList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/feedback-query`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 *  批量废弃计划单
 * @async
 * @function releaseDetailPlan
 * @returns {object} fetch Promise
 */
export async function cancelPlan(data) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/batch-cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 我发出的计划单查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryMyPlanUpdateList(params) {
  const { planId, ...others } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}plan-actions/${planId}`, {
    method: 'GET',
    query: parseParameters(others),
  });
}

/**
 * 我收到的计划单查询
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.companyId - 公司编码
 */
export async function queryMyReceivedPlanUpdateList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/supplier-query`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 获取uuid
 * @async
 * @function getAttachmentuuid
 * @param {!number} organizationId - 组织ID
 * @returns {string} fetch Promise
 */
export async function getAttachmentuuid() {
  return request(`${HZERO_FILE}/v1/${organizationId}/files/uuid`, {
    method: 'POST',
  });
}

/**
 * 保存uuid
 * @async
 * @function saveAttachmentUUID
 * @param {!number} organizationId - 组织ID
 * @returns {object} fetch Promise
 */
export async function saveAttachmentUUID(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/schedule/file-upload`, {
    method: 'PUT',
    body: params,
  });
}
