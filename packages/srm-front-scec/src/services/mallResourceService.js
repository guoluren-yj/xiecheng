/**
 * Drawer -商城资源
 * @date: 2019-11-20
 * @author lzj <zhijian.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SCEC } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

/**
 * 查询公司集团列表
 * @export
 * @param {object} params
 * @returns
 */
export async function fetchComanyInfo(params) {
  const param = parseParameters(params);
  const url = `${SRM_SCEC}/v1/mall-page-configs`;
  return request(url, {
    method: 'GET',
    query: param,
  });
}

/**
 * 新增数据
 * @param {Object} 新增的对象
 */
export async function addCompanyList(params) {
  const param = { ...params, tenantId: organizationId };
  const url = `${SRM_SCEC}/v1/mall-page-configs`;
  return request(url, {
    method: 'POST',
    body: param,
  });
}

/**
 * 编辑数据
 * @param {Object} 新增的对象
 */
export async function updateCompanyList(params) {
  const param = { ...params, tenantId: organizationId };
  const url = `${SRM_SCEC}/v1/mall-page-configs`;
  return request(url, {
    method: 'PUT',
    body: param,
  });
}
