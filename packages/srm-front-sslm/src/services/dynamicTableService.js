/**
 * dynamicTableService.js - 动态表格 service
 * @date: 2021-06-23
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SSLM, SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询表格列配置
 * @param {Object} params - 查询参数
 */
export async function queryTableConfig(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-settings/rel-table-records`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询表格code集合
 * @param {Object} params - 查询参数
 */
export async function queryTableCodeList(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-settings`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询表格数据
 * @param {Object} params - 查询参数
 */
export async function queryTableData(params) {
  const newParams = filterNullValueObject(params);
  const { page = {}, ...other } = newParams;
  const query = parseParameters({
    page: {
      ...page,
    },
  });
  return request(`${SRM_SSLM}/v1/${organizationId}/model-data/listTableData`, {
    method: 'POST',
    query,
    body: {
      ...other,
    },
  });
}

/**
 * 保存表格数据
 * @param {Object} params - 查询参数
 */
export async function saveData(body) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-data`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询生命周期第一次新建模型表数据
 * @param {Object} params - 查询参数
 */
export async function queryLifecycleModelData(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-settings/bySource`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询配置表配置
 * @param {Object} params - 查询参数
 */
export async function queryRelTableConfig(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/null/available-tables`, {
    method: 'GET',
    query: {
      organizationId,
      platformOnly: false,
      ...query,
    },
  });
}

/**
 * 删除表格数据
 * @param {Object} params - 查询参数
 */
export async function deleteData(body) {
  return request(`${SRM_SSLM}/v1/${organizationId}/model-data`, {
    method: 'DELETE',
    body,
  });
}
