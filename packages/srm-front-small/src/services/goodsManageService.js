/**
 * goodsManageService - 电商平台-商品上下架管理 - service
 * @date: 2019-2-9
 * @author: dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
import { SRM_MALL } from '_utils/config';

const organizationId = getCurrentOrganizationId();
/**
 * 商品上架/下架列表查询
 */
export async function fetchGoodsList(params) {
  let url = `${SRM_MALL}/v1/${organizationId}/product/listShelve`;
  const param = parseParameters(params);
  const { isGroup = false, ...other } = param;
  if (isGroup) {
    url = `${SRM_MALL}/v1/${organizationId}/product/group/listShelve`;
  }
  return request(url, {
    method: 'GET',
    query: other,
  });
}

/**
 * 当前公司值集查询
 */
export async function fetchCurrentCompanyValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 商品批量上架
 */
export async function batchPutAway(params) {
  let url = `${SRM_MALL}/v1/${organizationId}/product/shelve`;
  const { isGroup = false, list } = params;
  if (isGroup) {
    url = `${SRM_MALL}/v1/${organizationId}/product/group/shelve`;
  }
  return request(url, {
    method: 'POST',
    body: list,
  });
}

/**
 * 商品批量下架
 */
export async function batchUnShelve(params) {
  let url = `${SRM_MALL}/v1/${organizationId}/product/unshelve`;
  const { isGroup = false, list } = params;
  if (isGroup) {
    url = `${SRM_MALL}/v1/${organizationId}/product/group/unshelve`;
  }
  return request(url, {
    method: 'POST',
    body: list,
  });
}

/**
 * 查询操作记录
 */
export async function fetchHistoryRecord(params) {
  const param = parseParameters(params);
  const url = `${SRM_MALL}/v1/${organizationId}/product/history/${param.id}`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}
