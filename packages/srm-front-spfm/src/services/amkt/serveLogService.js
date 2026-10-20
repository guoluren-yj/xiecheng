/**
 * serveLog - 服务开通记录
 * @date: 2019-07-10
 * @author: WY <yang.wang08@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config.js';

const organizationId = getCurrentOrganizationId();

/**
 * 获取服务申请单列表
 * @async
 * @function getdate
 * @param {object}  params - 分页和查询参数
 * @returns {object} fetch Promise
 */
export async function applyQueryList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 获取已开通服务列表
 * @async
 * @function getdate
 * @param {object}  params - 分页和查询参数
 * @returns {object} fetch Promise
 */
export async function dredgeQueryList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests/opened-services`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 服务开通记录明细-申请头
 * @async
 * @function getdate
 * @param {object}  params - 采购申请行ID
 * @returns {object} fetch Promise
 */
export async function serveDetail(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/request/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 服务开通记录明细-服务列表
 * @async
 * @function getdate
 * @param {object}  params - 采购申请头ID
 * @returns {object} fetch Promise
 */
export async function serveQueryList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/request/detail/services`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 服务开通记录明细-保存
 * @async
 * @function getdate
 * @param {object}  params - 头信息和行信息
 * @returns {object} fetch Promise
 */
export async function serveSave(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 服务开通记录明细-提交
 * @async
 * @function getdate
 * @param {object}  params - 头信息和行信息
 * @returns {object} fetch Promise
 */
export async function serveSubmit(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/requests/submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 服务开通记录明细-删除
 * @async
 * @function getdate
 * @param {object}  params - 列表行ids
 * @returns {object} fetch Promise
 */
export async function serveDelete(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/client/request/fallback`, {
    method: 'POST',
    body: params,
  });
}
