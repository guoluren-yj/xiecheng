/**
 * 风s事件报告
 * @date: 2024-02-06
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 查询是否有权限
 * @async
 * @function fetchPagePermission
 * @param {Object} params
 */
export async function fetchPagePermission(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/risk-order-open`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询公司列表
 * @async
 * @function fetchCompanyList
 * @param {Object} params
 */
export async function fetchCompanyList(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/credit-qcc/search`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 生成报告
 * @async
 * @function fetGenerateReport
 * @param {Object} params
 */
export async function fetGenerateReport(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/risk-report-order`, {
    method: 'POST',
    body: params,
  });
}
