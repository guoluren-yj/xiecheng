/**
 * 配置表service
 * relTableAccessService.js
 * @date: 2020-07-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_ADAPTOR } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();

/**
 * 对参数处理
 * 如果是租户级，tenant数据不改变
 * 如果是平台级，tenantId 存在，使用原始值，不存在 给平台通用 tenantId=0
 * @param {Object} params 参数
 */
function setTenantId(params = {}) {
  return tenantFlag
    ? params
    : {
        ...params,
        tenantId: params.tenantId !== undefined ? params.tenantId : 0,
      };
}

/**
 * 更新数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function updateRelTableAccessData(tableCode, params) {
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'PUT',
      body: setTenantId(params),
    }
  );
}

/**
 * 创建数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function createRelTableAccessData(tableCode, params) {
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'POST',
      body: setTenantId(params),
    }
  );
}

/**
 * 删除数据
 * @param {String} tableCode 配置表定义编码
 * @param {Object} params 参数
 */
export async function deleteRelTableAccessData(tableCode, params) {
  return request(
    `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${tableCode}`,
    {
      method: 'DELETE',
      body: setTenantId(params),
    }
  );
}
