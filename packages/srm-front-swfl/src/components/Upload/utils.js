import qs from 'query-string';

import {
  filterNullValueObject,
  getAccessToken,
  getRequestId,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';

/**
 * 通过文件服务器的接口获取可访问的文件URL
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 * @param {String} storageCode 存储配置编码
 */
// @ts-ignore
export function getAttachmentUrl(url, bucketName, tenantId, bucketDirectory, storageCode) {
  const accessToken = getAccessToken();
  const requestId = getRequestId();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      storageCode,
      access_token: accessToken,
      'H-Request-Id': requestId,
      directory: bucketDirectory,
    })
  );
  let newUrl = url;
  const urlPrefix = !isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/`
    : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/`;
  if (!url.includes('access_token')) {
    newUrl = urlPrefix.concat(`files/download?${params}`).concat(`&url=${encodeURIComponent(url)}`);
  }
  return newUrl;
}
