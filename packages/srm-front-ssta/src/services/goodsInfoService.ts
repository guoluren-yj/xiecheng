import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${tenantId}`;

export async function querySupGoodsInfo(params: Record<string, any> = {})
{
  return request(`${apiPrefix}/direct-commoditys/list`, {
    method: 'GET',
    query: params,
  });
}

export async function queryPurGoodsInfo(params: Record<string, any> = {})
{
  return request(`${apiPrefix}/direct-commoditys/purchaser-list`, {
    method: 'GET',
    query: params,
  });
}

export async function querySupGoodsMapping(params: Record<string, any> = {})
{
  return request(`${apiPrefix}/direct-commodity-mappings/list`, {
    method: 'GET',
    query: params,
  });
}

export async function queryPurGoodsMapping(params: Record<string, any> = {})
{
  return request(`${apiPrefix}/direct-commodity-mappings/purchaser-list`, {
    method: 'GET',
    query: params,
  });
}