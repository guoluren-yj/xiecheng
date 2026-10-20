/**
 * service - 企业风险监控
 * @date: 2019-07-02
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询全量风险监控
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryMonitoring(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询选择供应商的数据
 * @async
 * @param {Object} params - 查询参数
 */
export async function querySupplier(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/supplier`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 权限控制监控分组查询
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryPermissionGroups(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group/permission`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询监控分组
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryGroups(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存监控分组
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveGroups(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group`, {
    method: 'POST',
    body: params.adds,
  });
}

/**
 * 删除监控分组
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteGroups(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group/${params.monitorGroupId}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询风险分类
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryRiskClassify(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存风险分类
 * @async
 * @param {Object} params - 查询参数
 */
export async function saveRiskClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category`, {
    method: 'POST',
    body: params.tableValues,
  });
}

/**
 * 启用风险分类
 * @async
 * @param {Object} params - 查询参数
 */
export async function enabledRiskClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/enable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询所有事件维度
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryRiskDimAll(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/dim-assign/all`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询已分配事件维度
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryRiskDimChecked(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/dim-assign/checked`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 风险分类维度分配
 * @async
 * @param {Object} params - 查询参数
 */
export async function assignRiskDim(params) {
  // const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-category/dim-assign`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 取消监控
 * @async
 * @param {Array} params
 */
export async function cancelMonitoring(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/cancel`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询修改分组
 * @async
 * @param {Array} params
 */
export async function queryEditGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group/assign`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 分配分组
 * @async
 * @param {Array} params
 */
export async function assignGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/update-groupe`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 新建监控
 * @async
 * @param {Array} params
 */
export async function createMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询风险分析Url
 * @async
 * @param {Array} params
 */
export async function queryAllRisk(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-all`, {
    method: 'GET',
    // responseType: 'text',
    query: params,
  });
}

/**
 * 查询风险动态监控Url
 * @async
 * @param {Array} params
 */
export async function queryEnterpriseRisk(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    // responseType: 'text',
    query: params,
  });
}

/**
 * 查询子账户
 */
export async function queryChildAccount(params) {
  const { monitorGroupId, ...others } = params;
  const param = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group-users/${monitorGroupId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 分配子账户
 */
export async function asignChildAccount(params) {
  const { monitorGroupId, childAccountList } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group-users/${monitorGroupId} `, {
    method: 'POST',
    body: childAccountList,
  });
}

/**
 * 取消分配子账户
 */
export async function unAsignChildAccount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group-users`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 校验非平台企业是否重复
 */
export async function checkNameRepeat(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/validPartnerCompanyNameIsExists`, {
    method: 'POST',
    body: params,
  });
}
