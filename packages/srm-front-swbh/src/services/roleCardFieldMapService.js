import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
//  import { parseParameters } from 'utils/utils';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 引用平台数据
export async function copyPlatformData(templateIds) {
  return request(`/swbh/v1/${organizationId}/template-header/copy-platform-data`, {
    method: 'POST',
    body: templateIds,
  });
}
// 字段映射保存
export async function fieldMapHeaderSave(params) {
  const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-header` : `/swbh/v1/template-header`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 字段映射保存
export async function fieldMapSave(params) {
  const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}//template-field` : `/swbh/v1//template-field`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 字段映射保存
export async function layoutDefinitionSave(params) {
  const url = isTenantRoleLevel() ? `/swbh/v1/${organizationId}/template-header` : `/swbh/v1/template-header`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// // 卡片汇总单据数量查询
// export async function getDocTotal() {
//   return request(`/swbh/v1/${organizationId}/card-search/total`, {
//     method: 'GET',
//   });
// }
