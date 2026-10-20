import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 *  启用
 * @async
 * @function enable
 * @param {object} data - 参数
 */
export async function enable(data) {
  const { transformId } = data;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/transforms/${transformId}/enable`
      : `${HZERO_HITF}/v1/transforms/${transformId}/enable`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 *  禁用
 * @async
 * @function disable
 * @param {object} data - 参数
 */
export async function disable(data) {
  const { transformId } = data;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/transforms/${transformId}/disable`
      : `${HZERO_HITF}/v1/transforms/${transformId}/disable`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 字段映射转化流程测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function fieldMappingTest(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/field-mapping-test`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/field-mapping-test`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 抓取接口文档sourceContent和targetContent
 * @param {*} params
 */
export async function documentBodyContent(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/document-body-content`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/document-body-content`,
    {
      method: 'GET',
      query: params,
    }
  );
}
