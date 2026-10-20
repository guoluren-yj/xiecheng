/*
 * @Author: your name
 * @Date: 2020-06-15 14:41:13
 * @LastEditTime: 2020-06-15 16:05:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \srm-front-sfin\src\services\supplierDeductionQueryService.js
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
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/sync`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function supplierDeductionSync(params) {
  const { selectedRows = [] } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/sync`, {
    method: 'POST',
    body: selectedRows,
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
