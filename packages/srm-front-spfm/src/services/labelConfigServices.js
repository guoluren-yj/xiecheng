// POST
import { SRM_PLATFORM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const isTenantRole = isTenantRoleLevel();

/**
 * 保存标签配置信息
 * @param {Object} params
 * @export
 */
export async function saveDocLabel(param) {
  if (isTenantRole) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/doc-labels`, {
      method: 'POST',
      body: filterNullValueObject(param),
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/doc-labels`, {
      method: 'POST',
      body: filterNullValueObject(param),
    });
  }
}

/**
 * 删除平台层,租户级,租户数据
 * @param {Object} params
 * @export
 */
export async function deleteDocLabel(param) {
  return request(`${SRM_PLATFORM}/v1/doc-labels`, {
    method: 'DELETE',
    body: param,
  });
}

// 获取平台级,标签数据
export async function getDetailLabel(param) {
  if (isTenantRole) {
    return request(`${SRM_PLATFORM}/v1/${organizationId}/doc-labels/${param.labelId}`, {
      method: 'GET',
    });
  } else {
    return request(`${SRM_PLATFORM}/v1/doc-labels/${param.labelId}`, {
      method: 'GET',
    });
  }
}

// 租户级复制平台级的标签数据
export async function copyLabel(param) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/doc-labels/copy`, {
    method: 'POST',
    body: param,
  });
}
