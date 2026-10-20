import request from 'utils/request';
// import { getCurrentOrganizationId } from 'utils/utils';
// import { getEnvConfig } from 'utils/iocUtils';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * fetchCompanyList: 查询公司列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCompanyList(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/monitor-tenant`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchAccountList: 获取子账户列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchAccountList(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/company-user`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取风险事件操作记录
 * @param {*} params
 * @returns
 */
export async function fetchOperationRecord(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/event-operate-log`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchDynamicDetail: 查询事件动态详情
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchDynamicDetail(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/event-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询监控信息
 * @param {*} params
 * @returns
 */
export async function fetchMonitorMsg(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/monitor-company`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供应商信息
 * @param {*} params
 * @returns
 */
export async function fetchSupplierMsg(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/is-partner-relation`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取新闻内容
 * @async
 * @function getNewsContent
 * @param {Object} params
 */
export async function getNewsContent(params) {
  return request(`${SRM_DATA_SDAT}/v1/event-generate-monitor/event-outer-detail`, {
    method: 'GET',
    query: { ...params },
  });
}
