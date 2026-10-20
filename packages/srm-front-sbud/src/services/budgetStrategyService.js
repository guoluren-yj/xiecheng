/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-25 14:27:32
 * @LastEditors: yanglin
 * @LastEditTime: 2024-02-06 11:09:40
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const prefix = `/sbdm/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 预算编制策略明细
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchDetail(budgetStrategyId) {
  return request(`${prefix}/${organizationId}/budget-strategy/${budgetStrategyId}`, {
    method: 'GET',
  });
}

/**
 * 复制预算编制策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function copy(body) {
  const { budgetStrategyId } = body;
  return request(`${prefix}/${organizationId}/budget-strategy/copy/${budgetStrategyId}`, {
    method: 'POST',
    body,
  });
}

/**
 * 保存或新建策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function save(body) {
  return request(`${prefix}/${organizationId}/budget-strategy`, {
    method: 'POST',
    body,
  });
}

/**
 * 发布预算编制策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function release(body) {
  return request(`${prefix}/${organizationId}/budget-strategy/release`, {
    method: 'POST',
    body,
  });
}

/**
 * 预算编制策略历史列表
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchHistory(budgetStrategyId) {
  return request(
    `${prefix}/${organizationId}/budget-strategy/history-version/${budgetStrategyId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 启用预算编制策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function enable(body) {
  const { budgetStrategyId } = body;
  return request(`${prefix}/${organizationId}/budget-strategy/enable/${budgetStrategyId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 禁用预算编制策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function disable(body) {
  const { budgetStrategyId } = body;
  return request(`${prefix}/${organizationId}/budget-strategy/disabled/${budgetStrategyId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 解锁预算编制策略
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function unlock(body) {
  const { budgetStrategyId } = body;
  return request(`${prefix}/${organizationId}/budget-strategy/unlock/${budgetStrategyId}`, {
    method: 'PUT',
    body,
  });
}

/**
 * 查询是不是多模版
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchIsMutlTemplate() {
  return request(`${prefix}/${organizationId}/common/config/is-single-template`, {
    method: 'GET',
  });
}
