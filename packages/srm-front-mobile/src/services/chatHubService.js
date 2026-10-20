import request from 'utils/request';
import { SRM_SMBL, SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

// 获取在线沟通聊天室列表（只有房间信息，没有成员信息）
export async function getChatRoomListApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/room/list`, {
    method: 'GET',
    query: params,
  });
}

// 置顶在线沟通聊天室
export async function topChatRoomApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/user/room/top-room`, {
    method: 'POST',
    body: params,
  });
}

// 取消置顶在线沟通聊天室
export async function cancelTopChatRoomApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/user/room/cancel-top-room`, {
    method: 'POST',
    body: params,
  });
}

// 信息搜索（昵称、聊天内容）
export async function globalSearchApi(keyword) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/global-search`, {
    method: 'GET',
    query: { keyword },
  });
}

// 获取助手信息
export async function getAssistantInfoApi() {
  return request(
    `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/application-market-client/has-order-quota-purchase`,
    {
      method: 'GET',
    }
  );
}

export async function fetchAITypeList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-skill-configs/list`, {
    method: 'GET',
    query: params,
  });
}
