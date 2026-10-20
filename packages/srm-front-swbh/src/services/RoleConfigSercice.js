// 维护单据配置接口
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_SWBH } from '../routes/components/utils/config';
import { lowcodeOrganizationURL } from '../routes/components/utils';

const organizationId = getCurrentOrganizationId();
const TenantRoleLevel = isTenantRoleLevel();
const prefix = TenantRoleLevel ? `${SRM_SWBH}/v1/${organizationId}` : `${SRM_SWBH}/v1`;

/**
 * 新建动态类型
 * */
export async function createRoleDynamicType(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-category`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存动态类型
 * */
export async function saveRoleDynamicType(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-category`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 新建动态定义
 * */
export async function createRoleDynamicDefine(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存动态定义
 * */
export async function saveRoleDynamicDefine(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 新建待办定义
 * */
export async function createRoleToDo(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存待办定义
 * */
export async function saveRoleToDo(params) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions`;
  return request(url, {
    method: 'PUT',
    body: params,
  });
}

/**
 *  关注类型
 *引用预定义动态
 * @returns
 */
export async function getDynamicType() {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-category/copy-platform-data`;
  return request(url, {
    method: 'POST',
    body: [],
  });
}
/**
 * 关注定义
 * 引用预定义动态
 * @returns
 */
export async function getDynamicDefine(actionIds) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/action-definition/copy-platform-data`;
  return request(url, {
    method: 'POST',
    body: actionIds,
  });
}
/**
 * 待办定义
 * 引用预定义动态
 * @returns
 */
export async function getToDoDefine(todoIds) {
  const url = `${lowcodeOrganizationURL({ route: SRM_SWBH })}/todo-definitions/copy-platform-data`;
  return request(url, {
    method: 'POST',
    body: todoIds,
  });
}
