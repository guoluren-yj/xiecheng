import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 图片上传
// export async function uploadImages(params) {
//   return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/upload`, {
//     method: 'GET',
//     query: params,
//   });
// }

// // 查询
// export async function fetchImages(params) {
//   return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports`, {
//     method: 'GET',
//     query: params,
//   });
// }

// // 清除
// export async function clearImages(batchNum) {
//   return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/${batchNum}`, {
//     method: 'DELETE',
//   });
// }

// 导入
export async function importImages(datas) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-form/picture-import`, {
    method: 'POST',
    body: datas,
  });
}
