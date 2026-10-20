import request from 'utils/request';
import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 在线沟通
export async function fetchChatAPI(params) {
    return request(`${SRM_SLOD}/v1/${organizationId}/delivery/${params.nodeTemplateCode}/${params.nodeConfigId}/init/room`, {
      method: 'GET',
      query: params,
    });
}

// 未读消息查询
export async function fetchUnreadChatAPI(params) {
  const {body, nodeTemplateCode, nodeConfigId, ...others} = params;
  return request(`${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/messages/unread-num`, {
    query: others,
    method: 'POST',
    body,
  });
}