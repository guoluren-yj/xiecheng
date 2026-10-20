/**
 * service - 供应商事件配置
 * @date: 2020/7/22
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function batchDelete(lineData = []) {
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-lines/batchDelete`, {
    method: 'POST',
    body: lineData,
  });
}

/**
 * 查询所有条件规则配置
 * @param {*}
 * @returns
 */
export async function queryConditionalRule(params) {
  const { exportCfId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-filters/find/${exportCfId}`, {
    method: 'GET',
  });
}

/**
 * 条件规则配置保存
 * @param {*}
 * @returns
 */
export async function saveAllConditionalRule(params) {
  const { exportCfId, ...other } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-filters/update/${exportCfId}`, {
    method: 'POST',
    body: other,
  });
}

/**
 * 批量重新导入
 * @export
 * @param {Array} params
 * @returns
 */
export async function batchImportAgain(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-results/reSync`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重新查询
 * @export
 * @param {Array} params
 * @returns
 */
export async function handleReloadQuery(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-results/reSelect`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询接口报文
 * @export
 * @param {Array} params
 * @returns
 */
export async function fetchInterfaceData(params = {}) {
  const { exportResultId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/export-cf-results/message/${exportResultId}`, {
    method: 'GET',
  });
}
