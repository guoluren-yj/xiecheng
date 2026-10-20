/*
 * @Description:
 * @Date: 2020-08-20 11:33:13
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
const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SPRM}/v1/${organizationId}`;

/**
 * 获取预算规则详情
 */
export async function getBudgetRuleDetail(budgetRuleId) {
  return request(`${prefix}/budget-rules/${budgetRuleId}`, {
    method: 'GET',
  });
}

/**
 * 保存
 * @param {勾选数据} list
 */
export async function save(data) {
  return request(`${prefix}/budget-rules`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 发布
 * @param {勾选数据} list
 */
export async function publish(data) {
  return request(`${prefix}/budget-rules/publish`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 作废
 * @param {勾选数据} list
 */
export async function cancel(data) {
  return request(`${prefix}/budget-rules/cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 取消
 * @param {勾选数据} list
 */
export async function recall(data) {
  return request(`${prefix}/budget-rules/recall`, {
    method: 'POST',
    body: data,
  });
}
