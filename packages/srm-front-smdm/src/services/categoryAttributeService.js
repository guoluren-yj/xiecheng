/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-05 16:15:46
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-20 11:14:30
 */
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';

const tenantId = getCurrentOrganizationId();

/**
 * 保存属性定义
 * @param {Object} params - 查询参数
 */
export async function saveAttribute(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attribute`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存属性值定义
 * @param {Object} params - 查询参数
 */
export async function saveAttributeValue(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attribute-value`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存属性模版定义
 * @param {Object} params - 查询参数
 */
export async function saveAttributeTemplate(params) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attr-templates`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 属性模版明细
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchDetail(templateId) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attr-templates/${templateId}`, {
    method: 'GET',
  });
}

/**
 * 模版分配品类
 * @async
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function assignCategory(params) {
  const { templateId, list } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/category-attr-templates/assign/${templateId} `, {
    method: 'POST',
    body: list,
  });
}

// queryAction
// 查询操作记录
export async function queryAction(templateId) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attr-templates/action/${templateId}`, {
    method: 'GET',
  });
}
