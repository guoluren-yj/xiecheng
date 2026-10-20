/**
 * scoreTmplService - 标准模板定义 - service
 * @date: 2018-08-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 *查询模板定义
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-indicators/std`, {
    method: 'GET',
    query: params,
  });
}

/**
 *保存模板定义
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function saveTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-indicators/std`, {
    method: 'POST',
    body: params,
  });
}

/**
 *更新模板定义
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function updateTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/score-indicators/std`, {
    method: 'PUT',
    body: params,
  });
}

/**
 *禁用
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function handleForbidden(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_SSLM}/v1/${organizationId}/${params.templateId}/score-indicators/${params.indicateId}/${
      params.isForbidden
    }`,
    {
      method: 'POST',
      body: params,
    }
  );
}
