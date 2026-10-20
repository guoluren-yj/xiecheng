/**
 * billUpdateRule.js - 对账单价修改规则
 * @date: 2018-11-18
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_FINANCE } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询对账单价修改规则头列表
 * @param {Object} params - 查询参数
 */
export async function queryRules() {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rules`, {
    method: 'GET',
  });
}

/**
 * 批量创建对账单价修改规则
 * @param {Object} params - 添加请求参数
 */
export async function addRules(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rules`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 批量修改对账单价修改规则
 * @param {Object} params - 添加请求参数
 */
export async function updateRules(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rules`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询对账单价修改规则明细
 * @param {Object} params - 查询参数
 */
export async function queryRuleLines(params) {
  const { ruleId, ...other } = params;
  const query = parseParameters(other);
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rule-dtl/${ruleId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 批量删除对账单价修改规则明细
 * @param {Object} params - 添加请求参数
 */
export async function deleteRuleLines(params) {
  const { ruleId, body } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rule-dtl/${ruleId}`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 批量保存对账单价修改规则行
 * @param {Object} params - 添加请求参数
 */
export async function saveRuleLines(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/bill-update-rule-dtl`, {
    method: 'POST',
    body: params,
  });
}
