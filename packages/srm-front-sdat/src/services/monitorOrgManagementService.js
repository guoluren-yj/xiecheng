/**
 * monitorService
 * @author qingxiang.luo@going-link.com
 * @date 2022-09-07
 * @copyright 2022 © ZhenYun
 */
import request from 'utils/request';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 查询列表
 * @async
 * @function getRiskScanUrl
 * @param {Object} params - 查询参数
 */
export async function getRiskScanUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan/risk-scan-url`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 获取报告下载列表
 * @async
 * @function getDownLoadUrl
 * @param {Object} params - 查询参数
 */
export async function getDownLoadUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/credit-qcc/download-url`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 查询列表
 * @async
 * @function fetchRemoveItem
 * @param {Object} params - 查询参数
 */
export async function fetchRemoveItem(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/remove-monitor`, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}

/**
 * 批量删除
 * @param {*} params
 * @returns
 */
export async function fetchRemoveRecords(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/remove-monitor`, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}

/**
 * 添加企业
 * @async
 * @function fetchAddBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/add-monitor`, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}

/**
 * 查询匹配到的企业
 * @async
 * @function fetchMatchBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchMatchBusiness(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/batch-fuzzy-search`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 查询监控企业头部信息
 * @async
 * @function fetchOrgHeaderMsg
 * @param {Object} params - 查询参数
 */
export async function fetchOrgHeaderMsg(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/query-service-quota`, {
    method: 'GET',
    query: { ...params, ...passParams },
  });
}

/**
 * 添加监控人
 * @async
 * @function fetchSaveMonitor
 * @param {Object} params - 查询参数
 */
export async function fetchSaveMonitor(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/manage-add-monitor`, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}

/**
 * 移除监控人
 * @async
 * @function fetchRemoveList
 * @param {Object} params - 查询参数
 */
export async function fetchRemoveList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/monitor-company/manage-remove-monitor `, {
    method: 'POST',
    body: { ...params, ...passParams },
  });
}
