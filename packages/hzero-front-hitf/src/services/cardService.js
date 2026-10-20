/**
 * 工作台-接口
 * @author wanjun.feng@hand-china.com
 * @date 2021-1-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 查询注册服务和注册接口总数量
 */
export async function interfaceServerQuery(params) {
  const url = organizationRoleLevel
    ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/summary`
    : `${HZERO_HITF}/v1/interface-servers/summary`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询今日透传数量
 */
export async function interfaceServerInvokeQuery(params) {
  const url = organizationRoleLevel
    ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/invoke/summary`
    : `${HZERO_HITF}/v1/interface-servers/invoke/summary`;
  return request(url, {
    method: 'GET',
    query: params,
  });
}
