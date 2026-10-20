/**
 * registerApplicationService.js - 供应商生命周期注册申请单 service
 * @date: 2018-10-26
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 根据租户 ID 及申请 ID 查询注册申请明细
 * @param {Object} params - 查询参数
 */
export async function queryRegisterDetail(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/register/${requisitionId}`, {
    method: 'GET',
  });
}

/**
 * 保存供应商生命周期注册申请
 * @param {Object} params - 添加请求参数
 */
export async function saveRegister(params) {
  const method = 'POST';
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/register`, {
    method,
    body: params,
  });
}

/**
 * 发布供应商生命周期注册申请
 * @param {Object} params - 发布请求参数
 */
export async function releaseRegister(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/register/release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商生命周期注册申请
 * @param {Object} params - 查询参数
 */
export async function deleteRegister(params) {
  const { requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/register/${requisitionId}`, {
    method: 'DELETE',
  });
}
