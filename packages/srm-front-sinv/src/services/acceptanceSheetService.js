/**
 * purchaseReceptionService - 事务接收
 * @date: 2019-1-28
 * @author: lixiaolong <xialong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import request from 'utils/request';
import { getCurrentOrganizationId, filterNullValueObject, parseParameters } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询列表的数据
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/page-list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询列表明细的数据
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryDetail(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/line/page-list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询详情头界面信息
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryHeader(params) {
  const { id, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/${id}`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询详情行界面信息
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function queryDetailList(params) {
  const { id, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-line/${id}/lines`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询审批列表的数据
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function fetchApproveList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/approval-list`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询审批详情头界面信息
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function fetchApproveHeader(params) {
  const { id, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/${id}`, {
    method: 'GET',
    query,
  });
}
/**
 * 查询审批详情行界面信息
 * @param {string} params.size - 分页大小
 * @param {string} params.page -当前页
 */
export async function fetchApproveDetailList(params) {
  const { id, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-line/${id}/lines`, {
    method: 'GET',
    query,
  });
}

/**
 * 审批
 */
export async function approveAcceptance(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/approval`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 拒绝
 */
export async function rejectAcceptance(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/reject`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 操作记录
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-list-actions`, {
    method: 'GET',
    query,
  });
}

/**
 * 验收单重新同步
 */
export async function resyncAcceptance(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/ac-header/approve-return-erp`, {
    method: 'POST',
    body: params,
  });
}
