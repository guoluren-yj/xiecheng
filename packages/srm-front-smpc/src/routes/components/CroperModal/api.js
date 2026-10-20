import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

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
  return request(`/hfle/v1/${getCurrentOrganizationId()}/files/multipart`, {
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
  return request(`/hfle/v1/${getCurrentOrganizationId()}/upload-configs/detail`, {
    method: 'GET',
    query: params,
  });
}
