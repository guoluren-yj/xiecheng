/**
 * dataManagementService.js - 资料管理
 * @date: 2019-4-3
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';
// import { HZERO_RPT } from 'utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachments`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 *  查询集团
 * @export
 */
export async function getGroup() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachment-group`, {
    method: 'GET',
  });
}

/**
 * fetchOperationRecordList
 * @param {object} params
 */
export async function fetchOperationRecordList(params) {
  const { attachmentId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachments/action/${attachmentId}`, {
    method: 'GET',
    query: parseParameters(otherParams),
  });
}

/**
 *  保存和更新采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 */
export async function saveList(payload) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachments`, {
    method: 'PUT',
    body: payload,
  });
}

/**
 *  附件上传时 更新操作记录
 * @export
 * @param {Object} params - 查询参数
 */
export async function updateOperator(payload) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/portal-attachments/action-update/${payload.attachmentId}`,
    {
      method: 'POST',
      body: payload,
    }
  );
}

/**
 *  查询公司是否有域名
 * @export
 * @param {Object} params - 查询参数
 */
export async function queryAssign(params) {
  const { companyId, ...otherParams } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachments/assign/${companyId}`, {
    method: 'GET',
    query: parseParameters(otherParams),
  });
}

/**
 *  查询采购方列表的数据
 * @export
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchViewList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/portal-attachments-login`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
