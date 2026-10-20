/**
 * service - 站内消息
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_MSG, HZERO_PLATFORM } from 'utils/config';
import {
  filterNullValueObject,
  parseParameters,
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

/**
 *
 *查询站内消息
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMessage(params) {
  const { organizationId, type, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));

  if (['platformNotice', 'companyNotice'].includes(type)) {
    const { page, size, ...otherParam } = param;
    return request(
      type === 'platformNotice'
        ? `${SRM_PLATFORM}/v1/query-exhibiting`
        : `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/query-exhibiting`,
      {
        method: 'POST',
        query: {
          page,
          size,
        },
        body: otherParam,
      }
    );
  }
  const reqUrl =
    // eslint-disable-next-line no-nested-ternary
    type === 'importHistory'
      ? `${HZERO_PLATFORM}/v1/${organizationId}/import-tasks/page/by-user`
      : type === 'exportHistory'
      ? `${HZERO_PLATFORM}/v1/${organizationId}/self/export-task`
      : `${HZERO_MSG}/v1/${organizationId}/messages/user`;
  if (type === 'notice') {
    param.userMessageTypeCode = 'NOTICE';
  }
  if (type === 'message') {
    param.userMessageTypeCode = 'MSG';
  }
  if (type === 'announce') {
    // param.receiverTypeCode = 'ANNOUNCE';
    // param.statusCode = 'PUBLISHED';
    param.userNotice = true;
    param.sort = 'publishedDate,DESC';
  }
  return request(reqUrl, {
    method: 'GET',
    query: param,
  });
}

/**
 *改变消息为未读
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function changeRead(params) {
  const { organizationId, type, userMessageIdList, ...other } = params;
  if (type === 'platformNotice') {
    let data = {};
    // 无readAll 表示勾选已读
    if (!params.readAll) {
      data.noticeIds = params.userMessageIdList;
    }
    return request(`${SRM_PLATFORM}/v1/read-record-exhibiting`, {
      method: 'POST',
      body: data,
    });
  } else if (type === 'companyNotice') {
    let data = {};
    // 无readAll 表示勾选已读
    if (!params.readAll) {
      data.noticeIds = params.userMessageIdList;
    }
    return request(`${SRM_PLATFORM}/v1/${organizationId}/read-record-exhibiting`, {
      method: 'POST',
      body: data,
    });
  }
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/read-flag`, {
    method: 'POST',
    query: other,
    body: userMessageIdList,
  });
}

/**
 *查询站内消息明细
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMessageDetail(params) {
  const { organizationId, userMessageId, type } = params;
  // 公告 传递过来的 userMessageId 实际上是 noticeId
  const noticeId = userMessageId;
  const reqUrl =
    'platformNotice' === type
      ? `${SRM_PLATFORM}/v1/notices/${noticeId}`
      : 'companyNotice' === type
      ? `${SRM_PLATFORM}/v1/${organizationId}/notices/${noticeId}`
      : `${HZERO_MSG}/v1/${organizationId}/messages/user/${userMessageId}`;
  return request(reqUrl, {
    method: 'GET',
  });
}

/**
 *删除站内消息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteMessage(params) {
  const { organizationId, ...other } = params;
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user`, {
    method: 'DELETE',
    query: other,
  });
}

export async function queryPlatformNoticeList(params) {
  return request(`${SRM_PLATFORM}/v1/query-exhibiting`, {
    method: 'POST',
    query: params,
  });
}

export async function queryCompanyNoticeList(params) {
  return request(`${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/query-exhibiting`, {
    method: 'POST',
    query: params,
  });
}
