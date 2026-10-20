/**
 * acceptanceSheet.js - 验收单配置
 * @date: 2019-11-20
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询公司列表 不分页
 * @param {Object} params - 查询参数
 */
export async function queryCompany(params) {
  const param = parseParameters(params);
  return request(`/hpfm/v1/lovs/sql/data`, {
    method: 'GET',
    query: { lovCode: 'HPFM.COMPANY.NOTENCRYPT', tenantId: organizationId, ...param },
  });
}

/**
 * 查询供应商/物料列表
 * @param {Object} params - 查询参数
 */
export async function querySupplierOrItem(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-config-lines`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 查询供应商/物料详情
 * @param {Object} params - 查询参数
 */
export async function queryDetailSupplierOrItem(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-config-lines/lines/detail`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 保存供应商 || 物料
 * @param {Object} params - 查询参数
 */
export async function saveSupplier(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-config-headers`, {
    method: 'POST',
    body: { ...params },
  });
}

/**
 * 查询供应商头
 * @param {Object} params - 查询参数
 */
export async function queryHeader(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-config-headers`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 保存供应商 || 物料
 * @param {Object} params - 查询参数
 */
export async function deleteSupplier(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/accept-config-lines`, {
    method: 'DELETE',
    body: params,
  });
}
