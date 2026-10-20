import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 并单组装成物料认证申请单
 * @async
 * @function mergeItemAuthReq
 * @returns fetch Promise
 */
export async function mergeItemAuthReq(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-await-auths/merge-create/item-auth-req`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建物料认证申请单
 * @async
 * @function createItemAuthReq
 * @returns fetch Promise
 */
export async function createItemAuthReq(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/create`, {
    method: 'POST',
    body,
    query,
  });
}

/**
 * 确认物料认证申请单
 * @async
 * @function confirmItemAuth
 * @returns fetch Promise
 */
export async function confirmItemAuth(params) {
  const { customizeUnitCode, ...body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/confirm`, {
    method: 'POST',
    body,
    query: { customizeUnitCode },
  });
}

/**
 * 查询当前角色下，物料认证申请单头所有阶段操作、查询权限
 * @async
 * @function queryRoleAuthority
 * @returns fetch Promise
 */
export async function queryRoleAuthority(itemAuthReqHeaderId) {
  return request(
    `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/get-role-authority/${itemAuthReqHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存物料认证申请单
 * @async
 * @function saveItemAuth
 * @returns fetch Promise
 */
export async function saveItemAuth(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/save`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 删除物料认证申请单
 * @async
 * @function deleteItemAuth
 * @returns fetch Promise
 */
export async function deleteItemAuth(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 提交物料认证申请单
 * @async
 * @function submitItemAuth
 * @returns fetch Promise
 */
export async function submitItemAuth(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/submit`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 取消物料认证申请单
 * @async
 * @function cancelItemAuth
 * @returns fetch Promise
 */
export async function cancelItemAuth(params) {
  const { query = {}, ...param } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/cancel`, {
    method: 'PUT',
    body: param,
    query,
  });
}

/**
 * 跳过当前节点物料认证申请单
 * @async
 * @function cancelItemAuth
 * @returns fetch Promise
 */
export async function skipItemAuth(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/skip`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 终止物料认证申请单
 * @async
 * @function cancelItemAuth
 * @returns fetch Promise
 */
export async function endItemAuth(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/early-termination`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询操作记录
 * @param {单条数据DTO} Object
 */
export async function fetchActionHistory(params) {
  const { itemAuthReqHeaderId, ...others } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-actions/${itemAuthReqHeaderId}`, {
    method: 'GET',
    query: { ...others },
  });
}

/**
 * 查询审批记录
 * @param {单条数据DTO} Object
 */
export async function fetchApproveHistory(itemAuthReqHeaderId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-history-approval`, {
    method: 'GET',
    query: { itemAuthReqHeaderId },
  });
}

/**
 * 获取物料申请数量
 * @param {单条数据DTO} Object
 */
export async function fetchAwaitAuthItemCount() {
  return request(`${SRM_MDM}/v1/${tenantId}/item-await-auths/count`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

/**
 * 获取物料申请数量
 * @param {单条数据DTO} Object
 */
export async function fetchItemCount() {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-count`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

/**
 * 获取物料认证申请状态流转
 * @param {单条数据DTO} Object
 */
export async function fetchItemStatusList(itemAuthReqHeaderId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/status-flow-list`, {
    method: 'GET',
    query: { itemAuthReqHeaderId },
  });
}

/**
 * 获取物料认证申请单当前节点所有状态
 * @param {单条数据DTO} Object
 */
export async function fetchItemReqAllStatus(itemAuthReqHeaderId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/list-req-status`, {
    method: 'GET',
    query: { itemAuthReqHeaderId },
  });
}

/**
 * 物料认证申请单打印
 * @param {单条数据DTO} Object
 */
export async function itemReqPrint(payload) {
  const { itemAuthReqHeaderId, headers, responseType } = payload;
  return request(
    `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/header-and-line-detail/print/${itemAuthReqHeaderId}`,
    {
      headers,
      responseType,
      method: 'GET',
    }
  );
}

/**
 * 物料认证申请单预审批
 * @param {单条数据DTO} Object
 */
export async function preAction({ result, approvedRemark, ...others }) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/single-preapproval`, {
    method: 'PUT',
    query: { result, approvedRemark },
    body: others,
  });
}

/**
 * 物料认证申请单预审批
 * @param {单条数据DTO} Object
 */
export async function preActionBatch({ result, approvedRemark, list }) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/batch-preapproval`, {
    method: 'PUT',
    query: { result, approvedRemark },
    body: list,
  });
}

/**
 * 物料认证申请单复制
 * @param {单条数据DTO} Object
 */
export async function copyItemReq({ list }) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/copy`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 物料待认证认证批量关闭
 * @param {单条数据DTO} Object
 */
export async function closeAwaitItemReq(list) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-await-auths/close`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 查询操作记录
 * @param {单条数据DTO} Object
 */
export async function fetchAwatitActionHistory(params) {
  const { awaitAuthenticateId, ...others } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-await-auth-actions/${awaitAuthenticateId}`, {
    method: 'GET',
    query: { ...others },
  });
}

/**
 * 发起送样
 * @async
 * @function saveItemAuth
 * @returns fetch Promise
 */
export async function initiateSample(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/initiate-sample`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 录入结果提交
 * @async
 * @function saveItemAuth
 * @returns fetch Promise
 */
export async function testResultSubmitSample(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/input-results-submit`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 取消物料认证申请单
 * @async
 * @function cancelItemAuth
 * @returns fetch Promise
 */
export async function returnItemAuth(params) {
  const { query = {}, ...param } = params;
  return request(
    `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/test_results_to_be_entered_return`,
    {
      method: 'PUT',
      body: param,
      query,
    }
  );
}

/**
 * 关闭物料认证申请单
 * @async
 * @function cancelItemAuth
 * @returns fetch Promise
 */
export async function closeItemAuth(params) {
  const { query = {}, ...param } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/close`, {
    method: 'PUT',
    body: param,
    query,
  });
}

/**
 * 录入结果保存
 * @async
 * @function saveItemAuth
 * @returns fetch Promise
 */
export async function testResultSave(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/input-results-save`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag`, {
    body,
    query,
    method: 'POST',
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
    realRes = JSON.parse(res);
  } catch (error) {
    realRes = res;
  }
  return realRes;
}

/**
 * 物料待认证认证批量删除
 * @param {单条数据DTO} Object
 */
export async function batchDeleteItemReq(list) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/batch-delete`, {
    method: 'DELETE',
    body: list,
  });
}
/**
 * 工作流审批通过时，保存物料认证申请单二开字段
 * @async
 * @function workFlowSubmitSave
 * @returns fetch Promise
 */
export async function workFlowSubmitSave(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/workflow-save`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 物料待认证认证批量提交
 * @param {单条数据DTO} Object
 */
export async function batchSubmitItemReq(list) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/batch-submit`, {
    method: 'PUT',
    body: list,
  });
}

/**
 * 工作流审批通过时，保存物料认证申请单校验逻辑
 * @async
 * @function workFlowSubmitSave
 * @returns fetch Promise
 */
export async function workFlowSubmitSaveCheck(params) {
  return request(
    `${SRM_MDM}/v1/${tenantId}/item-auth-req-headers/approval-process-save/${params?.type}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 工作流审批通过时，保存物料认证反馈单二开字段
 * @async
 * @function workFlowFeeSubmitSave
 * @returns fetch Promise
 */
export async function workFlowFeeSubmitSave(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/workflow-save-attribute-fields`, {
    method: 'PUT',
    body,
    query,
  });
}
