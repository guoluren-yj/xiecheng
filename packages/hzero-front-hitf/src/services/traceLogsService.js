import request from 'hzero-front/lib/utils/request';
import { HZERO_HITF, HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 获取日志存储类型
 */
export async function getStoreDbType() {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/trace-logs/storage/db/type`
      : `${HZERO_HITF}/v1/trace-logs/storage/db/type`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}
