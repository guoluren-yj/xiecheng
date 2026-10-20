/**
 * service - 8D审核
 * @date: 2018-11-27
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SQAM } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SQAM}/v1`;
const organizationId = getCurrentOrganizationId();

/**
 * 保证持续供货措施 ok
 */
export async function fetchContinueSupplier(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-supply-actions`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 短期措施 ok
 */
export async function fetchShortMeature(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-produce-actions`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 根本原因分析 ok
 */
export async function fetchRootReason(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-root-causes`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 永久纠正措施 ok
 */
export async function fetchCorrectActive(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-pca-actions`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 是否适用以下项目 ok
 */
export async function fetchApplyItem(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-applicable-items`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 相关标准化
 */
export async function fetchStandard(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/ed-problem-relevant-standards`, {
    method: 'GET',
    query: param,
  });
}

// 根据单号获取8D详情
export async function get8DDetailFromNum(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${organizationId}/problem-headers/query-by-problemNums`, {
    method: 'GET',
    query: param,
  });
}
