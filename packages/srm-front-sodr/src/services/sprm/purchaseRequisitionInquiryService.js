/**
 * demandQuery - 需求查询
 * @date: 2019-01-22
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SPUC, SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SPUC}/v1`;

/**
 * 查询需求列表页数据
 * @param {*} params
 * @returns
 */
export async function queryDemandList({ tenantId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-requests`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询非erp需求明细数据
 */
export async function queryNotErpDetail({ tenantId, prHeaderId }) {
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 查询erp需求明细数据
 */
export async function queryErpDetail({ tenantId, prHeaderId }) {
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-request/${prHeaderId}`, {
    method: 'GET',
  });
}
/**
 * 查询非erp采购申请行数据
 */
export async function queryNotErpLines({ tenantId, prHeaderId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-requests/${prHeaderId}/lines`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询erp采购申请行数据
 */
export async function queryErpLines({ tenantId, prHeaderId, ...params }) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${tenantId}/purchase-requests/${prHeaderId}/lines`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询操作记录
 * @param {*} params
 * @returns
 */
export async function queryOperationRecords(params) {
  return request(`${prefix}`, {
    method: 'GET',
    query: params,
  });
}
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
 * 采购申请同步到ERP
 * @export
 * @param {Object} prHeaderIdList
 */
export async function reImportERP(prHeaderIdList) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-sync-erp`, {
    method: 'POST',
    body: prHeaderIdList,
  });
}
