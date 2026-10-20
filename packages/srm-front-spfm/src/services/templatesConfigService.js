import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

/**
 * 查询模板配置头数据
 * @async fetchTemplatesConfigData
 * @param {Object} params - 查询参数
 * @param {String} [params.assignId] - 门户分配ID
 */
export async function fetchTemplatesConfigData(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-configs/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询模板配置行数据
 * @async
 * @function fetchTemplateConfigList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchTemplateConfigList(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-configs/${params.assignId}`, {
    method: 'GET',
  });
}

/**
 * 启用模板
 * @async
 * @function enableTemplate
 * @param {Object} params - 查询参数
 */
export async function enableTemplate(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-configs/default`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取门户模板配置明细
 * @async
 * @function fetchTemplateDetail
 * @param {Object} params - 查询参数
 * @param {String} params.configId - 配置ID
 */
export async function fetchTemplateDetail(params) {
  return request(`${SRM_PLATFORM}/v1/templates-config-items/${params.configId}`, {
    method: 'GET',
  });
}

/**
 * 保存门户模版配置明细
 * @param {*} params - 模版配置参数
 */
export async function saveTemplateDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-config-items`, {
    method: 'POST',
    body: params,
  });
}

export async function saveTemplateDetailNoTenantId(params) {
  return request(`${SRM_PLATFORM}/v1/templates-config-items`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取门户模板配置明细
 * @async
 * @function fetchTemplateDetail
 * @param {Object} params - 查询参数
 * @param {String} params.configId - 配置ID
 */
export async function fetchTemplateDetailByAssignId(params) {
  return request(
    `${SRM_PLATFORM}/v1/${tenantId}/templates-config-items/${params.assignId}/default`,
    {
      method: 'GET',
    }
  );
}

/**
 * 删除选择的行数据
 * @param {*} params - 删除行数据
 */
export async function deleteSeleteRows(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-config-items`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 创建门户模板配置明细
 * @async
 * @function createTemplatesConfig
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 * @param {String} params.groupName - 集团名称
 * @param {String} params.companyNum - 公司编码
 * @param {String} params.companyName - 公司名称
 * @param {String} params.webUrl - 二级域名
 * @param {String} params.tenantId - 租户ID
 */
export async function createTemplatesConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-config-items`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除模板配置明细项
 * @async
 * @function deleteTemplatesConfig
 * @param {String} params.enabledFlag - 是否启用
 */
export async function deleteTemplatesConfig(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/templates-config-items`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询模板信息
 * @async
 * @function fetchTemplateInfo
 */
export async function fetchTemplateInfo(params) {
  return request(`${SRM_PLATFORM}/v1/portal-assigns`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询组织信息
 * @async
 * @function getGroupInfo
 */
export async function getGroupInfo(params) {
  return request(`${HZERO_PLATFORM}/v1/${tenantId}/groups/self`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前公司中url列表
 * @async
 * @function fetchWebUrls
 */
export async function fetchWebUrls(params) {
  return request(`${HZERO_PLATFORM}/v1/${tenantId}/groups/self`, {
    method: 'GET',
    query: params,
  });
}
