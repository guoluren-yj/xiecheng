/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-16 13:54:28
 * @LastEditors: yanglin
 * @LastEditTime: 2023-05-16 16:04:45
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
  return request(`${prefix}/${organizationId}/budget-header/save`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 提交
 * @param {单条数据DTO} Object
 */
export async function submit(data) {
  return request(`${prefix}/${organizationId}/budget-header/submit`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 调整保存
 * @param {单条数据DTO} Object
 */
export async function editingSave(data) {
  return request(`${prefix}/${organizationId}/budget-edit/save`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 调整提交
 * @param {单条数据DTO} Object
 */
export async function editingSubmit(data) {
  return request(`${prefix}/${organizationId}/budget-edit/submit`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 批量提交
 * @param {单条数据DTO} Object
 */
export async function batchSubmit(data) {
  return request(`${prefix}/${organizationId}//budget-header/batch-submit`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 批量整单作废
 * @param {单条数据DTO} Object
 */

export async function wholeVoid(data) {
  return request(`${prefix}/${organizationId}/budget-header/batch-cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 批量整单删除
 * @param {单条数据DTO} Object
 */

export async function batchWholeDelete(data) {
  return request(`${prefix}/${organizationId}/budget-header`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 批量行删除
 * @param {单条数据DTO} Object
 */

export async function batchLineDetele(data) {
  return request(`${prefix}/${organizationId}/budget-line`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 批量行作废
 * @param {单条数据DTO} Object
 */

export async function batchLineVoid(data) {
  return request(`${prefix}/${organizationId}/budget-line/batch-cancel`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 获取模板字段
 * @param {单条数据DTO} Object
 */
export async function fetchTemplateFields(budgetTemplateId) {
  return request(`${prefix}/${organizationId}/budget-template/item-fields/${budgetTemplateId}`, {
    method: 'GET',
  });
}

/**
 * 查询操作记录
 * @param {单条数据DTO} Object
 */
export async function fetchActionHistory(budgetHeaderId) {
  return request(`${prefix}/${organizationId}/budget-header/action/${budgetHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询审批记录
 * @param {单条数据DTO} Object
 */
export async function fetchApproveHistory(budgetHeaderId) {
  return request(
    `${prefix}/${organizationId}/budget-header/workflow-approval-history/${budgetHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询调整记录
 * @param {单条数据DTO} Object
 */
export async function fetchEditReocrd(budgetLineId) {
  return request(`${prefix}/${organizationId}/budget-line/edit-action/${budgetLineId}`, {
    method: 'GET',
  });
}

/**
 * 获取整单数量
 * @param {单条数据DTO} Object
 */
export async function fetchWholeCount(budgetTemplateCode) {
  return request(`${prefix}/${organizationId}/budget-header/count/${budgetTemplateCode}`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

/**
 * 获取明细行数量
 * @param {单条数据DTO} Object
 */
export async function fetchLineCount(budgetTemplateCode) {
  return request(`${prefix}/${organizationId}/budget-line/count/${budgetTemplateCode}`, {
    method: 'GET',
    query: { onlyCountLimit: 100 },
  });
}

/**
 * 获取明细行金额
 * @param {单条数据DTO} Object
 */
export async function fetchLineAmount(budgetLineId) {
  return request(`${prefix}/${organizationId}/budget-line/amount/${budgetLineId}`, {
    method: 'GET',
  });
}

/**
 * 获取最新的默认模版
 */
export async function fetchLatestTemplate() {
  return request(`${prefix}/${organizationId}/budget-template/latest-effective/template`, {
    method: 'GET',
  });
}

/**
 * 校验行是否重复
 * @param {单条数据DTO} Object
 */

export async function validUnique(data) {
  return request(`${prefix}/${organizationId}/budget-line/valid-unique`, {
    method: 'POST',
    body: data,
  });
}
