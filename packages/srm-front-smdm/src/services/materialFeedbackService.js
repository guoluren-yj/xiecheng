/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-26 15:40:53
 * @LastEditors: yanglin
 * @LastEditTime: 2024-03-20 15:20:47
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 保存物料认证申请单
 * @async
 * @function saveItemAuth
 * @returns fetch Promise
 */
export async function saveItemFeedback(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/save`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 提交物料认证申请单
 * @async
 * @function submitItemAuth
 * @returns fetch Promise
 */
export async function submitItemFeedback(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/submit`, {
    method: 'PUT',
    body,
    query,
  });
}

/**
 * 查询当前角色下，物料认证申请反馈单头所有阶段操作、查询权限
 * @async
 * @function queryRoleAuthority
 * @returns fetch Promise
 */
export async function queryRoleAuthority(itemAuthFeeHeaderId, isPrequalification) {
  return request(
    `${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/get-role-authority/${itemAuthFeeHeaderId}`,
    {
      method: 'GET',
      query: { purchasePreApproveTabFlag: isPrequalification ? 1 : undefined },
    }
  );
}

/**
 * 查询操作记录
 * @param {单条数据DTO} Object
 */
export async function fetchActionHistory(itemAuthFeeHeaderId, query) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-actions/${itemAuthFeeHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询审批记录
 * @param {单条数据DTO} Object
 */
export async function fetchApproveHistory(itemAuthFeeHeaderId) {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-history-approval`, {
    method: 'GET',
    query: { itemAuthFeeHeaderId },
  });
}

/**
 * 获取整单数量
 * @param {单条数据DTO} Object
 */
export async function fetchCount() {
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/list-count`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

/**
 * 提交物料认证申请单
 * @async
 * @function submitItemAuth
 * @returns fetch Promise
 */
export async function rejectItemFeedback(params) {
  const { query, body } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-auth-fee-headers/feedback-rejected`, {
    method: 'PUT',
    body,
    query,
  });
}
