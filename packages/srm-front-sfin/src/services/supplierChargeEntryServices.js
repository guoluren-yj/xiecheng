/**
 * index.js - 供应商扣款录入
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
// import { HZERO_PLATFORM } from 'utils/config';
import { SRM_PLATFORM, SRM_SPRM, SRM_FINANCE } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商列表
 * @param {Object} params - 请求参数
 */
export async function queryList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/page`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存数据
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-create-update`, {
    method: 'POST',
    body: body.lines,
  });
}

/**
 * 提交数据
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function submit(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-submit`, {
    method: 'POST',
    body,
  });
}

/**
 * 取消
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function handleCancel(data) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-cancel`, {
    method: 'POST',
    body: data.lines,
  });
}

/**
 *  删除
 * */
export async function deleteList(params) {
  const { body } = params;
  return request(`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/batch-delete`, {
    method: 'DELETE',
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

/**
 * 绑定行附件id
 * @async
 * @function bindHeaderAttachmentUuid
 * @param {object} query - 头数据
 * @returns {object} fetch Promise
 */
export async function bindLineAttachmentUuid(query) {
  const { supplierDeductionsId, ...otherQuery } = query;
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${supplierDeductionsId}/lines/attachment-uuid`,
    {
      method: 'POST',
      query: otherQuery,
    }
  );
}

/**
 * 查询配置
 */
export async function fetchSettings() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
  });
}
