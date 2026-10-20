/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-16 13:54:28
 * @LastEditors: yanglin
 * @LastEditTime: 2024-01-23 16:05:09
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `/sbdm/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 保存
 * @param {单条数据DTO} Object
 */
export async function save(data) {
  return request(`${prefix}/${organizationId}/budget-item/save`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 引用平台级预定义维度
 * @param {单条数据DTO} Object
 */
export async function refBudgetItemDdefault(data) {
  return request(`${prefix}/${organizationId}/budget-item/ref-default`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 启用和禁用
 * @param {单条数据DTO} Object
 */
export async function budgetItemEnable(data) {
  return request(`${prefix}/${organizationId}/budget-item/enable`, {
    method: 'POST',
    body: data,
  });
}
