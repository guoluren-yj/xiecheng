/**
 * 风s事件报告
 * @date: 2024-02-06
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 查询风险定义详情
 * @async
 * @function fetchDefineDetail
 * @param {Object} params
 */
export async function fetchDefineDetail(params) {
  const { tenantId = '' } = params;
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan-score-config/risk-level`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

/**
 * 查询风险评分
 * @param {*} params
 * @returns
 */
export async function fetchScopeList(params) {
  const { tenantId = '' } = params;
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan-score-config/level-scope`, {
    method: 'GET',
    query: {
      ...params,
    },
  });
}

export async function fetchSaveDetail(param) {
  const { tenantId = '', params = {} } = param;
  return request(`${SRM_DATA_SDAT}/v1/${tenantId}/risk-scan-score-config/save-risk-level`, {
    method: 'POST',
    body: params,
  });
}
