/**
 * supplierService.js - 我的合作伙伴查询供应商 service
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 查询平台供应商列表
 * @param {Object} params - 查询参数
 */
export async function queryPlatformSupplier(params) {
  const query = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${params.tenantId}/partners/suppliers`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询 ERP 供应商列表
 * @param {Object} params - 查询参数
 */
export async function queryErpSupplier(params) {
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询 ERP 供应商详情
 * @param {Object} params - 查询参数
 * @param {!number} params.tenantId - 租户ID
 * @param {!number} params.supplierId - 供应商ID
 * @param {!String} [type='address|bank|contacts|sites'] - 查询信息类型 'address': 地址 ; 'bank': 银行账户 'contacts': 联系人 ; 'sites': 目录
 */
export async function queryErpSupplierDetail(params, type) {
  const urlMap = {
    address: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-address/${params.supplierId}`,
    bank: `${SRM_SSLM}/v1/${params.tenantId}/ext-sup-bank-accts/${params.supplierId}`,
    contacts: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-contacts/${params.supplierId}`,
    sites: `${SRM_SSLM}/v1/${params.tenantId}/ext-supplier-sites/${params.supplierId}`,
  };
  const requestUrl = urlMap[type];

  const { customizeUnitCode, desensitize = false } = params;

  return request(requestUrl, {
    method: 'GET',
    query: { customizeUnitCode, desensitize },
  });
}

/**
 * 启用供应商
 * @param {Object} params 修改参数
 */
export async function enablePartner(params) {
  const { tenantId, partnerId } = params;
  return request(`${SRM_PLATFORM}/v1/${tenantId}/partners/${partnerId}/enable`, {
    method: 'POST',
  });
}

/**
 * 禁用供应商
 * @param {Object} params 修改参数
 */
export async function disablePartner(params) {
  const { tenantId, partnerId } = params;
  return request(`${SRM_PLATFORM}/v1/${tenantId}/partners/${partnerId}/disable`, {
    method: 'POST',
  });
}

/**
 * 关联 ERP 供应商
 * @param {Object} params 修改参数
 */
export async function linkErpSupplier(params) {
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers/erps/link`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 取消关联 ERP 供应商
 * @param {Object} params 修改参数
 */
export async function unlinkErpSupplier(params) {
  return request(`${SRM_SSLM}/v1/${params.tenantId}/external-suppliers/erps/unlink`, {
    method: 'POST',
    body: params.list,
  });
}

/**
 * 查询分组
 * @param {Object} params 修改参数
 */
export async function queryGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-group`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 保存分组
 * @param {Object} params 修改参数
 */
export async function saveGroup(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 斯瑞德风险扫描内嵌页
 * @param {Object} params 修改参数
 */
export async function riskEmbedPage(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/query-monitor-enterprise`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 是否加入监控
 * @param {Object} params 修改参数
 */
export async function enableAddMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-function/getSetting`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 是否风险扫描
 * @param {Object} params 修改参数
 */
export async function enableRiskScan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan/getSetting`, {
    method: 'GET',
    query: params,
  });
}

export async function fetchBuildThridParty(params) {
  const { partnerId } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partners/${partnerId}/build-third-party`, {
    method: 'POST',
  });
}

/**
 * 是否加入监控
 * @param {Object} params 修改参数
 */
export async function fetchViewSignImg(params) {
  const { supplierCompanyId } = params;
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/seal/company/${supplierCompanyId}/purchase`,
    {
      method: 'GET',
    }
  );
}

/**
 * 保存
 * @param {Object} params 修改参数
 */
export async function handleSave(params) {
  const { customizeUnitCode = '', tableValues = [] } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/external-suppliers/batchSaveExternalCompany`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function queryRiskMonitorType(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/opened-service-query`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前租户开通风控的服务
 */
export async function handleQCCAddMonitor({ supplierCompanyId }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor/${supplierCompanyId}/add-monitor`, {
    method: 'POST',
  });
}

/**
 * 查询采购财务-头
 * @param {Object} params - 查询参数
 */
export async function queryPurchaseHeader(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf/queryPf`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询采购财务-行
 * @param {Object} params - 查询参数
 */
export async function queryPurchaseLine(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/ext-supplier-pf-line/queryPfLines`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}

// 批量分配第三方角色
export async function bacthAssignThirdRoles(params) {
  const { partnerId = '', selectedRows } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partners/assign-third-party-user/${partnerId}`, {
    method: 'POST',
    body: selectedRows,
  });
}

// 批量回收第三方角色
export async function bacthRecycleThirdRoles(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/partners/recycle-third-party-user`, {
    method: 'POST',
    body: params,
  });
}