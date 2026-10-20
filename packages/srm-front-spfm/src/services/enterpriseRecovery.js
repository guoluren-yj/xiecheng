import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 获取操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {!number} organizationId - 组织ID
 * @param {!number} prHeaderId - 头ID
 * @param {String} page - 页码
 * @param {String} size - 页数
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-requests/${query.prHeaderId}/actions`, {
    method: 'GET',
    query,
  });
}

/**
 * 按行引用创建前校验
 * @export
 * @param {Object} params
 */
export async function checkOrderRule(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/po_config`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 按行引用创建
 * @export
 * @param {Object} params
 */
export async function lineCreate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header/from-pr/line_new`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询配置中心
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}
