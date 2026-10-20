import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 上传裁剪好的头像
 * @async
 * @function uploadAvatar
 * @returns {object} fetch Promise
 */
export async function uploadAvatar(params) {
  const formData = new FormData();
  formData.append('bucketName', params.bucketName);
  formData.append('directory', params.directory);
  formData.append('fileName', params.uploadImgName);
  formData.append('file', params.image, params.uploadImgName);
  return request(`/hfle/v1/${organizationId}/files/multipart`, {
    method: 'POST',
    type: 'FORM',
    processData: false, // 不会将 data 参数序列化字符串
    body: formData,
    responseType: 'text',
  });
}

/**
 * 获取可上传文件的类型和大小
 * @param {Number} params.tenantId
 * @param {String} params.bucketName
 */
export async function fetchEnabledFile(params) {
  return request(`/hfle/v1/${organizationId}/upload-configs/detail`, {
    method: 'GET',
    query: params,
  });
}

// 批量上传
export function batchUploadImage(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file, file.name);
  });
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-image-imports/batch-upload`, {
    method: 'POST',
    body: formData,
  });
}
