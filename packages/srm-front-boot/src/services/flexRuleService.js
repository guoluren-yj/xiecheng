/**
 * service 弹性域模型
 * @date: 2019-4-25
 * @version: 0.0.1
 * @author: lijun <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

function checkApiTenantPrefix() {
  const orgId = getCurrentOrganizationId();
  return isTenantRoleLevel() ? `/${orgId}` : '';
}

const organizationId = getCurrentOrganizationId();
/**
 * 弹性域规则列表
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-rules`, {
    query,
  });
}

/**
 * 弹性域规则明细
 * @async
 * @function queryDetail
 * @param {number} ruleId - 主键ID
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryDetail(ruleId) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-rules/${ruleId}`);
}

/**
 * 创建弹性域模型
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function create(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-rules`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域模型
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function update(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-rules`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 删除弹性域模型
 * @async
 * @function deleteDatabase
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteRows(data) {
  return request(`${HZERO_PLATFORM}/v1${checkApiTenantPrefix()}/flex-rules`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 弹性域规则明细列表
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryFlexRuleDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details`, {
    query,
  });
}

/**
 * 弹性域规则明细字段列表
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryFlexDetailFields(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-fields`, {
    query,
  });
}

/**
 * 弹性域规则明细配置列表
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryFlexDetailConfigs(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-configs`, {
    query,
  });
}

/**
 * 创建弹性域规则明细字段
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function createFlexDetailFields(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-fields`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域规则明细字段
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function updateFlexDetailFields(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-fields`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 删除弹性域规则明细字段
 * @async
 * @function deleteDatabase
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteFlexDetailFields(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-fields`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 创建弹性域规则明细字段
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function createFlexDetailConfigs(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-configs`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域规则明细字段
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function updateFlexDetailConfigs(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-configs`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 删除弹性域规则明细配置
 * @async
 * @function deleteDatabase
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteFlexDetailConfigs(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-detail-configs`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}

/**
 * 根据规则明细Id查询表格字段
 * @async
 * @function queryList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryFlexDetailConfigsTableColumns(ruleDetailId) {
  return request(
    `${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/${ruleDetailId}/table-columns`,
    {
      query: { ruleDetailId },
    }
  );
}

/**
 * 删除弹性域规则明细
 * @async
 * @function deleteDatabase
 * @param {number} data - 数据
 * @returns {object} fetch Promise
 */
export async function deleteFlexRuleDetails(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details`, {
    method: 'DELETE',
    body: data,
  });
}

/**
 * 创建弹性域规则明细
 * @async
 * @function create
 * @param {object} params - 保存数据
 * @returns {object} fetch Promise
 */
export async function createFlexRuleDetails(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details`, {
    method: 'POST',
    body: data,
  });
}

/**
 * 修改弹性域规则明细
 * @async
 * @function create
 * @param {object} data - 更新数据
 * @returns {object} fetch Promise
 */
export async function updateFlexRuleDetails(data) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 弹性域规则明细的明细
 * @async
 * @function queryList
 * @param {object} ruleDetailId - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryFlexRuleDetail(ruleDetailId) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/${ruleDetailId}`, {
    query: { ruleDetailId },
  });
}

/**
 * 预览条件公式
 * @async
 * @function queryFormula
 * @param {object} ruleDetailId - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryFormula(ruleDetailId) {
  return request(
    `${HZERO_PLATFORM}/v1/${organizationId}/flex-rule-details/preview/${ruleDetailId}`,
    {
      responseType: 'text',
    }
  );
}
