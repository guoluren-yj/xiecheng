import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

export async function getchatroomInfoApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/room/get-info`, {
    method: 'POST',
    body: params,
  });
}

export async function getchatroomBasicInfoApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/room/get-basic-info`, {
    method: 'POST',
    body: params,
  });
}

// 请求消息
export async function getChatRoomMessagesApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/list`, {
    method: 'GET',
    query: params,
  });
}

// 发送消息
export async function sendMessageApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/send`, {
    method: 'POST',
    body: params,
  });
}

// 查询房间公告
export async function queryRoomAnnouncementApi(roomId, companyId) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/last-announcement`, {
    method: 'GET',
    query: {
      roomId,
      companyId,
    },
  });
}

// 请求历史消息
export async function getChatRoomHistoryMessagesApi(params) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/search-message`, {
    method: 'GET',
    query: params,
  });
}

// 撤回消息
export async function recallMessageApi(params) {
  const url = `/smbl/v1/chat-online/messages/recall-message`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 禁言/接触禁言
export async function muteChatRoomApi(muteFlag, roomId) {
  const url = muteFlag
    ? `${SRM_SMBL}/v1/chat-online/room/mute-room`
    : `${SRM_SMBL}/v1/chat-online/room/unmute-room`;
  return request(url, {
    method: 'POST',
    body: {
      roomId,
    },
  });
}

// 房间新增人员
export async function addChatRoomMemberApi(params) {
  const url = `${SRM_SMBL}/v1/chat-online/room/add-member`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

// 房间移除人员
export async function removeChatRoomMemberApi(params) {
  const url = `${SRM_SMBL}/v1/chat-online/room/remove-member`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

/**
 * 加载入群前消息
 * @param {*} params
 * @returns
 */
export async function fetchBeforeInnerMsg(params) {
  return request(`${SRM_SMBL}/v1/chat-online/messages/sync-message`, {
    method: 'POST',
    body: params,
  });
}
