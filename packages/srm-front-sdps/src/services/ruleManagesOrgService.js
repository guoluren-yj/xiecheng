/**
 * 规则配置 Service 租户级
 * @date: 2023-03-08
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */

import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function fetchOutList(params) {
  return request(
    `${SRM_DATA_PROCESS}/v1/${organizationId}/rule-management-headers/response-parameter`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export async function fetchOutPlatformList(params) {
  return request(`${SRM_DATA_PROCESS}/v1/rule-management-headers/response-parameter`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询指标列表
 * @param {*} params
 * @returns
 */
export async function fetchIndexList(params) {
  return request(
    `${SRM_DATA_PROCESS}/v1/${organizationId}/rule-management-lines/headerId/${params.ruleManagementHeaderId}?page=-1`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 试算结果
 * @param {*} params
 * @returns
 */
export async function fetchGetCalculationResult(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/cnf-actions/action-trial`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 上下线操作
 * @param {*} params
 * @returns
 */
export async function fetchChangeUpdate(params) {
  return request(`${SRM_DATA_PROCESS}/v1/${organizationId}/rule-management-headers`, {
    method: 'POST',
    body: params,
  });
}
