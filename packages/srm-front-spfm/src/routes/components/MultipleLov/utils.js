/**
 *  -utils Lov多选常用API
 * @date: 2020-09-09
 * @author: pengna <na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel, getResponse } from 'utils/utils';

/**
 * 查询 LOV 数据.
 * @param {string} url URL
 * @param {Object} params 参数
 */
export async function queryLovData(url, params) {
  const res = request(url, {
    query: params,
  });
  return getResponse(res);
}

/**
 * 查询 LOV 配置.
 * {HZERO_PLATFORM}/v1/lov-view/info
 * @param {Object} params 参数
 */
export async function queryLov(params) {
  const res = request(
    `${HZERO_PLATFORM}/v1/${
      isTenantRoleLevel() ? `${getCurrentOrganizationId()}/` : ''
    }lov-view/info`,
    {
      method: 'GET',
      query: params,
    }
  );
  return getResponse(res);
}
