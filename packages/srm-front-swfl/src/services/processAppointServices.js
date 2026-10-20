/**
 * services - 流程指定
 * @date: 2019-07-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 流程指定查询
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function queryProcessConfig(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign`, {
    method: 'GET',
    query,
  });
}

/**
 * 流程指定保存
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function saveProcessConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 流程指定删除
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function deleteProcessConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 变量配置查询
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function queryVariableConfig(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${HZERO_HWFP}/v1/${organizationId}/process-assign-variable/${query.procAssignConfId}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 变量配置保存
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function saveVariableConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-variable`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 变量配置删除
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function deleteVariableConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-variable`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 规则配置查询
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function queryRuleConfig({ params, data }) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule/list`, {
    method: 'POST',
    query,
    body: filterNullValueObject(data),
  });
}

/**
 * 规则配置保存
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function saveRuleConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 规则配置删除
 * @param {Object} params - 查询参数
 * @export
 * @returns
 */
export async function deleteRuleConfig(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign-rule`, {
    method: 'DELETE',
    body: params,
  });
}

// 导入JSON文件
export async function importDataJson(param) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign/import-json`, {
    method: 'POST',
    body: param,
    responseType: 'text',
  });
}

// 导出json文件
export async function exportDataToJson(param) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign/export-json`, {
    method: 'POST',
    responseType: 'text',
    body: param,
  });
}

// 查看导入记录
export async function queryImportDataHistory() {
  return request(`${HZERO_HWFP}/v1/${organizationId}/process-assign/import-log`, {
    method: 'POST',
  });
}
