import request from 'utils/request';
import { SRM_SMPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 图片上传
export async function uploadImages(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/upload`, {
    method: 'GET',
    query: params,
  });
}

// 查询
export async function fetchImages(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports`, {
    method: 'GET',
    query: params,
  });
}

// 清除
export async function clearImages(batchNum) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/${batchNum}`, {
    method: 'DELETE',
  });
}

// 导入
export async function importImages(batchNum) {
  return request(`${SRM_SMPC}/v1/${organizationId}/catalog-icon-imports/${batchNum}`, {
    method: 'POST',
  });
}
