import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPlanHeadTotal(params: { actionType: string }) {
  return request(`${SRM_SSTA}/v1/${organizationId}/plan-headers/page`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', ...params },
  });
}

/**
 * @description:列表页整单查询接口
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPlanLineTotal(params: { actionType: string }) {
  return request(`${SRM_SSTA}/v1/${organizationId}/plan-lines/line-page`, {
    method: 'GET',
    query: { page: 0, size: 1, onlyCountFlag: 'Y', ...params },
  });
}

/**
 * @description:查询付款计划历史版本
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPlanHistory(params: { planNum: string }) {
  return request(`${SRM_SSTA}/v1/${organizationId}/plan-headers/history/page`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}

/**
 * @description:查询付款计划操作记录
 * @param {object} params
 * @returns {object} fetch Promise
 */
export async function fetchPlanOperation(params: { planNum: string }) {
  const { planNum } = params;
  return request(`${SRM_SSTA}/v1/${organizationId}/plan-records/${planNum}`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}