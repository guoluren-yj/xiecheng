/**
 * service - 供应商能力定义
 * @date: 2018-10-8
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

/**
 *查询附件列表数据
 *
 * @async
 * @function queryAttachment
 * @returns {Object} fetch Promise
 */
export async function queryAttachment(params) {
  const { organizationId, investgProserviceId, ...otherParams } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/firm-change-proservice-atts/${investgProserviceId}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - 文件url
 * @returns {Object} fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { organizationId, bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/**
 * 删除附件列表行
 * @async
 * @function onAttachmentRemove
 * @returns {Object} fetch Promise
 */
export async function onAttachmentRemove(params) {
  return request(
    `${SRM_SSLM}/v1/${params.organizationId}/firm-change-proservice-atts/batch-remove`,
    {
      method: 'DELETE',
      body: params.attIdList,
    }
  );
}
