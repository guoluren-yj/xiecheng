/**
 * supplierCategoryAlterService.js - 供应商分类变更申请 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询供应商分类变更申请列表
 * @param {Object} params - 查询参数
 */
export async function querySupplierCategoryAlter(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询供应商变更分类评分及评分等级
 * @param {Object} params - 查询参数
 */
export async function queryCategoryInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/information`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增或修改供应商分类变更
 * @param {Object} params - 新增或修改参数
 */
export async function saveSupplierCategoryAlter(params) {
  const {
    body: { customizeUnitCode = [], ...data },
  } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customizeUnitCode.join() },
  });
}

/**
 * 同意供应商分类变更申请
 * @param {Object} params
 */
export async function approveSupplierCategoryAlter(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/approved`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 拒绝供应商分类变更申请
 * @param {Object} params
 */
export async function rejectSupplierCategoryAlter(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/rejected`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存并提交供应商分类变更申请
 * @param {Array} params
 */
export async function submitSupplierCategoryAlter(params) {
  const {
    body: { customizeUnitCode = [], ...data },
  } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/submit`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customizeUnitCode.join() },
  });
}

/**
 * 批量提交供应商分类变更申请
 * @param {Array} params
 */
export async function batchSubmitSupplierCategoryAlter(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/batch-submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除供应商分类变更申请
 * @param {Array} params
 */
export async function deleteSupplierCategoryAlter(params) {
  const { categoryAlterId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/${categoryAlterId}`, {
    method: 'DELETE',
  });
}

/**
 * 查询供应商分类变更申请明细
 * @param {Array} params
 */
export async function querySupplierCategoryAlterDetail(params) {
  const { categoryAlterId, customizeUnitCode = [], ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/${categoryAlterId}`, {
    method: 'GET',
    query: { ...parseParameters(rest), customizeUnitCode: customizeUnitCode.join() },
  });
}

/**
 * 查询当前供应商分类
 * @param {Array} params
 */
export async function queryCurrentSupplierCtg(params) {
  const { customizeUnitCode = [], ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/queryAssign`, {
    method: 'GET',
    query: { ...parseParameters(rest), customizeUnitCode },
  });
}

/**
 * 查询操作记录
 * @param {Array} params
 */
export async function queryProcessRecord(params) {
  const { categoryAlterId, ...other } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/category-alter-process-record/${categoryAlterId}`,
    {
      method: 'GET',
      query: {
        ...other,
      },
    }
  );
}

// 删除供应商分类附件行表
export async function deleteAttachment(params) {
  const { attachmentLineIds, categoryAlterId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/category-alter-attachment-line/${categoryAlterId}`,
    {
      method: 'DELETE',
      body: attachmentLineIds,
    }
  );
}

/**
 *删除文件服务器中的文件
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function onDraggerUploadRemove(params) {
  const { bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}

/**
 * 工作台新建时查询供应商信息
 */
export async function querySupplierInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-workbench/line-company-info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * @description: 校验供应商分类变更申请
 * @param {*} params
 * @return {*}
 */
export async function checkSupplierCtgAlter(params) {
  const {
    body: { customizeUnitCode = [], ...data },
  } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/check`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode: customizeUnitCode.join() },
  });
}

/**
 * @description: 批量校验供应商分类变更申请
 * @param {*} params
 * @return {*}
 */
export async function batchCheckSupplierCtgAlter(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-alter/batch-check`, {
    method: 'POST',
    body: params,
  });
}
