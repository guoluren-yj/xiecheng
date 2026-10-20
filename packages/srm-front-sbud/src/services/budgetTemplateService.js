/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-25 14:27:32
 * @LastEditors: yanglin
 * @LastEditTime: 2022-05-19 14:24:23
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const prefix = `/sbdm/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 预算编制模板明细
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchDetail(budgetTemplateId) {
  return request(`${prefix}/${organizationId}/budget-template/${budgetTemplateId}`, {
    method: 'GET',
  });
}

/**
 * 复制预算编制模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function copy(body) {
  return request(`${prefix}/${organizationId}/budget-template/copy`, {
    method: 'POST',
    body,
  });
}

/**
 * 保存或新建模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function save(body) {
  return request(`${prefix}/${organizationId}/budget-template/save`, {
    method: 'PUT',
    body,
  });
}

/**
 * 发布预算编制模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function release(body) {
  return request(`${prefix}/${organizationId}/budget-template/release`, {
    method: 'POST',
    body,
  });
}

/**
 * 预算编制模板历史列表
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchHistory(budgetTemplateId) {
  return request(`${prefix}/${organizationId}/budget-template/history/${budgetTemplateId}`, {
    method: 'GET',
  });
}

/**
 * 启用预算编制模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function enable(body) {
  return request(`${prefix}/${organizationId}/budget-template/enable`, {
    method: 'POST',
    body,
  });
}

/**
 * 禁用预算编制模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function disable(body) {
  return request(`${prefix}/${organizationId}/budget-template/disable`, {
    method: 'POST',
    body,
  });
}

/**
 * 解锁预算编制模板
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function unlock(body) {
  return request(`${prefix}/${organizationId}/budget-template/unlock`, {
    method: 'POST',
    body,
  });
}
