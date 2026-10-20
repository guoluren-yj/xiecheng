import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
// import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const SRM_SMPC = '/smpc';

// 图片上传
export async function uploadImages(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/upload`, {
    method: 'GET',
    query: params,
  });
}

// 查询
export async function fetchImages(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports`, {
    method: 'GET',
    query: params,
  });
}

// 清除
export async function clearImages(batchNum) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/${batchNum}`, {
    method: 'DELETE',
  });
}

// 导入
export async function importImages(batchNum) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/${batchNum}`, {
    method: 'POST',
  });
}

// 查询
export async function fetchProgress(batchNum) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/import-process/${batchNum}`, {
    method: 'GET',
  });
}

// 查询
export async function fetchImportList(params) {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports`, {
    method: 'GET',
    query: params,
  });
}
