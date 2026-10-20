/**
 * services - 招标变更/数据列表
 * @date: 2020-02-06
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${SRM_SSRC}/v1`;

/**
 * 查询招标变更列表 /v1/{organizationId}/bid/alterations  招标变更入口列表
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchDataList(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/alterations`, {
    method: 'GET',
    query: { ...param },
  });
}

// /v1/{organizationId}/bid/{bidHeaderId}/simple  点击时间地点变更调用查询
export async function fetchTimeAddressChange(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/simple`, {
    method: 'GET',
    query: { ...param },
  });
}

// /v1/{organizationId}/bid/{bidHeaderId}/alteration/submit  招标变更提交
export async function timeAddressChange(params) {
  const { organizationId, bidHeaderId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${organizationId}/bid/${bidHeaderId}/alteration/submit`, {
    method: 'POST',
    body: { ...param },
  });
}
