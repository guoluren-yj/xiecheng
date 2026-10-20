/**
 * index.js - 供应商扣款查询
 * @date: 2019-3-11
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/confirmed-list/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 操作记录
 * @param {Object} params - 请求参数
 */
export async function fetchOperationRecordList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_FINANCE}/v1/${organizationId}/deduction-action/page?supplierDeductionsId=${params.supplierDeductionsId}`,
    {
      method: 'GET',
      query,
    }
  );
}

/**
 * 确认
 * @param {Object} params - 请求参数
 */
export async function handleConfrim(params) {
  const { selectedRowKeys } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-confirmed`, {
    method: 'PUT',
    body: selectedRowKeys,
  });
}

/**
 * 退回
 * @param {Object} params - 请求参数
 */
export async function handleReturn(params) {
  const { dataSource } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-returned`, {
    method: 'PUT',
    body: dataSource,
  });
}
