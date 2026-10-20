/**
 * service 个性化单元
 * @date: 2019-12-23
 * @version: 0.0.1
 * @author: xiongjg
 * @copyright Copyright (c) 2018, Hands
 */

import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_HMDE } from 'utils/config';
import {
  parseParameters,
  filterNullValueObject,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';

const prefix = isTenantRoleLevel()
  ? `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}`
  : `${HZERO_PLATFORM}/v1`;

const hmdePrefix = isTenantRoleLevel()
  ? `${HZERO_HMDE}/v1/${getCurrentOrganizationId()}`
  : `${HZERO_HMDE}/v1`;

/**
 * 查询所有个性化单元
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${prefix}/customize/unit/list`, {
    query,
  });
}

/**
 * 查询菜单树
 */
export async function queryMenuTree() {
  return request(`${prefix}/customize/unit/menu-tree`);
}

/**
 * 查询菜单树-平台级
 */
 export async function queryMenuTreePlatform() {
  return request(`${prefix}/customize/unit/menu-tree/platform`);
}

/**
 * 创建个性化单元
 */

export async function createUnit(params) {
  return request(`${prefix}/customize/unit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 个性化单元详情以及字段配置
 */
export async function queryUnitDetail(params) {
  return request(`${prefix}/customize/unit/detail`, {
    query: params,
  });
}

/**
 * 修改个性化单元
 *
 */
export async function modifyUnit(params) {
  return request(`${prefix}/customize/unit`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 保存个性化单元字段
 */
export async function saveUnitField(params) {
  return request(`${prefix}/customize/unit/field-save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取模型关联的相关模型
 */
export async function queryRelationModels(params) {
  // return request(`${prefix}/customize/model/list/unit`, {
  return request(`${hmdePrefix}/data-source-biz/view-model`, {
    query: params,
  });
}

/**
 * 删除个性化单元字段
 */
export async function deleteField(params) {
  return request(`${prefix}/customize/unit/field`, {
    method: 'DELETE',
    query: params,
  });
}

/**
 * 查询个性化单元分组
 */
export async function queryGroup(params) {
  return request(`${prefix}/customize/unit/group`, {
    query: params,
  });
}

/**
 * 创建个性化单元分组
 */
export async function createGroup(params) {
  return request(`${prefix}/customize/unit/group`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改个性化单元组信息
 */
export async function modifyGroup(params) {
  return request(`${prefix}/customize/unit/group`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询个性化单元组下的所有个性化单元
 */
export async function queryGroupUnits(params) {
  return request(`${prefix}/customize/unit/list/group`, {
    query: params,
  });
}

/**
 * 复制个性化单元
 */
export async function copyUnit(params) {
  return request(`${prefix}/customize/unit/copy-new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修复个性化单元关联关系
 */
export async function fixUnitRelation(params, currentUnitCode) {
  return request(`${prefix}/customize/unit/copy-fix`, {
    method: 'POST',
    query: {currentUnitCode},
    body: params,
  });
}

/**
 * 获取关联单元的字段配置
 */
export async function queryRelatedUnits(params = {}) {
  return request(`${prefix}/unit-config/unit/related`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 获取关联单元的字段配置
 */
 export async function queryCopyRewriteUnits(params = {}) {
  return request(`${prefix}/customize/unit/copy-related-unit`, {
    query: params,
    method: 'GET',
  });
}

/**
 * 查询业务对象
 */
export async function queryBusinessObjectRelationsTree(params = {}) {
  return request(`${hmdePrefix}/business-object-relations/tree`, {
    query: params,
    method: 'GET',
  });
}

