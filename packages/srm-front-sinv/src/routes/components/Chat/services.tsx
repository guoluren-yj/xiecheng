import request from 'utils/request';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 查询状态的节点信息
export async function fetchChatAPI(params) {
    return request(`${SRM_SPUC}/v1/${organizationId}/sinv/chat/online/init/room`, {
      method: 'GET',
      query: params,
    });
}

// 未读消息查询
export async function fetchUnreadChatAPI(params) {
  const {body, ...others} = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/chat/online/messages/unread-num`, {
    query: others,
    method: 'POST',
    body,
  });
}