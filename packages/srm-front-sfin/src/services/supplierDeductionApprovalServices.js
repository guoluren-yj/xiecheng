/**
 * index.js - 供应商扣款审批
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
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
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/approval-page`, {
    method: 'GET',
    query,
  });
}

/**
 * 通过
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function approve(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/approval`, {
    method: 'POST',
    body,
  });
}

/**
 * 退回
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function returns(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/reject`, {
    method: 'POST',
    body,
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
