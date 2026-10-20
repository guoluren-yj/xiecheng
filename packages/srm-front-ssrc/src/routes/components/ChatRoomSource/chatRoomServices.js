import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';

import { Prefix } from '@/utils/globalVariable';

/**
 * 采购 查询聊天室 参数
 *
*/
export function fetchSourcePurchaseHeader(params = {}) {
  const { organizationId, } = params || {};
  return request(`${Prefix}/${organizationId}/rfx/chat-room/purchaser/param`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商 查询聊天室 参数
*/
export function fetchSourceSupplierHeader(params = {}) {
  const { organizationId, } = params || {};
  return request(`${Prefix}/${organizationId}/rfx/chat-room/supplier/param`, {
    method: 'GET',
    query: params,
  });
}

export function chatRoomHasInit(params = {}) {
  return request(`${SRM_SMBL}/v1/chat-online/room/has-init`, {
    method: 'GET',
    query: params,
  });
}
