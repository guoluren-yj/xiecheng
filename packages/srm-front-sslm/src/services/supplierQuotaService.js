/**
 * supplierQuotaService - 供应商配额service
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询配额分配管理列表
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchQuotaAsignList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询操作记录
 */
export async function fetchOperationRecords(params) {
  const { quotaHeaderId, ...others } = params;
  const query = filterNullValueObject(parseParameters(others));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-opr-historys/${quotaHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 解锁
 */
export async function unlock(params) {
  const { quotaHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/unlock/${quotaHeaderId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 启用／禁用
 */
export async function handleEnable(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 行发布
 */
export async function linePublish(params) {
  const { quotaHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/publish/submit/${quotaHeaderId}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 查询明细-头信息
 */
export async function fetchHeaderInfo(params) {
  const { quotaHeaderId, ...query } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/${quotaHeaderId}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询明细-配额分配
 */
export async function fetchQuotaAsign(params) {
  const { quotaHeaderId, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-lines/${quotaHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 删除配额分配
 */
export async function deleteQuotaAsign(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-lines`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 保存配额分配
 */
export async function saveQuotaAsign(params) {
  const { quotaHeaderId, tableValues, customizeUnitCode } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-lines/${quotaHeaderId}`, {
    method: 'POST',
    body: tableValues,
    query: { customizeUnitCode },
  });
}

/**
 * 头部大保存
 */
export async function allSave(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 头部发布
 */
export async function handleRelease(params) {
  const { customizeUnitCode, ...others } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/publish/saveAndSubmit`, {
    method: 'POST',
    body: others,
    query: { customizeUnitCode },
  });
}

/**
 * 查询配额管理报表
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchQuotaReportList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/report`, {
    method: 'GET',
    query,
  });
}

/**
 * 列表批量发布
 */
export async function handleBatchRelease(params) {
  const { customizeUnitCode, selectedRows } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/batchPublish`, {
    method: 'POST',
    body: selectedRows,
    query: { customizeUnitCode },
  });
}

// 配额复制
export async function dealCopy(params) {
  const { quotaHeaderId, ...rest } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/copy/${quotaHeaderId}`, {
    method: 'POST',
    body: rest,
  });
}

// 配额主数据历史版本
export async function queryHistoryList(params) {
  const { quotaAgreementNum, ...other } = params;
  const query = filterNullValueObject(parseParameters(other));
  return request(
    `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/history/${quotaAgreementNum}`,
    {
      method: 'GET',
      query,
    }
  );
}

// 查询tab需显示数量
export async function queryCounts(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/count`, {
    method: 'GET',
    query: params,
  });
}

// 批量禁用
export async function batchForbidden(params) {
  const { customizeUnitCode, selectedRows } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-quota-headers/batchForbidden`, {
    method: 'POST',
    body: selectedRows,
    query: { customizeUnitCode },
  });
}

// 删除单据
export async function deleteQuota(params) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/new-supplier-quota-headers/${params.quotaHeaderId}/delete`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}
