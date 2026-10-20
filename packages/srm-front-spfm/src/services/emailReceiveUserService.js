/**
 * emailReceiveUserService.js - 平台邮件接收用户定义 service
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 根据租户 ID 查询 平台邮件接收用户
 * @param {Object} params - 查询参数
 */
export async function queryNoticeUser(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-notice-user`, {
    method: 'GET',
    query,
  });
}
/**
 * 根据租户 ID 查询 平台邮件接收未定义的用户
 * @param {Object} params - 查询参数
 */
export async function queryUdtUser(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-notice-user/getUsers`, {
    method: 'GET',
    query,
  });
}

/**
 * 新建平台邮件接收用户
 * @param {Object} params - 查询参数
 */
export async function addNoticeUser(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-notice-user`, {
    method: 'POST',
    body: params,
  });
}

/**
 *  删除平台邮件接收用户
 * @param {Object} params - 查询参数
 */
export async function removeNoticeUser(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-notice-user`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *  更新平台邮件接收用户
 * @param {Object} params - 查询参数
 */
export async function updateNoticeUser(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-notice-user/update`, {
    method: 'POST',
    body: params,
  });
}
