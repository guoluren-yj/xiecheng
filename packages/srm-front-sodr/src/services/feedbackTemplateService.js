/**
 * service - 反馈单来源服务定义
 * @date: 2018-11-14
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const url = isTenantRoleLevel() ? '' : '/platform';

/**
 *
 * 复制反馈模板
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function copyFeedback(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/template/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存反馈模板
 *
 * @export
 * @param {Object} params 保存的数据
 * @returns
 */
export async function saveFeedback(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/template${url}`, {
    method: 'POST',
    body: params,
  });
}

// 发布
export async function publishFeedback(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/template${url}`, {
    method: 'PUT',
    body: params,
  });
}

export async function saveFeedbackField(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/feed-back-field${url}`, {
    method: 'POST',
    body: params,
  });
}

export async function getExportFileUrl(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/feed-back-field/excel/export`, {
    method: 'POST',
    body: params,
  });
}
