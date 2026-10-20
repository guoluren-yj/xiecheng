import request from 'utils/request';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_MSG } from 'utils/config';
import { SRM_PLATFORM } from '_utils/config';

export async function fetchUnreadMessageCount() {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_MSG}/v1/${getCurrentOrganizationId()}/messages/user/unread-count`
      : `${HZERO_MSG}/v1/messages/user/unread-count`,
    {
      method: 'GET',
    }
  );
}

export async function fetchUnreadMessageList(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_MSG}/v1/${getCurrentOrganizationId()}/messages/user/msg-with-notice`
      : `${HZERO_MSG}/v1/messages/user/msg-with-notice`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function readAllUnreadMessage(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_MSG}/v1/${getCurrentOrganizationId()}/messages/user/msg-card-read`
      : `${HZERO_MSG}/v1/messages/user/msg-card-read`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function readSingleNotice(params) {
  const { type, ...other } = params;
  return request(
    type === 'C'
      ? `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/read-record-exhibiting`
      : `${SRM_PLATFORM}/v1/read-record-exhibiting`,
    {
      method: 'POST',
      body: other,
    }
  );
}
export async function readSingleMessage(userMessageId) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_MSG}/v1/${getCurrentOrganizationId()}/messages/user/${userMessageId}`
      : `${HZERO_MSG}/v1/messages/user/${userMessageId}`,
    {
      method: 'GET',
    }
  );
}
