/**
 * interfaceMonitorService - 接口监控 - service
 * @date: 2018-11-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_INTERFACE, SRM_INTERFACE_CONFIG } from '_utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

/**
 * 查询系统监控数据
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchMonitorSystem(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  return request(
    organizationRoleLevel
      ? `${SRM_INTERFACE}/v1/${organizationId}/monitor-systems`
      : `${SRM_INTERFACE_CONFIG}/v1/monitor-systems`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 保存系统监控数据
 * @export
 * @param {object} params
 * @returns
 */
export async function saveMonitorSystem(params) {
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  return request(
    organizationRoleLevel
      ? `${SRM_INTERFACE}/v1/${organizationId}/monitor-systems`
      : `${SRM_INTERFACE_CONFIG}/v1/monitor-systems`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询监控提醒字段
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchNoticeFields(params) {
  const param = parseParameters(params);
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  return request(
    organizationRoleLevel
      ? `${SRM_INTERFACE}/v1/${organizationId}/notice-fields`
      : `${SRM_INTERFACE_CONFIG}/v1/notice-fields`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 保存监控提醒字段
 * @export
 * @param {object} params
 * @returns
 */
export async function saveNoticeFields(params) {
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  return request(
    organizationRoleLevel
      ? `${SRM_INTERFACE}/v1/${organizationId}/notice-fields`
      : `${SRM_INTERFACE_CONFIG}/v1/notice-fields`,
    {
      method: 'POST',
      body: params,
    }
  );
}
