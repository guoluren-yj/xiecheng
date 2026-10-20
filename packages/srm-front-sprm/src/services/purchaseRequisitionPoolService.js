import request from 'utils/request';
import { SRM_SPUC, SRM_PLATFORM, SRM_SSRC, SRM_SPRM } from '_utils/config';
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

/**
 * 寻源明细(新)-配置表配置新老节点
 * */
export async function fetchConfigSheetRfxPrepare(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_old_ui_config/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 申请转询价创建前校验API
 * @async
 * @function checkApplyToInquiry
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function checkApplyToInquiry(params) {
  const { prLineIdList, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/share/valid-purchase`, {
    method: 'POST',
    body: { prLineIdList, ...otherParams },
  });
}

/**
 * 申请转询价创建API
 * @async
 * @function createApplyToInquiry
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function createApplyToInquiry(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/rfx/application`, {
    method: 'POST',
    body: params,
  });
}

// 获取老订单工作台租户配置表
export async function fetchOrderConfig(params) {
  const tableCode = 'spuc_old_order_tenant';
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${tableCode}/list-from-site`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 退回至待分配
 */
export async function backUnassign(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/line/batch/back/unassign`, {
    method: 'PUT',
    body: params,
  });
}
