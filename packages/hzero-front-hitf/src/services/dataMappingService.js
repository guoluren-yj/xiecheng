import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 *  头保存
 * @async
 * @function saveHeader
 * @param {object} data - 保存参数
 */
export async function saveHeader(data) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/cast-headers`
      : `${HZERO_HITF}/v1/cast-headers`,
    {
      method: 'POST',
      body: data,
    }
  );
}

/**
 *  启用
 * @async
 * @function enable
 * @param {object} data - 参数
 */
export async function enable(data) {
  const { castHeaderId } = data;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/cast-headers/${castHeaderId}/enable`
      : `${HZERO_HITF}/v1/cast-headers/${castHeaderId}/enable`,
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
  const { castHeaderId } = data;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/cast-headers/${castHeaderId}/disable`
      : `${HZERO_HITF}/v1/cast-headers/${castHeaderId}/disable`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 映射转化流程测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function mappingFlowTest(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/mapping-flow-test`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/mapping-flow-test`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 数据映射转化测试
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function dataMappingTest(params) {
  const { interfaceId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces/${interfaceId}/value-mapping-test`
      : `${HZERO_HITF}/v1/interfaces/${interfaceId}/value-mapping-test`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 数据映射-值转换查询
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function queryValueList(params) {
  const { castLineId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/data-mapping-targets/${castLineId}`
      : `${HZERO_HITF}/v1/data-mapping-targets/${castLineId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 数据映射-公式转换查询
 * @param {*} params
 * @returns {Promise<void>}
 */
export async function queryExpRules(params) {
  const { castLineId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/expr-rules/${castLineId}`
      : `${HZERO_HITF}/v1/expr-rules/${castLineId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}
