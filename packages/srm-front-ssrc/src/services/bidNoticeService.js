/**
 * bidNoticeService - 中标／招标公告
 * @date: 2019-09-11
 * @version: 1.0.0
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 中标公告查询
 * @export
 * @function fetchNoticeData
 * @param {Object} params 查询参数
 * @returns
 */
export async function fetchNoticeData(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 中标公告详情查询
 * @export
 * @function queryAcceptNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryAcceptNotice(params) {
  const { sourceFrom, sourceType, sourceHeaderId } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source-notices/accepted/${sourceFrom}/${sourceType}/${sourceHeaderId}/preview`,
    {
      method: 'GET',
    }
  );
}

/**
 * 中标公告保存
 * @export
 * @function saveAcceptNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function saveAcceptNotice(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 中标公告发布
 * @export
 * @function publishAcceptNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function publishAcceptNotice(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source-notice-rule/release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 招标公告查询
 * @export
 * @function queryBidNotice
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryBidNotice(params) {
  const { sourceFrom, sourceType, sourceHeaderId } = params;
  return request(
    `${SRM_SSRC}/v1/${organizationId}/source-notices/${sourceFrom}/${sourceType}/${sourceHeaderId}/preview`,
    {
      method: 'GET',
    }
  );
}

/**
 * 附件查询
 * @export
 * @function queryAttachment
 * @param {Object} params 查询参数
 * @returns
 */
export async function queryAttachment(params) {
  const { attachmentUUID, bucketName } = params;
  return request(
    `/hfle/v1/${organizationId}/files/${attachmentUUID}/file?attachmentUUID=${attachmentUUID}&bucketName=${bucketName}&tenantId=${organizationId}`,
    {
      method: 'GET',
    }
  );
}
