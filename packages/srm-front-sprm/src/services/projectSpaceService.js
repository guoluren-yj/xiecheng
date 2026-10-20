import request from 'utils/request';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SIEC, SRM_SSLM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 保存项目信息
export async function saveProInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project/save`, {
    method: 'POST',
    body: query,
    query: { customizeUnitCode },
  });
}
// 保存项目信息
export async function saveUpdateInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req`, {
    method: 'PUT',
    body: query,
    query: { customizeUnitCode },
  });
}

// 删除项目信息
export async function deleteProInfo(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project`, {
    method: 'DELETE',
    body: query,
  });
}

// 提交项目信息
export async function submitProInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project/submit`, {
    method: 'POST',
    body: query,
    query: { customizeUnitCode },
  });
}

// 提交项目信息
export async function submitProChangeInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req/submit`, {
    method: 'POST',
    body: query,
    query: { customizeUnitCode },
  });
}

// 保存任务成本信息
export async function saveCurrentTask(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task`, {
    method: 'PUT',
    body: query,
    query: { customizeUnitCode },
  });
}

// 校验删除任务成本信息
export async function checkoutCurrentTask(params) {
  const { taskId } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/valid/${taskId}/subordinate`, {
    method: 'GET',
  });
}

// 删除任务成本信息
export async function deleteCurrentTask(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task`, {
    method: 'DELETE',
    body: query,
  });
}

// 删除任务成本信息-req版本
export async function deleteCurrentTaskPur(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/req`, {
    method: 'DELETE',
    body: query,
  });
}

// 变更-取消任务成本信息
export async function cancelCurrentTask(params) {
  const { actionType, ...query } = filterNullValueObject(params);
  const url =
    actionType === 'cancel'
      ? `${SRM_SIEC}/v1/${organizationId}/project-task/req/cancel`
      : `${SRM_SIEC}/v1/${organizationId}/project-task/req/cancel-revoke`;
  return request(url, {
    method: 'POST',
    body: query,
  });
}

// 变更-校验任务成本信息的子任务
export async function checkoutChangeTask(params) {
  const { taskReqId } = filterNullValueObject(params);
  return request(
    `${SRM_SIEC}/v1/${organizationId}/project-task/req/valid/${taskReqId}/subordinate`,
    {
      method: 'GET',
    }
  );
}

// 变更-撤销取消任务成本信息
export async function cancelTaskStatus(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/req/cancel-revoke`, {
    method: 'POST',
    body: query,
  });
}

// 变更任务成本信息
export async function saveChangedTask(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/req`, {
    method: 'PUT',
    body: query,
    query: { customizeUnitCode },
  });
}

// 删除变更新增的成本信息
export async function deleteChangedTask(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/req`, {
    method: 'DELETE',
    body: query,
  });
}

// 保存任务成本信息-采购项
export async function savepurList(params) {
  const { customizeUnitCode, ...data } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/purchase-item/save`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

// 变更——保存任务成本信息-采购项
export async function savepurChangeList(params) {
  const { customizeUnitCode, ...data } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-task/req/purchase-item/save`, {
    method: 'PUT',
    body: data,
    query: { customizeUnitCode },
  });
}

// 删除任务成本信息
export async function deletePurList(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project`, {
    method: 'DELETE',
    body: query,
  });
}

//
export async function queryMoreTree(params) {
  const query = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-doc-execution/line-tiling`, {
    method: 'GET',
    query,
  });
}

// 变更项目信息
export async function createProUpdateInfo(params) {
  const { query, ...others } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req`, {
    method: 'POST',
    body: others,
    query,
  });
}

// 变更项目信息
export async function queryChangeHeaderMore(params) {
  const { query, projectId } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req/detail/${projectId}`, {
    method: 'GET',
    query,
  });
}

// 提交变更项目信息
export async function submitAction(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req/submit`, {
    method: 'POST',
    body: query,
    query: { customizeUnitCode },
  });
}

// 删除变更项目信息
export async function deleteProPurInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req`, {
    method: 'DELETE',
    body: query,
    query: { customizeUnitCode },
  });
}

// 作废变更项目信息
export async function invalidProPurInfo(params) {
  const { customizeUnitCode, ...query } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req/invalid`, {
    method: 'PUT',
    body: query,
    query: { customizeUnitCode },
  });
}

// 操作记录
export async function queryHistory(params) {
  const { id } = filterNullValueObject(params);
  return request(`${SRM_SIEC}/v1/${organizationId}/project-req/action/${id}`, {
    method: 'GET',
  });
}

// 供应商联动带出接口
export async function fetchContactInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-basics/contact-info`, {
    method: 'GET',
    query: params,
  });
}

// 审批记录
export async function queryApproveDate(params) {
  const { type, id } = params;
  const url =
    type === 'projectId'
      ? `${SRM_SIEC}/v1/${organizationId}/project/approval-history/${id}`
      : `${SRM_SIEC}/v1/${organizationId}/project-req/approval-history/${id}`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新建项目信息工作台接口
 * */
export async function createSiecProject(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/project/refer-pr/batch-create`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}
