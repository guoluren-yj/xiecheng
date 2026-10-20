import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import {
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';

const prefix = isTenantRoleLevel()
  ? `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}`
  : `${HZERO_PLATFORM}/v1`;

/**
 * 查询指定单元下的筛选器列表
 */
export async function queryUnitFilter(params = {}, mode, tplParams) {
  return request(`${prefix}/customize/${mode === 'tpl' ? 'tpl/' : ''}filter`, {
    method: 'GET',
    query: {
      ...(params || {}),
      ...(tplParams || {}),
    }
  });
}

/**
 * 保存筛选器配置
 */
export async function saveUnitFilter(params = {}, mode, tplParams) {
  return request(`${prefix}/customize/${mode === 'tpl' ? 'tpl/' : ''}filter`, {
    method: 'POST',
    body: params,
    query: {
      ...(tplParams || {}),
    }
  });
}

/**
 * 复制筛选器配置
 */
export async function copyUnitFilter(params = {}) {
  return request(`${prefix}/customize/filter/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除指定筛选器
 */
export async function deleteUnitFilter(params = {}, mode, tplParams) {
  return request(`${prefix}/customize/${mode === 'tpl' ? 'tpl/' : ''}filter`, {
    method: 'DELETE',
    query: {
      ...(params || {}),
      ...(tplParams || {}),
    }
  });
}

/**
 *  保存筛选器字段配置
 */
export async function saveFilterField(params = [], mode, tplParams) {
  const { unitCode } = params[0];
  return request(`${prefix}/customize/${mode === 'tpl' ? 'tpl/' : ''}filter/field`, {
    method: 'POST',
    body: params,
    query: {
      unitCode,
      ...(tplParams || {}),
    },
  });
}

/**
 *  删除筛选器字段配置
 */
export async function removeFilterField({ unitCode, filterFieldIds }, mode, tplParams) {
  return request(`${prefix}/customize/${mode === 'tpl' ? 'tpl/' : ''}filter/field`, {
    method: 'DELETE',
    query: {
      unitCode,
      ...(tplParams || {}),
    },
    body: filterFieldIds,
  });
}
