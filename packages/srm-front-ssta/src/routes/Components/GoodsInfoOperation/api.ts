import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export async function queryGoodsInfoActions(params: Record<string, any> = {}) {
  return request(`${apiPrefix}/direct-commodity-actions/list`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}

export async function queryGoodsMappingActions(params: Record<string, any> = {}) {
  return request(`${apiPrefix}/direct-commodity-mapping-actions/list`, {
    method: 'GET',
    query: { page: 0, size: 0, ...params },
  });
}