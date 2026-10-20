/**
 * 服务账号配置 -
 * @date: 2019-7-15
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config.js';

const tenantId = getCurrentOrganizationId();

export async function fetchList(params) {
  const param = parseParameters(params);
  return request(`${SRM_PLATFORM}/v1/${tenantId}/client/service-types/included/services`, {
    method: 'GET',
    query: { ...param },
  });
}

export async function fetchModalData(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/client/service-types`, {
    method: 'GET',
    query: { tenantId, ...params },
  });
}

export async function fetchSaveModalData(params) {
  return request(`${SRM_PLATFORM}/v1/${tenantId}/client/service-types`, {
    method: 'POST',
    body: { tenantId, ...params },
  });
}
