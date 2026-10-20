/*
 * @Description:
 * @Date: 2020-07-24 10:26:19
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPRM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 获取预算编制动态列
 */
export async function getBudgetItem() {
  return request(`${SRM_SPRM}/v1/${organizationId}/budget-item`, {
    method: 'GET',
  });
}

export async function delBuget(list) {
  return request(`${SRM_SPRM}/v1/${organizationId}/budget`, {
    method: 'DELETE',
    body: list,
  });
}

/**
 * 提交审批
 * @param {勾选数据} list
 */
export async function submitAppove(list) {
  return request(`${prefix}/${organizationId}/budget/submit`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 作废
 * @param {勾选数据} list
 */
export async function cancel(list) {
  return request(`${SRM_SPRM}/v1/${organizationId}/budget/cancel`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 审批通过
 * @param {勾选数据} list
 */
export async function approved(list) {
  return request(`${SRM_SPRM}/v1/${organizationId}/budget/approve`, {
    method: 'POST',
    body: list,
  });
}

/**
 * 审批拒绝
 * @param {勾选数据} list
 */
export async function reject(list) {
  return request(`${SRM_SPRM}/v1/${organizationId}/budget/reject`, {
    method: 'POST',
    body: list,
  });
}

/**
 *  查询业务规则定义-是否展示关联单据
 */
export async function getContactDocConfig() {
  return request(`${prefix}/${organizationId}/budget-occupy-sub/poUpdateBudgetCnf`, {
    method: 'GET',
  });
}
