/**
 * docTransferDefinService.js - 单据转交定义 service
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

/**
 * 根据租户 ID 查询 单条转交定义数据明细
 * @param {Object} params - 查询参数
 */
export async function queryTransferOne(docHeaderId) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-headers/selectOne/?docHeaderId=${docHeaderId}`, {
    method: 'GET',
  });
}

export async function createTransfer(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-headers/insert`, {
    method: 'POST',
    body: data,
  });
}

export async function updateTransfer(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-headers/update`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteTransferSurface(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-lines`, {
    method: 'DELETE',
    body: data,
  });
}

export async function deleteTransferTenant(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-tenants`, {
    method: 'DELETE',
    body: data,
  });
}

export async function deleteTransferRelation(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-lines/remove-relation`, {
    method: 'DELETE',
    body: data,
  });
}

export async function deleteTransferCondition(data) {
  return request(`${SRM_PLATFORM}/v1/doc-deliver-lines/remove-condition`, {
    method: 'DELETE',
    body: data,
  });
}
